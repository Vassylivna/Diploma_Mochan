package com.mochan.traveltime.repository;

import com.mochan.traveltime.model.Booking;
import com.mochan.traveltime.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long>, JpaSpecificationExecutor<Booking> {

    @Query("SELECT b FROM Booking b " +
            "JOIN FETCH b.user " +
            "WHERE b.tour.tourId = :tourId")
    List<Booking> findAllByTourTourId(@Param("tourId") Long tourId);

    @Query("SELECT b FROM Booking b " +
            "JOIN FETCH b.user " +
            "JOIN FETCH b.tour")
    List<Booking> findAllWithDetails();

    @Query("SELECT b.tour.tourId FROM Booking b " +
            "WHERE b.user.userId = :userId " +
            "AND b.status IN :statuses")
    List<Long> findTourIdsByUserIdAndStatus(
            @Param("userId") Long userId,
            @Param("statuses") Collection<BookingStatus> statuses
    );

    List<Booking> findAllByStatusAndPaymentDeadlineBefore(BookingStatus status, LocalDateTime dateTime);

    @Query("SELECT COALESCE(SUM(" +
            "  COALESCE(b.adultsCount, 0) + " +
            "  COALESCE(b.childrenCount, 0) + " +
            "  COALESCE(b.teensCount, 0)" +
            "), 0) " +
            "FROM Booking b " +
            "WHERE b.tour.tourId = :tourId " +
            "AND b.status IN :statuses")
    Integer countTotalParticipants(
            @Param("tourId") Long tourId,
            @Param("statuses") Collection<BookingStatus> statuses
    );

    @Query("SELECT b.tour.tourId, CAST(SUM(" +
            "  COALESCE(b.adultsCount, 0) + " +
            "  COALESCE(b.childrenCount, 0) + " +
            "  COALESCE(b.teensCount, 0)" +
            ") AS long) " +
            "FROM Booking b " +
            "WHERE b.tour.tourId IN :tourIds " +
            "AND b.status IN :statuses " +
            "GROUP BY b.tour.tourId")
    List<Object[]> countTotalParticipantsForTours(
            @Param("tourIds") Collection<Long> tourIds,
            @Param("statuses") Collection<BookingStatus> statuses
    );

    @Modifying
    @Query("UPDATE Booking b SET b.status = 'CANCELLED' " +
            "WHERE b.tour.tourId IN :tourIds " +
            "AND b.status = 'PENDING_APPROVAL'")
    void autoCancelPendingBookings(@Param("tourIds") List<Long> tourIds);

    @Modifying
    @Query("UPDATE Booking b SET b.status = 'PAID' " +
            "WHERE b.tour.tourId IN :tourIds " +
            "AND b.status = 'REFUND_REQUESTED'")
    void autoRejectRefundRequests(@Param("tourIds") List<Long> tourIds);
}