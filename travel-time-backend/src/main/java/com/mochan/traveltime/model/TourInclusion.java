package com.mochan.traveltime.model;

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
@Table(name = "tourInclusions")
public class TourInclusion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tourInclusionId;

    @ManyToOne
    @JoinColumn(name = "tourId")
    private Tour tour;

    private String itemDescription;
    private Boolean isIncluded;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TourInclusion other)) return false;

        return tourInclusionId != null && tourInclusionId.equals(other.getTourInclusionId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}