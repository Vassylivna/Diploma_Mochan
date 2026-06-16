package com.mochan.traveltime.dto.stats;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatsResponse {
    private PeriodInfoResponse periodInfoResponse;
    private KpiResponse kpi;
    private ChartsResponse charts;
}