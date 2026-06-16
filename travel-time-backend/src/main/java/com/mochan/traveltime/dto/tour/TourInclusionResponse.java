package com.mochan.traveltime.dto.tour;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TourInclusionResponse {

    private Long tourInclusionId;
    private String itemDescription;
    private Boolean isIncluded;
}
