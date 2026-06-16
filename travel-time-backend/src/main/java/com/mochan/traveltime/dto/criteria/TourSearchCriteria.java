package com.mochan.traveltime.dto.criteria;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourSearchCriteria {

    private String country;
    private String startCity;
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate dateFrom;
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate dateTo;
    private Double priceFrom;
    private Double priceTo;
    private Integer hotelStars;
    private String transportType;

    private String query;
    private Boolean showActive;
    private Boolean showHidden;
    private Boolean showArchived;

    private Boolean isArchived;
    private Boolean isHidden;

    private Boolean isComingSoon;
}
