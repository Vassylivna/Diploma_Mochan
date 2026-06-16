package com.mochan.traveltime.dto.stats;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DemographicItemResponse {
    private String name;
    private Integer count;
    private Double revenue;
}