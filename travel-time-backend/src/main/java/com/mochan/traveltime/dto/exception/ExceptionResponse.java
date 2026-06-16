package com.mochan.traveltime.dto.exception;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ExceptionResponse {

    private int status;
    private String error;
    private String message;
}