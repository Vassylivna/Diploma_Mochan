package com.mochan.traveltime.dto.hotel.get;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HotelSimpleResponse {
    private String name;
    private Integer stars;
}