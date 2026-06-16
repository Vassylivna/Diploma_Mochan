package com.mochan.traveltime.dto.user.create;

import lombok.Data;

@Data
public class LoginUserRequest {

    private String email;
    private String password;
}
