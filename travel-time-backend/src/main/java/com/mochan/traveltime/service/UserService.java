package com.mochan.traveltime.service;

import com.mochan.traveltime.dto.user.get.UserResponse;
import com.mochan.traveltime.dto.user.update.UpdatePasswordRequest;
import com.mochan.traveltime.dto.user.update.UpdateUserRequest;
import com.mochan.traveltime.exception.OperationNotAllowedException;
import com.mochan.traveltime.exception.PasswordMismatchException;
import com.mochan.traveltime.exception.ResourceConflictException;
import com.mochan.traveltime.exception.UserNotFoundException;
import com.mochan.traveltime.mapper.UserMapper;
import com.mochan.traveltime.model.AccountStatus;
import com.mochan.traveltime.model.Role;
import com.mochan.traveltime.model.User;
import com.mochan.traveltime.repository.TourRepository;
import com.mochan.traveltime.repository.UserRepository;
import com.mochan.traveltime.specification.UserSpecifications;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Log4j2
@Service
@RequiredArgsConstructor
@Transactional
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final TourRepository tourRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserResponse getUser(User user) {
        log.info("Fetching profile data for user ID: {}", user.getUserId());
        return userMapper.userToUserResponse(user);
    }

    @Override
    public UserDetails loadUserByUsername(String email) {
        log.info("Loading user details by email: {}", email);

        return userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("Load user failed: User not found for email: {}", email);
                    return new UserNotFoundException("Користувача з Email " + email + " не знайдено");
                });
    }

    public UserResponse updateProfile(User user, UpdateUserRequest updateUserRequest) {
        log.info("Processing profile update for user ID: {}", user.getUserId());

        if (updateUserRequest.getPhoneNumber() != null) {
            user.setPhoneNumber(updateUserRequest.getPhoneNumber());
        }

        User updatedUser = userRepository.save(user);

        log.info("Successfully updated profile for user ID: {}", updatedUser.getUserId());
        return userMapper.userToUserResponse(updatedUser);
    }

    public void changePassword(User user, UpdatePasswordRequest updatePasswordRequest) {
        log.info("Processing password change for user ID: {}", user.getUserId());

        if (!passwordEncoder.matches(updatePasswordRequest.getCurrentPassword(), user.getPassword())) {
            log.warn("Password change failed: Current password mismatch for user ID: {}", user.getUserId());
            throw new PasswordMismatchException("Вказаний поточний пароль є невірним");
        }

        user.setPassword(passwordEncoder.encode(updatePasswordRequest.getNewPassword()));
        userRepository.save(user);

        log.info("Successfully changed password for user ID: {}", user.getUserId());
    }

    public Page<UserResponse> getAllUsers(String search, String role, String status, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        log.info("Fetching all users with filters. Search: {}, Role: {}, Status: {}", search, role, status);

        Specification<User> specification = UserSpecifications.withFilters(search, role, status, startDate, endDate);

        Page<User> userPage = userRepository.findAll(specification, pageable);

        List<UserResponse> userResponseList = new ArrayList<>();

        for (User user : userPage.getContent()) {
            UserResponse response = userMapper.userToUserResponse(user);
            userResponseList.add(response);
        }

        return new PageImpl<>(userResponseList, pageable, userPage.getTotalElements());
    }

    public UserResponse updateUserByAdmin(Long userId, UpdateUserRequest updateUserRequest) {
        log.info("Admin processing update for user ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("Update user failed: User ID {} not found", userId);
                    return new UserNotFoundException("Користувача з Id " + userId + " не знайдено");
                });

        if (userId == 1L) {
            log.warn("Update user failed: Attempted to modify main admin permissions (ID 1)");
            throw new OperationNotAllowedException("Не можна змінювати права головного адміністратора");
        }

        if (user.getRole() == Role.GUIDE) {
            boolean isRoleChanging = updateUserRequest.getRole() != null && !updateUserRequest.getRole().equalsIgnoreCase("GUIDE");

            if (isRoleChanging && tourRepository.existsActiveTourWithGuide(userId)) {
                log.warn("Update user failed: Cannot change role for guide ID {} because they have active tours", userId);
                throw new ResourceConflictException("Неможливо змінити статус/роль гіда, у нього є активні тури");
            }
        }

        if (updateUserRequest.getRole() != null) {
            user.setRole(Role.valueOf(updateUserRequest.getRole().toUpperCase()));
        }
        if (updateUserRequest.getAccountStatus() != null){
            user.setAccountStatus(AccountStatus.valueOf(updateUserRequest.getAccountStatus().toUpperCase()));
        }
        if (updateUserRequest.getPhoneNumber() != null){
            user.setPhoneNumber(updateUserRequest.getPhoneNumber());
        }

        User updatedUser = userRepository.save(user);
        log.info("Successfully updated user ID: {}", updatedUser.getUserId());

        return userMapper.userToUserResponse(updatedUser);
    }

    public void deleteUser(Long userId) {
        log.info("Admin processing delete for user ID: {}", userId);

        if (userId == 1L) {
            log.warn("Delete user failed: Attempted to delete main admin (ID 1)");
            throw new OperationNotAllowedException("Не можна видалити головного адміністратора");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("Delete user failed: User ID {} not found", userId);
                    return new UserNotFoundException("Користувача з Id " + userId + " не знайдено");
                });

        if (user.getRole() == Role.GUIDE && tourRepository.existsActiveTourWithGuide(userId)) {
            log.warn("Delete user failed: Guide ID {} has active tours", userId);
            throw new ResourceConflictException("Неможливо видалити гіда, у нього є активні тури");
        }

        userRepository.softDeleteById(userId);
        log.info("Successfully soft-deleted user ID: {}", userId);
    }
}