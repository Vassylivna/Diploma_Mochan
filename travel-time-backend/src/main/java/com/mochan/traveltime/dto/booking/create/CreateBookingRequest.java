package com.mochan.traveltime.dto.booking.create;

import com.mochan.traveltime.model.BookingStatus;
import lombok.Data;

@Data
public class CreateBookingRequest {
    private Long tourId;
    private Double totalPrice;
    private Integer adultsCount;
    private Integer childrenCount;
    private Integer teensCount;
    private BookingStatus initialStatus;
}