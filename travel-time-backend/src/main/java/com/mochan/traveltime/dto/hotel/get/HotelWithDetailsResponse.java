package com.mochan.traveltime.dto.hotel.get;

import com.mochan.traveltime.dto.hotel.HotelImageResponse;
import com.mochan.traveltime.dto.location.get.LocationResponse;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class HotelWithDetailsResponse {

    private Long hotelId;
    private LocationResponse location;
    private String name;
    private Integer stars;
    private String description;
    private List<HotelImageResponse> images;
}
