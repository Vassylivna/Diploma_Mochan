package com.mochan.traveltime.dto.transport.create;

import lombok.Data;

@Data
public class CreateTransportRequest {

    private String transportName;
    private String transportNumber;
    private String description;
}
