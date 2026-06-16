package com.mochan.traveltime.mapper;

import com.mochan.traveltime.dto.booking.create.CreateBookingRequest;
import com.mochan.traveltime.dto.booking.get.BookingWithDetailsResponse;
import com.mochan.traveltime.model.Booking;
import com.mochan.traveltime.model.Tour;
import com.mochan.traveltime.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class BookingMapper {

    private final UserMapper userMapper;
    private final TourMapper tourMapper;

    public Booking createBookingRequestToBooking(CreateBookingRequest createBookingRequest, User user, Tour tour) {
        return Booking.builder()
                .user(user)
                .tour(tour)
                .adultsCount(createBookingRequest.getAdultsCount())
                .childrenCount(createBookingRequest.getChildrenCount())
                .teensCount(createBookingRequest.getTeensCount())
                .totalPrice(createBookingRequest.getTotalPrice())
                .status(createBookingRequest.getInitialStatus())
                .paymentCode(generateUniquePaymentCode())
                .createdAt(LocalDateTime.now())
                .build();
    }

    public BookingWithDetailsResponse toBookingWithDetailsResponse(Booking booking) {
        return BookingWithDetailsResponse.builder()
                .bookingId(booking.getBookingId())
                .user(userMapper.userToUserResponse(booking.getUser()))
                .tour(tourMapper.toTourWithDetailsResponse(booking.getTour()))
                .adultsCount(booking.getAdultsCount())
                .childrenCount(booking.getChildrenCount())
                .teensCount(booking.getTeensCount())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus())
                .cardNumberMasked(booking.getCardNumberMasked())
                .paymentCode(booking.getPaymentCode())
                .paymentDeadline(booking.getPaymentDeadline())
                .createdAt(booking.getCreatedAt())
                .confirmedAt(booking.getConfirmedAt())
                .build();
    }

    private String generateUniquePaymentCode() {
        return "TR-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }
}
