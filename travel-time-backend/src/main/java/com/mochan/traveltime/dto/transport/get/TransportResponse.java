package com.mochan.traveltime.dto.transport.get;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TransportResponse {

    private Long transportId;
    private String transportName;
    private String transportNumber;
    private String description;
}
