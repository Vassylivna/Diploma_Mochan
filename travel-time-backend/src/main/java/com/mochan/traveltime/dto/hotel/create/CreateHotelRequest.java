package com.mochan.traveltime.dto.hotel.create;

import lombok.Data;

import java.util.Set;

@Data
public class CreateHotelRequest {

    private String name;
    private Integer stars;
    private String description;
    private Long locationId;
    private Set<String> images;
}
