package com.mochan.traveltime.dto.hotel.update;

import lombok.Data;

import java.util.Set;

@Data
public class UpdateHotelRequest {

    private String name;
    private Integer stars;
    private String description;
    private Long locationId;
    private Set<String> images;
}
