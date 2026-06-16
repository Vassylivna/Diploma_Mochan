package com.mochan.traveltime.dto.user.update;

import lombok.Data;

@Data
public class UpdateUserRequest {

    private String phoneNumber;
    private String role;
    private String accountStatus;
}
