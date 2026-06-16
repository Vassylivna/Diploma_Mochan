package com.mochan.traveltime.dto.tour.create;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
public class CreateTourRequest {

    private String title;
    private String description;
    private Long startLocationId;
    private String startAddress;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Long guideId;
    private Long transportId;
    private Double price;
    private Integer totalSeats;
    private Set<String> images;
    private Set<CreateInclusionRequest> inclusions;
    private Set<CreateTourRouteStepRequest> routeSteps;
    private Set<CreateTourStopRequest> stops;
}
