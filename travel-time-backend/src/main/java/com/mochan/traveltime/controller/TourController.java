package com.mochan.traveltime.controller;

import com.mochan.traveltime.dto.criteria.TourSearchCriteria;
import com.mochan.traveltime.dto.tour.create.CreateTourRequest;
import com.mochan.traveltime.dto.tour.get.GuideTourViewResponse;
import com.mochan.traveltime.dto.tour.get.TourCardResponse;
import com.mochan.traveltime.dto.tour.get.TourWithDetailsResponse;
import com.mochan.traveltime.dto.tour.update.UpdateTourRequest;
import com.mochan.traveltime.model.Role;
import com.mochan.traveltime.model.User;
import com.mochan.traveltime.service.TourService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Log4j2
@RequiredArgsConstructor
@RestController
@RequestMapping("/tours")
public class TourController {

    private final TourService tourService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN', 'GUIDE')")
    public ResponseEntity<Page<TourCardResponse>> getAllTourCards(
            @ModelAttribute TourSearchCriteria criteria,
            @PageableDefault(size = 9) Pageable pageable,
            @AuthenticationPrincipal User currentUser
    ) {
        log.info("Fetching tour cards for user ID: {}", currentUser.getUserId());

        Page<TourCardResponse> tourCardResponsePage = tourService.getAllTourCards(criteria, pageable, currentUser.getUserId(), currentUser.getRole());

        return new ResponseEntity<>(tourCardResponsePage, HttpStatus.OK);
    }

    @GetMapping("/{tourId}")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN', 'GUIDE')")
    public ResponseEntity<TourWithDetailsResponse> getTourDetails(@PathVariable Long tourId) {
        log.info("Fetching details for tour ID: {}", tourId);

        TourWithDetailsResponse tourWithDetailsResponse = tourService.getTourDetailsById(tourId);

        return new ResponseEntity<>(tourWithDetailsResponse, HttpStatus.OK);
    }

    @GetMapping("/{tourId}/guide-view")
    @PreAuthorize("hasAuthority('GUIDE')")
    public ResponseEntity<GuideTourViewResponse> getGuideTourView(@PathVariable Long tourId) {
        log.info("Fetching guide view for tour ID: {}", tourId);

        GuideTourViewResponse guideTourView = tourService.getGuideTourView(tourId);

        return new ResponseEntity<>(guideTourView, HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<TourWithDetailsResponse> createTour(@RequestBody CreateTourRequest createTourRequest) {
        log.info("Creating new tour");

        TourWithDetailsResponse tourWithDetailsResponse = tourService.createTour(createTourRequest);

        return new ResponseEntity<>(tourWithDetailsResponse, HttpStatus.CREATED);
    }

    @PutMapping("/{tourId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<TourWithDetailsResponse> updateTour(@PathVariable Long tourId, @RequestBody UpdateTourRequest updateTourRequest) {
        log.info("Updating tour ID: {}", tourId);

        TourWithDetailsResponse tourWithDetailsResponse = tourService.updateTour(tourId, updateTourRequest);

        return new ResponseEntity<>(tourWithDetailsResponse, HttpStatus.OK);
    }
    
    @PatchMapping("/{tourId}/archive")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<TourCardResponse> toggleArchive(@PathVariable Long tourId) {
        log.info("Toggling archive status for tour ID: {}", tourId);

        TourCardResponse tourCardResponse = tourService.toggleArchive(tourId);

        return new ResponseEntity<>(tourCardResponse, HttpStatus.OK);
    }

    @PatchMapping("/{tourId}/hide")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<TourCardResponse> toggleHidden(@PathVariable Long tourId) {
        log.info("Toggling hidden status for tour ID: {}", tourId);

        TourCardResponse tourCardResponse = tourService.toggleHidden(tourId);

        return new ResponseEntity<>(tourCardResponse, HttpStatus.OK);
    }

    @GetMapping("/active")
    @PreAuthorize("hasAuthority('GUIDE')")
    public ResponseEntity<TourCardResponse> getActiveTour(@AuthenticationPrincipal User currentUser) {
        log.info("Fetching active tour for guide ID: {}", currentUser.getUserId());

        TourCardResponse activeTour = tourService.getActiveTourForGuide(currentUser.getUserId());

        return new ResponseEntity<>(activeTour, HttpStatus.OK);
    }

    @DeleteMapping("/{tourId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteTour(@PathVariable Long tourId) {
        log.info("Deleting tour ID: {}", tourId);

        tourService.deleteTour(tourId);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
