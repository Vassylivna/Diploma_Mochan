package com.mochan.traveltime.dto.tour.update;

import com.mochan.traveltime.dto.tour.create.CreateInclusionRequest;
import com.mochan.traveltime.dto.tour.create.CreateTourRouteStepRequest;
import com.mochan.traveltime.dto.tour.create.CreateTourStopRequest;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
public class UpdateTourRequest {

    private Long tourId;
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
    private Integer availableSeats;
    private Set<String> images;
    private Set<CreateInclusionRequest> inclusions;
    private Set<CreateTourRouteStepRequest> routeSteps;
    private Set<CreateTourStopRequest> stops;
}
