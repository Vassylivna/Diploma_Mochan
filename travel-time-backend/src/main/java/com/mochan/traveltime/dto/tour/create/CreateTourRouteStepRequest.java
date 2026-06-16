package com.mochan.traveltime.dto.tour.create;

import lombok.Data;

import java.util.Set;

@Data
public class CreateTourRouteStepRequest {

    private Integer dayNumber;
    private Set<String> events;
}
