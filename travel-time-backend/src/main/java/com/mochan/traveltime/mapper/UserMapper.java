package com.mochan.traveltime.mapper;

import com.mochan.traveltime.dto.user.create.RegisterUserRequest;
import com.mochan.traveltime.dto.user.get.UserResponse;
import com.mochan.traveltime.model.AccountStatus;
import com.mochan.traveltime.model.Role;
import com.mochan.traveltime.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse userToUserResponse(User user) {
        return UserResponse.builder()
                .userId(user.getUserId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .middleName(user.getMiddleName())
                .birthDate(user.getBirthDate())
                .phoneNumber(user.getPhoneNumber())
                .email(user.getEmail())
                .role(user.getRole())
                .accountStatus(user.getAccountStatus())
                .build();
    }

    public User toUserFromRegisterUserRequest(RegisterUserRequest registerUserRequest) {
        return User.builder()
                .firstName(registerUserRequest.getFirstName())
                .lastName(registerUserRequest.getLastName())
                .middleName(registerUserRequest.getMiddleName())
                .birthDate(registerUserRequest.getBirthDate())
                .phoneNumber(registerUserRequest.getPhoneNumber())
                .email(registerUserRequest.getEmail())
                .password(registerUserRequest.getPassword())
                .role(Role.USER)
                .accountStatus(AccountStatus.ACTIVE)
                .isDeleted(false)
                .build();
    }
}
