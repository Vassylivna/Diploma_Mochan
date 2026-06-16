package com.mochan.traveltime.dto.tour.get;

import com.mochan.traveltime.dto.tour.TourImageResponse;
import com.mochan.traveltime.dto.transport.get.TransportResponse;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
public class TourCardResponse {

    private Long tourId;
    private String title;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private TransportResponse transport;
    private Double price;
    private Integer totalSeats;
    private Integer availableSeats;
    private Set<TourImageResponse> images;
    private Set<String> tourCountries;
    private Integer stars;

    private Boolean isHidden;
    private Boolean isArchived;
}
