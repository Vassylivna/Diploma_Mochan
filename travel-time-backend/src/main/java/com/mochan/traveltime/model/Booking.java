package com.mochan.traveltime.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookingId;

    @ManyToOne
    @JoinColumn(name = "userId")
    private User user;

    @ManyToOne
    @JoinColumn(name = "tourId")
    private Tour tour;

    private Integer adultsCount;
    private Integer childrenCount;
    private Integer teensCount;
    private Double totalPrice;

    @Enumerated(EnumType.STRING)
    private BookingStatus status;

    private String cardNumberMasked;
    private String paymentCode;
    private LocalDateTime paymentDeadline;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime confirmedAt;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Booking booking)) return false;
        return bookingId != null && bookingId.equals(booking.getBookingId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}