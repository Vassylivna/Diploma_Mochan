package com.mochan.traveltime.dto.hotel;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HotelImageResponse {

    private Long hotelImageId;
    private String imageUrl;
}
