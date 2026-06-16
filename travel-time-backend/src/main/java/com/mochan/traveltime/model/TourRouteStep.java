package com.mochan.traveltime.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tourRouteSteps")
public class TourRouteStep {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tourRouteStepId;

    @ManyToOne
    @JoinColumn(name = "tourId")
    private Tour tour;

    private Integer dayNumber;

    @OneToMany(mappedBy = "tourRouteStep", cascade = {CascadeType.PERSIST, CascadeType.MERGE}, orphanRemoval = true)
    private Set<TourRouteEvent> events;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TourRouteStep that)) return false;
        return tourRouteStepId != null && tourRouteStepId.equals(that.getTourRouteStepId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}