package com.mochan.traveltime.dto.stats;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ChartsResponse {
    private List<TimelineItemResponse> revenueTimeline;
    private List<ChartItemResponse> bookingStatus;
    private List<TopTourResponse> topTours;
    private List<DemographicItemResponse> demographics;
    private List<ChartItemResponse> transportUsage;
    private List<ChartItemResponse> revenueByCountry;
    private List<ChartItemResponse> hotelPreferences;
    private List<ChartItemResponse> userLoyalty;
}