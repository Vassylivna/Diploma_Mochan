package com.mochan.traveltime.dto.stats;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class KpiResponse {
    private Double totalRevenue;
    private Integer totalBookings;
    private Double averageCheck;
    private Long activeUsers;
    private Double conversionRate;
    private Double averageLeadTime;
}