package com.mochan.traveltime.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tours")
public class Tour {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tourId;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "startLocationId")
    private Location startLocation;

    private String startAddress;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    @ManyToOne
    @JoinColumn(name = "guideId")
    private User guide;

    @ManyToOne
    @JoinColumn(name = "transportId")
    private Transport transport;

    private Double price;
    private Integer totalSeats;
    private Boolean isArchived = false;
    private Boolean isHidden = false;
    private Boolean isDeleted = false;

    @OneToMany(mappedBy = "tour", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("tourImageId ASC")
    private Set<TourImage> images;

    @OneToMany(mappedBy = "tour", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<TourInclusion> inclusions;

    @OneToMany(mappedBy = "tour", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("dayNumber ASC")
    private Set<TourRouteStep> routeSteps;
    
    @OneToMany(mappedBy = "tour", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("tourStopId ASC")
    private Set<TourStop> stops;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Tour tour)) return false;
        return tourId != null && tourId.equals(tour.getTourId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}