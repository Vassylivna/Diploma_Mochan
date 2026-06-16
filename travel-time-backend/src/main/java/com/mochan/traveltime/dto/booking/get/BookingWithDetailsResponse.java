package com.mochan.traveltime.dto.booking.get;

import com.mochan.traveltime.dto.tour.get.TourWithDetailsResponse;
import com.mochan.traveltime.dto.user.get.UserResponse;
import com.mochan.traveltime.model.BookingStatus;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class BookingWithDetailsResponse {

    private Long bookingId;
    private UserResponse user;
    private TourWithDetailsResponse tour;
    private Integer adultsCount;
    private Integer childrenCount;
    private Integer teensCount;
    private Double totalPrice;
    private BookingStatus status;
    private String cardNumberMasked;
    private String paymentCode;
    private LocalDateTime paymentDeadline;
    private LocalDateTime createdAt;
    private LocalDateTime confirmedAt;
}
