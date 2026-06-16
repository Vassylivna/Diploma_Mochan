package com.mochan.traveltime.controller;

import com.mochan.traveltime.dto.user.create.LoginUserRequest;
import com.mochan.traveltime.dto.user.create.RegisterUserRequest;
import com.mochan.traveltime.dto.user.get.UserResponse;
import com.mochan.traveltime.jwt.JwtService;
import com.mochan.traveltime.model.User;
import com.mochan.traveltime.service.AuthService;
import com.mochan.traveltime.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Log4j2
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final AuthService authService;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@RequestBody LoginUserRequest loginUserRequest) {
        log.info("Login user with email: {}", loginUserRequest.getEmail());

        UserResponse loggedUserResponse = authService.login(loginUserRequest);

        User user = (User) userService.loadUserByUsername(loginUserRequest.getEmail());

        String jwt = jwtService.generateToken(user);
        ResponseCookie jwtCookie = jwtService.generateJwtCookie(jwt);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .body(loggedUserResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody RegisterUserRequest registerUserRequest) {
        log.info("Register new user with email: {}", registerUserRequest.getEmail());

        UserResponse registeredUserResponse = authService.register(registerUserRequest);

        User user = (User) userService.loadUserByUsername(registerUserRequest.getEmail());

        String jwt = jwtService.generateToken(user);
        ResponseCookie jwtCookie = jwtService.generateJwtCookie(jwt);

        return ResponseEntity.status(HttpStatus.CREATED)
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .body(registeredUserResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        log.info("Processing logout request");

        ResponseCookie cleanCookie = jwtService.getCleanJwtCookie();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cleanCookie.toString())
                .build();
    }
}