package com.mochan.traveltime.dto.tour.get;

import com.mochan.traveltime.dto.hotel.get.HotelSimpleResponse;
import com.mochan.traveltime.dto.user.get.GuidePassengerResponse;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class GuideTourViewResponse {
    private Long tourId;
    private String title;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String startAddress;
    private String startCity;
    private String startCountry;
    
    private String transportName;
    private String transportNumber;
    
    private List<HotelSimpleResponse> hotels;
    
    private String guideFirstName;
    private String guideLastName;
    private String guidePhone;

    private Integer totalSeats;
    private Integer bookedSeats; // Сума місць PAID бронювань

    private List<GuidePassengerResponse> passengers;
}