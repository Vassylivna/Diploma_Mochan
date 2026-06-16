package com.mochan.traveltime.dto.tour.create;

import lombok.Data;

@Data
public class CreateTourStopRequest {

    private Long locationId;
    private Long hotelId; // Може бути null
}
