package com.mochan.traveltime.dto.stats;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class PeriodInfoResponse {
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Long daysCount;
}