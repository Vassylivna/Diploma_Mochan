package com.mochan.traveltime.dto.transport.update;

import lombok.Data;

@Data
public class UpdateTransportRequest {

    private String transportName;
    private String transportNumber;
    private String description;
}
