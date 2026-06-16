package com.mochan.traveltime.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tourRouteEvents")
public class TourRouteEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tourRouteEventId;

    @ManyToOne
    @JoinColumn(name = "tourRouteStepId")
    private TourRouteStep tourRouteStep;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TourRouteEvent that)) return false;
        return tourRouteEventId != null && tourRouteEventId.equals(that.getTourRouteEventId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}