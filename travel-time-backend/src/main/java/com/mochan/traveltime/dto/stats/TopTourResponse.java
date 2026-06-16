package com.mochan.traveltime.dto.stats;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TopTourResponse {
    private String name;
    private Integer sales;
    private Double revenue;
}