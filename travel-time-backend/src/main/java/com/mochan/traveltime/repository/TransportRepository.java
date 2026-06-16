package com.mochan.traveltime.repository;

import com.mochan.traveltime.model.Transport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TransportRepository extends JpaRepository<Transport, Long>, JpaSpecificationExecutor<Transport> {

    @Modifying
    @Query("UPDATE Transport t SET t.isDeleted = true WHERE t.transportId = :transportId")
    void softDeleteById(@Param("transportId") Long transportId);

    Optional<Transport> findByTransportNumber(String transportNumber);
}
