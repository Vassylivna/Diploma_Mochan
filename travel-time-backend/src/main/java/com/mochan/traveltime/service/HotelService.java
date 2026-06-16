package com.mochan.traveltime.service;

import com.mochan.traveltime.dto.hotel.create.CreateHotelRequest;
import com.mochan.traveltime.dto.hotel.get.HotelWithDetailsResponse;
import com.mochan.traveltime.dto.hotel.update.UpdateHotelRequest;
import com.mochan.traveltime.exception.HotelNotFoundException;
import com.mochan.traveltime.exception.LocationNotFoundException;
import com.mochan.traveltime.exception.ResourceConflictException;
import com.mochan.traveltime.mapper.HotelMapper;
import com.mochan.traveltime.model.Hotel;
import com.mochan.traveltime.model.HotelImage;
import com.mochan.traveltime.model.Location;
import com.mochan.traveltime.repository.HotelRepository;
import com.mochan.traveltime.repository.LocationRepository;
import com.mochan.traveltime.repository.TourRepository;
import com.mochan.traveltime.specification.HotelSpecifications;
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
import java.util.Set;
import java.util.stream.Collectors;

@Log4j2
@Service
@RequiredArgsConstructor
@Transactional
public class HotelService {

    private final HotelRepository hotelRepository;
    private final LocationRepository locationRepository;
    private final TourRepository tourRepository;
    private final HotelMapper hotelMapper;

    public Page<HotelWithDetailsResponse> getHotels(String searchTerm, Pageable pageable) {
        log.info("Fetching paginated hotels. Search term: {}", searchTerm);

        Specification<Hotel> specification = HotelSpecifications.withFilter(searchTerm);

        Page<Hotel> hotelPage = hotelRepository.findAll(specification, pageable);
        List<HotelWithDetailsResponse> hotelWithDetailsResponseList = new ArrayList<>();

        for (Hotel hotel : hotelPage.getContent()) {
            HotelWithDetailsResponse response = hotelMapper.hotelToHotelWithDetailsResponse(hotel);
            hotelWithDetailsResponseList.add(response);
        }

        return new PageImpl<>(hotelWithDetailsResponseList, pageable, hotelPage.getTotalElements());
    }

    public List<HotelWithDetailsResponse> getAllActiveHotels() {
        log.info("Fetching all active hotels with locations");

        List<Hotel> hotels = hotelRepository.findAllActiveWithLocation();
        List<HotelWithDetailsResponse> hotelWithDetailsResponseList = new ArrayList<>();

        for (Hotel hotel : hotels) {
            HotelWithDetailsResponse response = hotelMapper.hotelToHotelWithDetailsResponse(hotel);
            hotelWithDetailsResponseList.add(response);
        }

        return hotelWithDetailsResponseList;
    }

    public HotelWithDetailsResponse createHotel(CreateHotelRequest createHotelRequest) {
        log.info("Processing create hotel request");

        Hotel hotel = hotelMapper.createHotelRequestToHotel(createHotelRequest);

        Location location = locationRepository.findById(createHotelRequest.getLocationId())
                .orElseThrow(() -> {
                    log.warn("Create hotel failed: Location ID {} not found", createHotelRequest.getLocationId());
                    return new LocationNotFoundException("Локацію з Id " + createHotelRequest.getLocationId() + " не знайдено");
                });

        hotel.setLocation(location);

        if (createHotelRequest.getImages() != null) {
            hotel.setImages(mapImages(createHotelRequest.getImages(), hotel));
            log.info("Mapped {} images for new hotel", createHotelRequest.getImages().size());
        }

        Hotel savedHotel = hotelRepository.save(hotel);
        log.info("Successfully created hotel ID: {}", savedHotel.getHotelId());

        return hotelMapper.hotelToHotelWithDetailsResponse(savedHotel);
    }

    public HotelWithDetailsResponse updateHotel(Long hotelId, UpdateHotelRequest updateHotelRequest) {
        log.info("Processing update for hotel ID: {}", hotelId);

        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> {
                    log.warn("Update hotel failed: Hotel ID {} not found", hotelId);
                    return new HotelNotFoundException("Готель з Id " + hotelId + " не знайдено");
                });

        hotelMapper.updateHotelFromRequest(updateHotelRequest, hotel);

        if (!hotel.getLocation().getLocationId().equals(updateHotelRequest.getLocationId())) {
            Location newLoc = locationRepository.findById(updateHotelRequest.getLocationId())
                    .orElseThrow(() -> {
                        log.warn("Update hotel failed: New location ID {} not found", updateHotelRequest.getLocationId());
                        return new LocationNotFoundException("Локацію з Id " + updateHotelRequest.getLocationId() + " не знайдено");
                    });
            hotel.setLocation(newLoc);
            log.info("Updated location for hotel ID: {} to location ID: {}", hotelId, newLoc.getLocationId());
        }

        if (updateHotelRequest.getImages() != null) {
            hotel.getImages().clear();
            hotel.getImages().addAll(mapImages(updateHotelRequest.getImages(), hotel));
            log.info("Updated images for hotel ID: {}", hotelId);
        }

        Hotel updatedHotel = hotelRepository.save(hotel);
        log.info("Successfully updated hotel ID: {}", updatedHotel.getHotelId());

        return hotelMapper.hotelToHotelWithDetailsResponse(updatedHotel);
    }

    public void deleteHotel(Long hotelId) {
        log.info("Processing delete for hotel ID: {}", hotelId);

        if (!hotelRepository.existsById(hotelId)) {
            log.warn("Delete hotel failed: Hotel ID {} not found", hotelId);
            throw new HotelNotFoundException("Готель з Id " + hotelId + " не знайдено");
        }

        boolean isUsed = tourRepository.existsActiveTourWithHotel(hotelId);

        if (isUsed) {
            log.warn("Delete hotel failed: Hotel ID {} is currently used in active or future tours", hotelId);
            throw new ResourceConflictException("Неможливо видалити готель, оскільки він використовується в активних або майбутніх турах");
        }

        hotelRepository.softDeleteById(hotelId);
        log.info("Successfully soft-deleted hotel ID: {}", hotelId);
    }

    private Set<HotelImage> mapImages(Set<String> urls, Hotel hotel) {
        return urls.stream()
                .map(url -> {
                    return HotelImage.builder()
                            .imageUrl(url)
                            .hotel(hotel)
                            .build();
                })
                .collect(Collectors.toSet());
    }
}