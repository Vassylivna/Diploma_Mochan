package com.mochan.traveltime.controller;

import com.mochan.traveltime.dto.hotel.create.CreateHotelRequest;
import com.mochan.traveltime.dto.hotel.get.HotelWithDetailsResponse;
import com.mochan.traveltime.dto.hotel.update.UpdateHotelRequest;
import com.mochan.traveltime.service.HotelService;
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
@RequestMapping("/hotels")
@RequiredArgsConstructor
public class HotelController {

    private final HotelService hotelService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN','GUIDE')")
    public ResponseEntity<Page<HotelWithDetailsResponse>> getPaginatedHotels(
            @RequestParam(required = false) String searchTerm,
            @PageableDefault(size = 10, sort = "hotelId") Pageable pageable
    ) {
        log.info("Fetching paginated hotels. Search term: {}", searchTerm);

        Page<HotelWithDetailsResponse> hotelWithDetailsResponsePage = hotelService.getHotels(searchTerm, pageable);

        return new ResponseEntity<>(hotelWithDetailsResponsePage, HttpStatus.OK);
    }

    @GetMapping("/active")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<HotelWithDetailsResponse>> getAllActiveInToursHotels() {
        log.info("Fetching all active hotels in tours");

        List<HotelWithDetailsResponse> hotelWithDetailsResponseList = hotelService.getAllActiveHotels();

        return new ResponseEntity<>(hotelWithDetailsResponseList, HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<HotelWithDetailsResponse> createHotel(@RequestBody CreateHotelRequest createHotelRequest) {
        log.info("Creating new hotel");
        HotelWithDetailsResponse createdHotel = hotelService.createHotel(createHotelRequest);

        return new ResponseEntity<>(createdHotel, HttpStatus.OK);
    }

    @PutMapping("/{hotelId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<HotelWithDetailsResponse> updateHotel(@PathVariable Long hotelId, @RequestBody UpdateHotelRequest udpateHotelRequest) {
        log.info("Updating hotel ID: {}", hotelId);

        HotelWithDetailsResponse hotelWithDetailsResponse = hotelService.updateHotel(hotelId, udpateHotelRequest);

        return new ResponseEntity<>(hotelWithDetailsResponse, HttpStatus.OK);
    }

    @DeleteMapping("/{hotelId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteHotel(@PathVariable Long hotelId) {
        log.info("Deleting hotel ID: {}", hotelId);

        hotelService.deleteHotel(hotelId);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}