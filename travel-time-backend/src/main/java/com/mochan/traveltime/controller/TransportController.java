package com.mochan.traveltime.controller;

import com.mochan.traveltime.dto.transport.create.CreateTransportRequest;
import com.mochan.traveltime.dto.transport.get.TransportResponse;
import com.mochan.traveltime.dto.transport.update.UpdateTransportRequest;
import com.mochan.traveltime.service.TransportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@Log4j2
@RestController
@RequestMapping("/transports")
@RequiredArgsConstructor
public class TransportController {

    private final TransportService transportService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public ResponseEntity<Page<TransportResponse>> getPaginatedTransports(
            @RequestParam(required = false) String searchTerm,
            @PageableDefault(size = 10, sort = "transportId") Pageable pageable
    ) {
        log.info("Fetching paginated transports. Search term: {}", searchTerm);

        Page<TransportResponse> transports = transportService.getTransports(searchTerm, pageable);

        return new ResponseEntity<>(transports, HttpStatus.OK);
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public ResponseEntity<List<TransportResponse>> getAllActiveInToursTransports(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        log.info("Fetching active transports from {} to {}", startDate, endDate);

        List<TransportResponse> allActiveTransports = transportService.getAllActiveTransports(startDate, endDate);

        return new ResponseEntity<>(allActiveTransports, HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<TransportResponse> createTransport(@RequestBody CreateTransportRequest createTransportRequest) {
        log.info("Creating new transport");

        TransportResponse createdTransport = transportService.createTransport(createTransportRequest);

        return new ResponseEntity<>(createdTransport, HttpStatus.CREATED);
    }

    @PutMapping("/{transportId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<TransportResponse> updateTransport(
            @PathVariable Long transportId,
            @RequestBody UpdateTransportRequest updateTransportRequest
    ) {
        log.info("Updating transport ID: {}", transportId);

        TransportResponse transportResponse = transportService.updateTransport(transportId, updateTransportRequest);

        return new ResponseEntity<>(transportResponse, HttpStatus.OK);
    }

    @DeleteMapping("/{transportId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteTransport(@PathVariable Long transportId) {
        log.info("Deleting transport ID: {}", transportId);

        transportService.deleteTransport(transportId);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}