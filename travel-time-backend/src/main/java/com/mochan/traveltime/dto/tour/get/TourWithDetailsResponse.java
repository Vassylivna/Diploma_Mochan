package com.mochan.traveltime.dto.tour.get;

import com.mochan.traveltime.dto.location.get.LocationResponse;
import com.mochan.traveltime.dto.tour.TourImageResponse;
import com.mochan.traveltime.dto.tour.TourInclusionResponse;
import com.mochan.traveltime.dto.tour.TourRouteStepResponse;
import com.mochan.traveltime.dto.tour.TourStopWithDetailsResponse;
import com.mochan.traveltime.dto.transport.get.TransportResponse;
import com.mochan.traveltime.dto.user.get.UserResponse;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
public class TourWithDetailsResponse {

    private Long tourId;
    private String title;
    private String description;
    private LocationResponse startLocation;
    private String startAddress;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private UserResponse guide;
    private TransportResponse transport;
    private Double price;
    private Integer totalSeats;
    private Integer availableSeats;
    private Set<TourImageResponse> images;
    private Set<TourInclusionResponse> inclusions;
    private Set<TourRouteStepResponse> routeSteps;
    private Set<TourStopWithDetailsResponse> stops;
}
