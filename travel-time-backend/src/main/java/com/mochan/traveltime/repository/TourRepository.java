package com.mochan.traveltime.repository;

import com.mochan.traveltime.model.Tour;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TourRepository extends JpaRepository<Tour, Long>, JpaSpecificationExecutor<Tour> {

    @Query("SELECT DISTINCT t FROM Tour t " +
            "LEFT JOIN FETCH t.guide " +
            "LEFT JOIN FETCH t.startLocation " +
            "LEFT JOIN FETCH t.transport " +
            "LEFT JOIN FETCH t.images " +
            "LEFT JOIN FETCH t.inclusions " +
            "LEFT JOIN FETCH t.routeSteps rs " +
            "LEFT JOIN FETCH rs.events " +
            "LEFT JOIN FETCH t.stops s " +
            "LEFT JOIN FETCH s.location " +
            "LEFT JOIN FETCH s.hotel " +
            "WHERE t.tourId = :tourId AND t.isDeleted = false")
    Optional<Tour> findByIdWithDetailsAndIsDeletedFalse(@Param("tourId") Long tourId);

    @EntityGraph(attributePaths = {"startLocation"})
    Page<Tour> findAll(Specification<Tour> spec, Pageable pageable);

    @Query("SELECT COUNT(t) > 0 FROM Tour t " +
            "LEFT JOIN t.stops s " +
            "WHERE (t.startLocation.locationId = :locationId OR s.location.locationId = :locationId) " +
            "AND t.isDeleted = false " +
            "AND t.endDate >= CURRENT_TIMESTAMP")
    boolean existsActiveTourWithLocation(@Param("locationId") Long locationId);

    @Query("SELECT COUNT(t) > 0 FROM Tour t " +
            "WHERE t.transport.transportId = :transportId " +
            "AND t.isDeleted = false " +
            "AND t.endDate >= CURRENT_TIMESTAMP")
    boolean existsActiveTourWithTransport(@Param("transportId") Long transportId);

    @Query("SELECT COUNT(t) > 0 FROM Tour t " +
            "JOIN t.stops s " +
            "WHERE s.hotel.hotelId = :hotelId " +
            "AND t.isDeleted = false " +
            "AND t.endDate >= CURRENT_TIMESTAMP")
    boolean existsActiveTourWithHotel(@Param("hotelId") Long hotelId);

    @Query("SELECT COUNT(t) > 0 FROM Tour t WHERE t.guide.userId = :guideId AND t.isDeleted = false AND t.endDate >= CURRENT_TIMESTAMP")
    boolean existsActiveTourWithGuide(@Param("guideId") Long guideId);

    @Modifying
    @Query("UPDATE Tour t SET t.isDeleted = true WHERE t.tourId = :tourId")
    void softDeleteById(@Param("tourId") Long tourId);

    @Query("SELECT COUNT(b) > 0 FROM Booking b " +
            "WHERE b.tour.tourId = :tourId " +
            "AND b.status IN ('PAID', 'AWAITING_PAYMENT', 'PENDING_APPROVAL')")
    boolean hasActiveBookings(@Param("tourId") Long tourId);

    Optional<Tour> findByTitle(String title);

    @Query("SELECT t.tourId FROM Tour t " +
            "WHERE t.startDate <= :threshold " +
            "AND t.isArchived = false " +
            "AND t.isDeleted = false")
    List<Long> findTourIdsReadyForArchiving(@Param("threshold") LocalDateTime threshold);

    @Modifying
    @Query("UPDATE Tour t SET t.isArchived = true " +
            "WHERE t.tourId IN :tourIds " +
            "AND t.isArchived = false " +
            "AND t.isDeleted = false")
    void archiveToursByIds(@Param("tourIds") List<Long> tourIds);

    @Modifying
    @Query("UPDATE Tour t SET t.isHidden = true " +
            "WHERE t.startDate <= :threshold " +
            "AND t.isHidden = false " +
            "AND t.isArchived = false " +
            "AND t.isDeleted = false")
    void markToursAsHiddenBeforeDate(@Param("threshold") LocalDateTime threshold);

    @Query("SELECT t FROM Tour t " +
            "WHERE t.guide.userId = :guideId " +
            "AND t.isDeleted = false " +
            "AND :now BETWEEN t.startDate AND t.endDate")
    Optional<Tour> findActiveTourForGuide(@Param("guideId") Long guideId, @Param("now") LocalDateTime now);
}