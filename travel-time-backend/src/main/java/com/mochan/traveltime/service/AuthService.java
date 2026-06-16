package com.mochan.traveltime.service;

import com.mochan.traveltime.dto.user.create.LoginUserRequest;
import com.mochan.traveltime.dto.user.create.RegisterUserRequest;
import com.mochan.traveltime.dto.user.get.UserResponse;
import com.mochan.traveltime.exception.InvalidCredentialsException;
import com.mochan.traveltime.exception.OperationNotAllowedException;
import com.mochan.traveltime.exception.ResourceConflictException;
import com.mochan.traveltime.mapper.UserMapper;
import com.mochan.traveltime.model.AccountStatus;
import com.mochan.traveltime.model.User;
import com.mochan.traveltime.repository.UserRepository;
import lombok.extern.log4j.Log4j2;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Log4j2
@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserResponse login(LoginUserRequest loginUserRequest) {

        log.info("Processing login for email: {}", loginUserRequest.getEmail());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginUserRequest.getEmail(),
                        loginUserRequest.getPassword()
                )
        );

        User user = userRepository.findByEmail(loginUserRequest.getEmail())
                .orElseThrow(() -> {
                    log.warn("Login failed: User not found for email: {}", loginUserRequest.getEmail());
                    return new InvalidCredentialsException("Користувача не знайдено");
                });

        if (user.getAccountStatus() == AccountStatus.BLOCKED) {
            log.warn("Login failed: Account blocked for email: {}", loginUserRequest.getEmail());
            throw new OperationNotAllowedException("Акаунт заблоковано");
        }

        log.info("Successfully authenticated user: {}", loginUserRequest.getEmail());

        return userMapper.userToUserResponse(user);
    }

    public UserResponse register(RegisterUserRequest registerUserRequest) {

        log.info("Processing registration for email: {}", registerUserRequest.getEmail());

        if (userRepository.existsByEmail(registerUserRequest.getEmail())) {
            log.warn("Registration failed: Email already exists: {}", registerUserRequest.getEmail());
            throw new ResourceConflictException("Пошта зайнята");
        }

        User newUser = userMapper.toUserFromRegisterUserRequest(registerUserRequest);
        String encode = passwordEncoder.encode(newUser.getPassword());
        newUser.setPassword(encode);
        User savedUser = userRepository.save(newUser);

        log.info("Successfully registered new user with email: {}", savedUser.getEmail());

        return userMapper.userToUserResponse(savedUser);
    }
}