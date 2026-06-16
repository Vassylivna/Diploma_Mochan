package com.mochan.traveltime.controller;

import com.mochan.traveltime.dto.location.create.CreateLocationRequest;
import com.mochan.traveltime.dto.location.get.LocationResponse;
import com.mochan.traveltime.dto.location.update.UpdateLocationRequest;
import com.mochan.traveltime.service.LocationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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

import java.util.List;

@Log4j2
@RestController
@RequestMapping("/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN', 'GUIDE')")
    public ResponseEntity<Page<LocationResponse>> getPaginatedLocations(
            @RequestParam(required = false) String searchTerm,
            @PageableDefault(size = 10, sort = "locationId") Pageable pageable
    ) {
        log.info("Fetching paginated locations. Search term: {}", searchTerm);

        Page<LocationResponse> locationResponsePage = locationService.getLocations(searchTerm, pageable);

        return new ResponseEntity<>(locationResponsePage, HttpStatus.OK);
    }

    @GetMapping("/active")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<LocationResponse>> getAllActiveInToursLocations() {
        log.info("Fetching all active locations in tours");

        List<LocationResponse> locationResponseList = locationService.getAllActiveLocations();

        return new ResponseEntity<>(locationResponseList, HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<LocationResponse> createLocation(@RequestBody CreateLocationRequest createLocationRequest) {
        log.info("Creating new location");

        LocationResponse createdLocation = locationService.createLocation(createLocationRequest);

        return new ResponseEntity<>(createdLocation, HttpStatus.CREATED);
    }

    @PutMapping("/{locationId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<LocationResponse> updateLocation(
            @PathVariable Long locationId,
            @RequestBody UpdateLocationRequest updateLocationRequest
    ) {
        log.info("Updating location ID: {}", locationId);

        LocationResponse locationResponse = locationService.updateLocation(locationId, updateLocationRequest);

        return new ResponseEntity<>(locationResponse, HttpStatus.OK);
    }

    @DeleteMapping("/{locationId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteLocation(@PathVariable Long locationId) {
        log.info("Deleting location ID: {}", locationId);

        locationService.deleteLocation(locationId);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
