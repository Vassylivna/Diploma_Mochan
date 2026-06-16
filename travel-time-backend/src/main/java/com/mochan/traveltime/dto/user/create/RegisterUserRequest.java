package com.mochan.traveltime.dto.user.create;

import lombok.Data;

import java.time.LocalDate;

@Data
public class RegisterUserRequest {

    private String firstName;
    private String lastName;
    private String middleName;
    private LocalDate birthDate;
    private String phoneNumber;
    private String email;
    private String password;
}
