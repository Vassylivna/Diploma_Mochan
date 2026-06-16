package com.mochan.traveltime.service;

import com.mochan.traveltime.dto.location.create.CreateLocationRequest;
import com.mochan.traveltime.dto.location.get.LocationResponse;
import com.mochan.traveltime.dto.location.update.UpdateLocationRequest;
import com.mochan.traveltime.exception.LocationNotFoundException;
import com.mochan.traveltime.exception.ResourceConflictException;
import com.mochan.traveltime.mapper.LocationMapper;
import com.mochan.traveltime.model.Location;
import com.mochan.traveltime.repository.LocationRepository;
import com.mochan.traveltime.repository.TourRepository;
import com.mochan.traveltime.specification.LocationSpecifications;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Log4j2
@Service
@RequiredArgsConstructor
@Transactional
public class LocationService {

    private final LocationRepository locationRepository;
    private final TourRepository tourRepository;
    private final LocationMapper locationMapper;

    public Page<LocationResponse> getLocations(String searchTerm, Pageable pageable) {
        log.info("Fetching paginated locations. Search term: {}", searchTerm);

        Specification<Location> specification = LocationSpecifications.withFilter(searchTerm);

        Page<Location> locationPage = locationRepository.findAll(specification, pageable);
        List<LocationResponse> locationResponseList = new ArrayList<>();

        for (Location location : locationPage.getContent()) {
            LocationResponse response = locationMapper.locationToLocationResponse(location);
            locationResponseList.add(response);
        }

        return new PageImpl<>(locationResponseList, pageable, locationPage.getTotalElements());
    }

    public List<LocationResponse> getAllActiveLocations() {
        log.info("Fetching all active locations");

        List<Location> locations = locationRepository.findAllByIsDeletedFalseOrderByCityNameAsc();

        List<LocationResponse> locationResponseList = new ArrayList<>(locations.size());

        for (Location location : locations) {
            LocationResponse response = locationMapper.locationToLocationResponse(location);
            locationResponseList.add(response);
        }

        return locationResponseList;
    }

    public LocationResponse createLocation(CreateLocationRequest createLocationRequest) {
        log.info("Processing create location request");

        Location location = locationMapper.toLocation(createLocationRequest);
        location.setIsDeleted(false);

        Location savedLocation = locationRepository.save(location);

        log.info("Successfully created location");

        return locationMapper.locationToLocationResponse(savedLocation);
    }

    public LocationResponse updateLocation(Long idLocation, UpdateLocationRequest updateLocationRequest) {
        log.info("Processing update for location ID: {}", idLocation);

        Location location = locationRepository.findById(idLocation)
                .orElseThrow(() -> {
                    log.warn("Update location failed: Location ID {} not found", idLocation);
                    return new LocationNotFoundException("Локацію з Id " + idLocation + " не знайдено");
                });

        locationMapper.updateLocationFromRequest(updateLocationRequest, location);

        Location updatedLocation = locationRepository.save(location);

        log.info("Successfully updated location ID: {}", idLocation);

        return locationMapper.locationToLocationResponse(updatedLocation);
    }

    public void deleteLocation(Long id) {
        log.info("Processing delete for location ID: {}", id);

        if (!locationRepository.existsById(id)) {
            log.warn("Delete location failed: Location ID {} not found", id);
            throw new LocationNotFoundException("Локацію з Id " + id + " не знайдено");
        }

        boolean isUsedInActiveTours = tourRepository.existsActiveTourWithLocation(id);

        if (isUsedInActiveTours) {
            log.warn("Delete location failed: Location ID {} is currently used in active or future tours", id);
            throw new ResourceConflictException("Неможливо видалити локацію, оскільки вона є частиною активних або майбутніх турів");
        }

        locationRepository.softDeleteById(id);
        log.info("Successfully soft-deleted location ID: {}", id);
    }
}
