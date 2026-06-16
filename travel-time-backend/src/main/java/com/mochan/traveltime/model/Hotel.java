package com.mochan.traveltime.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "hotels")
public class Hotel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long hotelId;

    @ManyToOne
    @JoinColumn(name = "locationId", nullable = false)
    private Location location;

    private String name;
    private Integer stars;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Boolean isDeleted = false;
    
    @OneToMany(mappedBy = "hotel", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @OrderBy("hotelImageId ASC")
    private Set<HotelImage> images = new HashSet<>();

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Hotel hotel)) return false;
        return hotelId != null && hotelId.equals(hotel.getHotelId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}