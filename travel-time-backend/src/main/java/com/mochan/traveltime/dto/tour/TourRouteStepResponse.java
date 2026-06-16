package com.mochan.traveltime.dto.tour;

import lombok.Builder;
import lombok.Data;

import java.util.Set;

@Data
@Builder
public class TourRouteStepResponse {

    private Long tourRouteStepId;
    private Integer dayNumber;
    private Set<TourRouteEventResponse> events;
}
