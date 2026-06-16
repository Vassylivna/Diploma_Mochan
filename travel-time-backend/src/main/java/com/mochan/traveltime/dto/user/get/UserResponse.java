package com.mochan.traveltime.dto.user.get;

import com.mochan.traveltime.model.AccountStatus;
import com.mochan.traveltime.model.Role;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class UserResponse {

    private Long userId;
    private String firstName;
    private String lastName;
    private String middleName;
    private LocalDate birthDate;
    private String phoneNumber;
    private String email;
    private Role role;
    private AccountStatus accountStatus;
}
