package com.mochan.traveltime.repository;

import com.mochan.traveltime.model.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long>, JpaSpecificationExecutor<Hotel> {

    @Query("SELECT h FROM Hotel h JOIN FETCH h.location WHERE h.isDeleted = false ORDER BY h.name ASC")
    List<Hotel> findAllActiveWithLocation();

    @Modifying
    @Query("UPDATE Hotel h SET h.isDeleted = true WHERE h.hotelId = :hotelId")
    void softDeleteById(@Param("hotelId") Long hotelId);

    Optional<Hotel> findByName(String name);
}