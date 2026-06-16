package com.mochan.traveltime.dto.tour;

import com.mochan.traveltime.dto.hotel.get.HotelWithDetailsResponse;
import com.mochan.traveltime.dto.location.get.LocationResponse;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TourStopWithDetailsResponse {

    private Long tourStopId;
    private LocationResponse location;
    private HotelWithDetailsResponse hotel; // Може бути null
}
