package com.mochan.traveltime.dto.user.update;

import lombok.Data;

@Data
public class UpdatePasswordRequest {

    private String currentPassword;
    private String newPassword;
}
