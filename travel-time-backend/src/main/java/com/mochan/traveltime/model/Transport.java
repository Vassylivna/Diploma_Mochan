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
@Table(name = "transports")
public class Transport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long transportId;

    private String transportName;
    private String transportNumber;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Boolean isDeleted = false;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Transport transport)) return false;
        return transportId != null && transportId.equals(transport.getTransportId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}