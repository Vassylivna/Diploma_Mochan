package com.mochan.traveltime.dto.tour;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TourImageResponse {

    private Long tourImageId;
    private String imageUrl;
}
