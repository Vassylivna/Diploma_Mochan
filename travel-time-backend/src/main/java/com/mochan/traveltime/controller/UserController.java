package com.mochan.traveltime.controller;

import com.mochan.traveltime.dto.user.get.UserResponse;
import com.mochan.traveltime.dto.user.update.UpdatePasswordRequest;
import com.mochan.traveltime.dto.user.update.UpdateUserRequest;
import com.mochan.traveltime.model.User;
import com.mochan.traveltime.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@Log4j2
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/current-user")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN', 'GUIDE')")
    public ResponseEntity<UserResponse> getProfile(@AuthenticationPrincipal User currentUser) {
        log.info("Fetching profile for current user");

        UserResponse userResponse = userService.getUser(currentUser);

        return new ResponseEntity<>(userResponse, HttpStatus.OK);
    }

    @PatchMapping("/current-user")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN', 'GUIDE')")
    public ResponseEntity<UserResponse> updateProfile(@AuthenticationPrincipal User currentUser, @RequestBody UpdateUserRequest updateUserRequest) {
        log.info("Updating profile for current user");

        UserResponse userResponse = userService.updateProfile(currentUser, updateUserRequest);

        return  new ResponseEntity<>(userResponse, HttpStatus.OK);
    }

    @PostMapping("/current-user/password")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN', 'GUIDE')")
    public ResponseEntity<Void> changePassword(@AuthenticationPrincipal User currentUser, @RequestBody UpdatePasswordRequest updatePasswordRequest) {
        log.info("Changing password for current user");

        userService.changePassword(currentUser, updatePasswordRequest);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @PageableDefault(size = 10, sort = "userId") Pageable pageable
    ) {
        log.info("Admin fetching all users. Role filter: {}, Status filter: {}", role, status);

        Page<UserResponse> userResponsePage = userService.getAllUsers(search, role, status, startDate, endDate, pageable);

        return new ResponseEntity<>(userResponsePage, HttpStatus.OK);
    }

    @DeleteMapping("/{userIdToDelete}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userIdToDelete) {
        log.info("Admin deleting user ID: {}", userIdToDelete);

        userService.deleteUser(userIdToDelete);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PatchMapping("/{userIdToUpdate}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UserResponse> updateUserByAdmin(@PathVariable Long userIdToUpdate, @RequestBody UpdateUserRequest updateUserRequest) {
        log.info("Admin updating user ID: {}", userIdToUpdate);

        UserResponse updatedUser = userService.updateUserByAdmin(userIdToUpdate, updateUserRequest);

        return new ResponseEntity<>(updatedUser, HttpStatus.OK);
    }
}