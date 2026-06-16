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
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private TourRepository tourRepository;
    @Mock
    private UserMapper userMapper;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @Test
    void shouldGetUserSuccessfully() {
        User user = User.builder().userId(10L).build();
        UserResponse responseMock = UserResponse.builder().userId(10L).build();
        Mockito.when(userMapper.userToUserResponse(user)).thenReturn(responseMock);

        UserResponse result = userService.getUser(user);

        Assertions.assertThat(result.getUserId()).isEqualTo(10L);
        Mockito.verify(userMapper, Mockito.times(1)).userToUserResponse(user);
    }

    @Test
    void shouldLoadUserByUsernameSuccessfully() {
        String email = "test@gmail.com";
        User user = User.builder().email(email).build();
        Mockito.when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        UserDetails result = userService.loadUserByUsername(email);

        Assertions.assertThat(result.getUsername()).isEqualTo(email);
    }

    @Test
    void shouldThrowExceptionWhenLoadingUserByUnknownUsername() {
        String email = "unknown@gmail.com";
        Mockito.when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        Assertions.assertThatThrownBy(() -> userService.loadUserByUsername(email))
                .isInstanceOf(UserNotFoundException.class)
                .hasMessage("Користувача з Email " + email + " не знайдено");
    }

    @Test
    void shouldUpdateProfileSuccessfully() {
        User user = User.builder().userId(5L).phoneNumber("+380111111111").build();

        UpdateUserRequest request = new UpdateUserRequest();
        request.setPhoneNumber("+380999999999");

        User updatedUser = User.builder().userId(5L).phoneNumber("+380999999999").build();
        UserResponse responseMock = UserResponse.builder().userId(5L).phoneNumber("+380999999999").build();

        Mockito.when(userRepository.save(user)).thenReturn(updatedUser);
        Mockito.when(userMapper.userToUserResponse(updatedUser)).thenReturn(responseMock);

        UserResponse result = userService.updateProfile(user, request);

        Assertions.assertThat(result.getPhoneNumber()).isEqualTo("+380999999999");
        Mockito.verify(userRepository, Mockito.times(1)).save(user);
    }

    @Test
    void shouldUpdateProfileWithoutChangingPhoneNumberWhenNull() {
        User user = User.builder().userId(5L).phoneNumber("+380111111111").build();

        UpdateUserRequest request = new UpdateUserRequest();

        Mockito.when(userRepository.save(user)).thenReturn(user);
        Mockito.when(userMapper.userToUserResponse(user)).thenReturn(UserResponse.builder().phoneNumber("+380111111111").build());

        UserResponse result = userService.updateProfile(user, request);

        Assertions.assertThat(result.getPhoneNumber()).isEqualTo("+380111111111");
        Mockito.verify(userRepository, Mockito.times(1)).save(user);
    }

    @Test
    void shouldChangePasswordSuccessfully() {
        User user = User.builder().userId(2L).password("oldEncodedPassword").build();

        UpdatePasswordRequest request = new UpdatePasswordRequest();
        request.setCurrentPassword("oldPlainPassword");
        request.setNewPassword("newPlainPassword");

        Mockito.when(passwordEncoder.matches("oldPlainPassword", "oldEncodedPassword")).thenReturn(true);
        Mockito.when(passwordEncoder.encode("newPlainPassword")).thenReturn("newEncodedPassword");

        userService.changePassword(user, request);

        Assertions.assertThat(user.getPassword()).isEqualTo("newEncodedPassword");
        Mockito.verify(userRepository, Mockito.times(1)).save(user);
    }

    @Test
    void shouldThrowExceptionWhenChangingPasswordWithWrongCurrentPassword() {
        User user = User.builder().userId(2L).password("oldEncodedPassword").build();

        UpdatePasswordRequest request = new UpdatePasswordRequest();
        request.setCurrentPassword("wrongPlainPassword");
        request.setNewPassword("newPlainPassword");

        Mockito.when(passwordEncoder.matches("wrongPlainPassword", "oldEncodedPassword")).thenReturn(false);

        Assertions.assertThatThrownBy(() -> userService.changePassword(user, request))
                .isInstanceOf(PasswordMismatchException.class)
                .hasMessage("Вказаний поточний пароль є невірним");

        Mockito.verify(userRepository, Mockito.never()).save(any());
    }

    @Test
    void shouldGetAllUsers() {
        Pageable pageable = PageRequest.of(0, 10);
        User user = User.builder().userId(1L).build();
        Page<User> userPage = new PageImpl<>(List.of(user));

        Mockito.when(userRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(userPage);
        Mockito.when(userMapper.userToUserResponse(user)).thenReturn(UserResponse.builder().userId(1L).build());

        Page<UserResponse> result = userService.getAllUsers("search", "USER", "ACTIVE", null, null, pageable);

        Assertions.assertThat(result.getTotalElements()).isEqualTo(1);
        Assertions.assertThat(result.getContent().get(0).getUserId()).isEqualTo(1L);
    }

    @Test
    void shouldThrowExceptionWhenAdminUpdatesUnknownUser() {
        Mockito.when(userRepository.findById(99L)).thenReturn(Optional.empty());

        Assertions.assertThatThrownBy(() -> userService.updateUserByAdmin(99L, new UpdateUserRequest()))
                .isInstanceOf(UserNotFoundException.class)
                .hasMessage("Користувача з Id 99 не знайдено");
    }

    @Test
    void shouldThrowExceptionWhenUpdatingMainAdmin() {
        User mainAdmin = User.builder().userId(1L).role(Role.ADMIN).build();
        Mockito.when(userRepository.findById(1L)).thenReturn(Optional.of(mainAdmin));

        Assertions.assertThatThrownBy(() -> userService.updateUserByAdmin(1L, new UpdateUserRequest()))
                .isInstanceOf(OperationNotAllowedException.class)
                .hasMessage("Не можна змінювати права головного адміністратора");
    }

    @Test
    void shouldThrowExceptionWhenChangingRoleOfGuideWithActiveTours() {
        User guide = User.builder().userId(2L).role(Role.GUIDE).build();
        Mockito.when(userRepository.findById(2L)).thenReturn(Optional.of(guide));
        Mockito.when(tourRepository.existsActiveTourWithGuide(2L)).thenReturn(true);

        UpdateUserRequest request = new UpdateUserRequest();
        request.setRole("USER");

        Assertions.assertThatThrownBy(() -> userService.updateUserByAdmin(2L, request))
                .isInstanceOf(ResourceConflictException.class)
                .hasMessage("Неможливо змінити статус/роль гіда, у нього є активні тури");
    }

    @Test
    void shouldUpdateUserByAdminSuccessfully() {
        User user = User.builder().userId(2L).role(Role.USER).accountStatus(AccountStatus.ACTIVE).build();
        Mockito.when(userRepository.findById(2L)).thenReturn(Optional.of(user));

        UpdateUserRequest request = new UpdateUserRequest();
        request.setRole("GUIDE");
        request.setAccountStatus("BLOCKED");
        request.setPhoneNumber("+380123456789");

        Mockito.when(userRepository.save(user)).thenReturn(user);

        UserResponse responseMock = UserResponse.builder()
                .userId(2L)
                .role(Role.GUIDE)
                .accountStatus(AccountStatus.BLOCKED)
                .phoneNumber("+380123456789")
                .build();
        Mockito.when(userMapper.userToUserResponse(user)).thenReturn(responseMock);

        UserResponse result = userService.updateUserByAdmin(2L, request);

        Assertions.assertThat(user.getRole()).isEqualTo(Role.GUIDE);
        Assertions.assertThat(user.getAccountStatus()).isEqualTo(AccountStatus.BLOCKED);
        Assertions.assertThat(user.getPhoneNumber()).isEqualTo("+380123456789");

        Assertions.assertThat(result.getRole()).isEqualTo(Role.GUIDE);
        Mockito.verify(userRepository, Mockito.times(1)).save(user);
    }

    @Test
    void shouldThrowExceptionWhenDeletingMainAdmin() {
        Long mainAdminId = 1L;

        Assertions.assertThatThrownBy(() -> userService.deleteUser(mainAdminId))
                .isInstanceOf(OperationNotAllowedException.class)
                .hasMessage("Не можна видалити головного адміністратора");

        Mockito.verify(userRepository, Mockito.never()).softDeleteById(any());
    }

    @Test
    void shouldThrowExceptionWhenDeletingUnknownUser() {
        Mockito.when(userRepository.findById(99L)).thenReturn(Optional.empty());

        Assertions.assertThatThrownBy(() -> userService.deleteUser(99L))
                .isInstanceOf(UserNotFoundException.class)
                .hasMessage("Користувача з Id 99 не знайдено");
    }

    @Test
    void shouldThrowExceptionWhenDeletingGuideWithActiveTours() {
        User guide = User.builder().userId(3L).role(Role.GUIDE).build();
        Mockito.when(userRepository.findById(3L)).thenReturn(Optional.of(guide));
        Mockito.when(tourRepository.existsActiveTourWithGuide(3L)).thenReturn(true);

        Assertions.assertThatThrownBy(() -> userService.deleteUser(3L))
                .isInstanceOf(ResourceConflictException.class)
                .hasMessage("Неможливо видалити гіда, у нього є активні тури");

        Mockito.verify(userRepository, Mockito.never()).softDeleteById(any());
    }

    @Test
    void shouldDeleteUserSuccessfully() {
        User user = User.builder().userId(4L).role(Role.USER).build();
        Mockito.when(userRepository.findById(4L)).thenReturn(Optional.of(user));

        userService.deleteUser(4L);

        Mockito.verify(userRepository, Mockito.times(1)).softDeleteById(4L);
    }
}