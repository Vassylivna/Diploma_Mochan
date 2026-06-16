package com.mochan.traveltime.dto.stats;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TimelineItemResponse {
    private String name;
    private Double value;
    private String fullDate;
}