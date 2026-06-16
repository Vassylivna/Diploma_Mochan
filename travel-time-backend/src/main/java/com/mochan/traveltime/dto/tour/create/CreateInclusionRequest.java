package com.mochan.traveltime.dto.tour.create;

import lombok.Data;

@Data
public class CreateInclusionRequest {

    private String itemDescription;
    private Boolean isIncluded;
}
