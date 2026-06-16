package com.mochan.traveltime.dto.user.get;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GuidePassengerResponse {
    private Long bookingId;
    private String firstName;
    private String lastName;
    private String middleName;
    private String phoneNumber;
    private Integer totalSeats;
    private String status;
}