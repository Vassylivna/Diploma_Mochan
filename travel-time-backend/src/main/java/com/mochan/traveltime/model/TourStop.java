package com.mochan.traveltime.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tourStops")
public class TourStop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tourStopId;

    @ManyToOne
    @JoinColumn(name = "tourId")
    private Tour tour;

    @ManyToOne
    @JoinColumn(name = "locationId", nullable = false)
    private Location location;

    @ManyToOne
    @JoinColumn(name = "hotelId")
    private Hotel hotel; // Може бути null

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TourStop that)) return false;
        return tourStopId != null && tourStopId.equals(that.getTourStopId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}