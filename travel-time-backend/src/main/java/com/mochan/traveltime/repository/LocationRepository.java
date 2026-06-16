package com.mochan.traveltime.repository;

import com.mochan.traveltime.model.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long>, JpaSpecificationExecutor<Location> {

    List<Location> findAllByIsDeletedFalseOrderByCityNameAsc();

    @Modifying
    @Query("UPDATE Location l SET l.isDeleted = true WHERE l.locationId = :locationId")
    void softDeleteById(@Param("locationId") Long locationId);

    Optional<Location> findByCityName(String cityName);
}