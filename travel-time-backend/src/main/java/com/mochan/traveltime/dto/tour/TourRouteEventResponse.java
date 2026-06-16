package com.mochan.traveltime.dto.tour;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TourRouteEventResponse {

    private Long tourRouteEventId;
    private String description;
}
