package com.mochan.traveltime.model;

import jakarta.persistence.*;
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
@Table(name = "tourImages")
public class TourImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tourImageId;

    @ManyToOne
    @JoinColumn(name = "tourId")
    private Tour tour;

    private String imageUrl;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TourImage that)) return false;
        return tourImageId != null && tourImageId.equals(that.getTourImageId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}