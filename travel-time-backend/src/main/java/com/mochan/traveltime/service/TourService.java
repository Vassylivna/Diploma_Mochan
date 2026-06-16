package com.mochan.traveltime.service;

import com.mochan.traveltime.dto.criteria.TourSearchCriteria;
import com.mochan.traveltime.dto.tour.create.CreateInclusionRequest;
import com.mochan.traveltime.dto.tour.create.CreateTourRequest;
import com.mochan.traveltime.dto.tour.create.CreateTourRouteStepRequest;
import com.mochan.traveltime.dto.tour.create.CreateTourStopRequest;
import com.mochan.traveltime.dto.tour.get.GuideTourViewResponse;
import com.mochan.traveltime.dto.tour.get.TourCardResponse;
import com.mochan.traveltime.dto.tour.get.TourWithDetailsResponse;
import com.mochan.traveltime.dto.tour.update.UpdateTourRequest;
import com.mochan.traveltime.exception.HotelNotFoundException;
import com.mochan.traveltime.exception.LocationNotFoundException;
import com.mochan.traveltime.exception.ResourceConflictException;
import com.mochan.traveltime.exception.TourNotFoundException;
import com.mochan.traveltime.exception.TransportNotFoundException;
import com.mochan.traveltime.exception.UserNotFoundException;
import com.mochan.traveltime.mapper.TourMapper;
import com.mochan.traveltime.model.Booking;
import com.mochan.traveltime.model.BookingStatus;
import com.mochan.traveltime.model.Hotel;
import com.mochan.traveltime.model.Location;
import com.mochan.traveltime.model.Role;
import com.mochan.traveltime.model.Tour;
import com.mochan.traveltime.model.TourImage;
import com.mochan.traveltime.model.TourInclusion;
import com.mochan.traveltime.model.TourRouteEvent;
import com.mochan.traveltime.model.TourRouteStep;
import com.mochan.traveltime.model.TourStop;
import com.mochan.traveltime.model.Transport;
import com.mochan.traveltime.model.User;
import com.mochan.traveltime.repository.BookingRepository;
import com.mochan.traveltime.repository.HotelRepository;
import com.mochan.traveltime.repository.LocationRepository;
import com.mochan.traveltime.repository.TourRepository;
import com.mochan.traveltime.repository.TransportRepository;
import com.mochan.traveltime.repository.UserRepository;
import com.mochan.traveltime.specification.TourSpecifications;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

@Log4j2
@Service
@RequiredArgsConstructor
@Transactional
public class TourService {

    private static final List<BookingStatus> ACTIVE_STATUSES = List.of(BookingStatus.PAID, BookingStatus.AWAITING_PAYMENT, BookingStatus.PENDING_APPROVAL);

    private final TourRepository tourRepository;
    private final BookingRepository bookingRepository;
    private final LocationRepository locationRepository;
    private final TransportRepository transportRepository;
    private final UserRepository userRepository;
    private final HotelRepository hotelRepository;
    private final TourMapper tourMapper;

    public Page<TourCardResponse> getAllTourCards(TourSearchCriteria criteria, Pageable pageable, Long userId, Role role) {
        log.info("Fetching tour cards for user ID: {} with role: {}", userId, role);

        Specification<Tour> accessSpecification;
        Specification<Tour> filterSpec = TourSpecifications.withFilters(criteria);
        boolean showDeleted = false;

        if (role.equals(Role.ADMIN)) {
            accessSpecification = TourSpecifications.any();

            Sort adminSort = Sort.by(Sort.Direction.ASC, "isArchived")
                    .and(Sort.by(Sort.Direction.ASC, "isHidden"))
                    .and(Sort.by(Sort.Direction.DESC, "tourId"));

            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), adminSort);
        } else if (role.equals(Role.GUIDE)) {
            accessSpecification = TourSpecifications.assignedToGuide(userId);

            if (Boolean.TRUE.equals(criteria.getIsArchived())) {
                showDeleted = true;
            }

        } else {
            List<Long> bookedIds = userId != null ? bookingRepository.findTourIdsByUserIdAndStatus(userId, ACTIVE_STATUSES) : List.of();
            accessSpecification = TourSpecifications.hasAccess(bookedIds, false);
        }

        Specification<Tour> finalSpec = Specification.where(accessSpecification).and(filterSpec);

        if (!showDeleted) {
            finalSpec = finalSpec.and(TourSpecifications.notDeleted());
        }

        Page<Tour> tourPage = tourRepository.findAll(finalSpec, pageable);
        List<Tour> tours = tourPage.getContent();

        if (tours.isEmpty()) {
            return new PageImpl<>(new ArrayList<>(), pageable, tourPage.getTotalElements());
        }

        List<Long> tourIds = new ArrayList<>();
        for (Tour t : tours) {
            tourIds.add(t.getTourId());
        }

        List<BookingStatus> activeStatuses = List.of(BookingStatus.PAID, BookingStatus.AWAITING_PAYMENT, BookingStatus.PENDING_APPROVAL);

        List<Object[]> rawSeatsData = bookingRepository.countTotalParticipantsForTours(tourIds, activeStatuses);

        Map<Long, Integer> seatsMap = new HashMap<>();
        for (Object[] row : rawSeatsData) {
            Long tId = (Long) row[0];
            Long count = (Long) row[1];
            seatsMap.put(tId, count.intValue());
        }

        List<TourCardResponse> responseList = new ArrayList<>();
        for (Tour tour : tours) {
            TourCardResponse response = tourMapper.toTourCardResponse(tour);

            Integer bookedSeats = seatsMap.getOrDefault(tour.getTourId(), 0);

            int total = tour.getTotalSeats() != null ? tour.getTotalSeats() : 0;
            int available = Math.max(total - bookedSeats, 0);

            response.setAvailableSeats(available);
            responseList.add(response);
        }

        return new PageImpl<>(responseList, pageable, tourPage.getTotalElements());
    }

    public TourWithDetailsResponse getTourDetailsById(Long tourId) {
        log.info("Fetching details for tour ID: {}", tourId);

        Tour tour = tourRepository.findByIdWithDetailsAndIsDeletedFalse(tourId)
                .orElseThrow(() -> {
                    log.warn("Fetch tour details failed: Tour ID {} not found", tourId);
                    return new TourNotFoundException("Тур з Id " + tourId + " не знайдено");
                });

        Integer bookedSeats = bookingRepository.countTotalParticipants(tourId, ACTIVE_STATUSES);

        int maxPeople = tour.getTotalSeats() != null ? tour.getTotalSeats() : 0;
        int available = maxPeople - bookedSeats;

        TourWithDetailsResponse tourWithDetailsResponse = tourMapper.toTourWithDetailsResponse(tour);
        tourWithDetailsResponse.setAvailableSeats(Math.max(available, 0));

        return tourWithDetailsResponse;
    }

    public TourWithDetailsResponse createTour(CreateTourRequest createTourRequest) {
        log.info("Processing create tour request");

        Tour tour = tourMapper.createTourRequestToTour(createTourRequest);

        Location startLoc = locationRepository.findById(createTourRequest.getStartLocationId())
                .orElseThrow(() -> {
                    log.warn("Create tour failed: Start location ID {} not found", createTourRequest.getStartLocationId());
                    return new LocationNotFoundException("Стартова локація з Id " + createTourRequest.getStartLocationId() + " не знайдена");
                });
        tour.setStartLocation(startLoc);

        Transport transport = transportRepository.findById(createTourRequest.getTransportId())
                .orElseThrow(() -> {
                    log.warn("Create tour failed: Transport ID {} not found", createTourRequest.getTransportId());
                    return new TransportNotFoundException("Транспорт з Id " + createTourRequest.getTransportId() + " не знайдено");
                });
        tour.setTransport(transport);

        if (createTourRequest.getGuideId() != null) {
            User guide = userRepository.findById(createTourRequest.getGuideId())
                    .orElseThrow(() -> {
                        log.warn("Create tour failed: Guide ID {} not found", createTourRequest.getGuideId());
                        return new UserNotFoundException("Гід з Id " + createTourRequest.getGuideId() + " не знайдений");
                    });
            tour.setGuide(guide);
        }

        if (createTourRequest.getImages() != null) {
            tour.setImages(mapImages(createTourRequest.getImages(), tour));
        }

        if (createTourRequest.getInclusions() != null) {
            tour.setInclusions(mapInclusions(createTourRequest.getInclusions(), tour));
        }

        if (createTourRequest.getRouteSteps() != null) {
            tour.setRouteSteps(mapRouteSteps(createTourRequest.getRouteSteps(), tour));
        }

        if (createTourRequest.getStops() != null) {
            tour.setStops(mapStops(createTourRequest.getStops(), tour));
        }

        Tour savedTour = tourRepository.save(tour);
        log.info("Successfully created tour ID: {}", savedTour.getTourId());

        return tourMapper.toTourWithDetailsResponse(savedTour);
    }

    public TourWithDetailsResponse updateTour(Long tourId, UpdateTourRequest updateTourRequest) {
        log.info("Processing update for tour ID: {}", tourId);

        Tour tour = tourRepository.findByIdWithDetailsAndIsDeletedFalse(tourId)
                .orElseThrow(() -> {
                    log.warn("Update tour failed: Tour ID {} not found", tourId);
                    return new TourNotFoundException("Тур з Id " + tourId + " не знайдено");
                });

        if (!tour.getStartLocation().getLocationId().equals(updateTourRequest.getStartLocationId())) {
            Location newLoc = locationRepository.findById(updateTourRequest.getStartLocationId())
                    .orElseThrow(() -> {
                        log.warn("Update tour failed: New start location ID {} not found", updateTourRequest.getStartLocationId());
                        return new LocationNotFoundException("Локацію з Id " + updateTourRequest.getStartLocationId() + " не знайдено");
                    });
            tour.setStartLocation(newLoc);
        }

        if (!tour.getTransport().getTransportId().equals(updateTourRequest.getTransportId())) {
            Transport newTrans = transportRepository.findById(updateTourRequest.getTransportId())
                    .orElseThrow(() -> {
                        log.warn("Update tour failed: New transport ID {} not found", updateTourRequest.getTransportId());
                        return new TransportNotFoundException("Транспорт з Id " + updateTourRequest.getTransportId() + " не знайдено");
                    });
            tour.setTransport(newTrans);
        }

        Long newGuideId = updateTourRequest.getGuideId();
        Long currentGuideId = tour.getGuide() != null ? tour.getGuide().getUserId() : null;

        if (!Objects.equals(currentGuideId, newGuideId)) {
            if (newGuideId != null) {
                User newGuide = userRepository.findById(newGuideId)
                        .orElseThrow(() -> {
                            log.warn("Update tour failed: New guide ID {} not found", newGuideId);
                            return new UserNotFoundException("Гід з Id " + newGuideId + " не знайдений");
                        });
                tour.setGuide(newGuide);
            } else {
                tour.setGuide(null);
            }
        }

        if (updateTourRequest.getImages() != null) {
            tour.getImages().clear();
            if (!updateTourRequest.getImages().isEmpty()) {
                tour.getImages().addAll(mapImages(updateTourRequest.getImages(), tour));
            }
        }

        if (updateTourRequest.getInclusions() != null) {
            tour.getInclusions().clear();
            if (!updateTourRequest.getInclusions().isEmpty()) {
                tour.getInclusions().addAll(mapInclusions(updateTourRequest.getInclusions(), tour));
            }
        }

        if (updateTourRequest.getRouteSteps() != null) {
            tour.getRouteSteps().clear();
            if (!updateTourRequest.getRouteSteps().isEmpty()) {
                tour.getRouteSteps().addAll(mapRouteSteps(updateTourRequest.getRouteSteps(), tour));
            }
        }

        if (updateTourRequest.getStops() != null) {
            tour.getStops().clear();
            if (!updateTourRequest.getStops().isEmpty()) {
                tour.getStops().addAll(mapStops(updateTourRequest.getStops(), tour));
            }
        }

        Tour updatedTour = tourRepository.save(tour);
        log.info("Successfully updated tour ID: {}", updatedTour.getTourId());

        return tourMapper.toTourWithDetailsResponse(updatedTour);
    }

    public TourCardResponse toggleArchive(Long tourId) {
        log.info("Toggling archive status for tour ID: {}", tourId);

        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> {
                    log.warn("Toggle archive failed: Tour ID {} not found", tourId);
                    return new TourNotFoundException("Тур з Id " + tourId + " не знайдено");
                });

        tour.setIsArchived(!tour.getIsArchived());
        Tour savedTour = tourRepository.save(tour);

        log.info("Successfully toggled archive status for tour ID: {} (New status: {})", tourId, savedTour.getIsArchived());
        return tourMapper.toTourCardResponse(savedTour);
    }

    public TourCardResponse toggleHidden(Long tourId) {
        log.info("Toggling hidden status for tour ID: {}", tourId);

        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> {
                    log.warn("Toggle hidden failed: Tour ID {} not found", tourId);
                    return new TourNotFoundException("Тур з Id " + tourId + " не знайдено");
                });

        tour.setIsHidden(!tour.getIsHidden());
        Tour savedTour = tourRepository.save(tour);

        log.info("Successfully toggled hidden status for tour ID: {} (New status: {})", tourId, savedTour.getIsHidden());
        return tourMapper.toTourCardResponse(savedTour);
    }

    public void deleteTour(Long tourId) {
        log.info("Processing delete for tour ID: {}", tourId);

        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> {
                    log.warn("Delete tour failed: Tour ID {} not found", tourId);
                    return new TourNotFoundException("Тур з Id " + tourId + " не знайдено");
                });

        LocalDateTime now = LocalDateTime.now();

        if (tour.getEndDate().isBefore(now)) {
            tourRepository.softDeleteById(tourId);
            log.info("Successfully soft-deleted past tour ID: {}", tourId);
            return;
        }

        boolean hasActiveBookings = tourRepository.hasActiveBookings(tourId);

        if (hasActiveBookings) {
            log.warn("Delete tour failed: Tour ID {} has active or future bookings", tourId);
            throw new ResourceConflictException("Неможливо видалити активний або майбутній тур, на який є дійсні бронювання (Оплачені/Очікують/На перевірці)");
        }

        tourRepository.softDeleteById(tourId);
        log.info("Successfully soft-deleted tour ID: {}", tourId);
    }

    @Scheduled(cron = "0 * * * * *")
    public void autoUpdateTourStatuses() {
        log.info("Running scheduled task: Auto-updating tour statuses");

        LocalDateTime now = LocalDateTime.now();

        LocalDateTime hideThreshold = now.plusHours(26);
        tourRepository.markToursAsHiddenBeforeDate(hideThreshold);
        log.info("Completed marking tours as hidden based on threshold");

        LocalDateTime archiveThreshold = now.plusHours(24);
        List<Long> toursToArchive = tourRepository.findTourIdsReadyForArchiving(archiveThreshold);

        if (!toursToArchive.isEmpty()) {
            log.info("Found {} tours ready to be archived", toursToArchive.size());
            bookingRepository.autoCancelPendingBookings(toursToArchive);
            bookingRepository.autoRejectRefundRequests(toursToArchive);
            tourRepository.archiveToursByIds(toursToArchive);
            log.info("Successfully archived {} tours and updated their bookings", toursToArchive.size());
        } else {
            log.info("No tours found for archiving at this time");
        }
    }

    public GuideTourViewResponse getGuideTourView(Long tourId) {
        log.info("Fetching guide view for tour ID: {}", tourId);

        Tour tour = tourRepository.findByIdWithDetailsAndIsDeletedFalse(tourId)
                .orElseThrow(() -> {
                    log.warn("Fetch guide view failed: Tour ID {} not found", tourId);
                    return new TourNotFoundException("Тур з Id " + tourId + " не знайдено");
                });

        List<Booking> allBookings = bookingRepository.findAllByTourTourId(tourId);

        List<Booking> paidBookings = new ArrayList<>();

        for (Booking b : allBookings) {
            if (b.getStatus() == BookingStatus.PAID) {
                paidBookings.add(b);
            }
        }

        return tourMapper.toGuideTourViewDto(tour, paidBookings);
    }

    public TourCardResponse getActiveTourForGuide(Long guideId) {
        log.info("Fetching active tour for guide ID: {}", guideId);

        Optional<Tour> tourOptional = tourRepository.findActiveTourForGuide(guideId, LocalDateTime.now());

        if (tourOptional.isPresent()) {
            Tour tour = tourOptional.get();
            return tourMapper.toTourCardResponse(tour);
        }

        log.info("No active tour found for guide ID: {}", guideId);
        return null;
    }

    private Set<TourImage> mapImages(Set<String> imageUrls, Tour tour) {
        if (imageUrls == null) {
            return new HashSet<>();
        }

        Set<TourImage> images = new HashSet<>();
        for (String url : imageUrls) {
            TourImage image = TourImage.builder()
                    .imageUrl(url)
                    .tour(tour)
                    .build();
            images.add(image);
        }

        return images;
    }

    private Set<TourInclusion> mapInclusions(Set<CreateInclusionRequest> createInclusionRequests, Tour tour) {
        if (createInclusionRequests == null) {
            return new HashSet<>();
        }

        Set<TourInclusion> inclusions = new HashSet<>();
        for (CreateInclusionRequest request : createInclusionRequests) {
            TourInclusion inclusion = TourInclusion.builder()
                    .itemDescription(request.getItemDescription())
                    .isIncluded(request.getIsIncluded())
                    .tour(tour)
                    .build();
            inclusions.add(inclusion);
        }

        return inclusions;
    }

    private Set<TourRouteStep> mapRouteSteps(Set<CreateTourRouteStepRequest> createTourRouteStepRequests, Tour tour) {
        if (createTourRouteStepRequests == null) {
            return new HashSet<>();
        }

        Set<TourRouteStep> steps = new HashSet<>();
        for (CreateTourRouteStepRequest dto : createTourRouteStepRequests) {
            TourRouteStep step = TourRouteStep.builder()
                    .dayNumber(dto.getDayNumber())
                    .tour(tour)
                    .build();

            if (dto.getEvents() != null) {
                Set<TourRouteEvent> events = new HashSet<>();
                for (String evtDesc : dto.getEvents()) {
                    TourRouteEvent event = TourRouteEvent.builder()
                            .description(evtDesc)
                            .tourRouteStep(step)
                            .build();
                    events.add(event);
                }
                step.setEvents(events);
            }
            steps.add(step);
        }
        return steps;
    }

    private Set<TourStop> mapStops(Set<CreateTourStopRequest> createTourStopRequests, Tour tour) {
        if (createTourStopRequests == null) {
            return new HashSet<>();
        }

        Set<TourStop> stops = new HashSet<>();
        for (CreateTourStopRequest dto : createTourStopRequests) {
            Location loc = locationRepository.findById(dto.getLocationId())
                    .orElseThrow(() -> {
                        log.warn("Mapping stops failed: Location ID {} not found", dto.getLocationId());
                        return new LocationNotFoundException("Локацію зупинки з Id " + dto.getLocationId() + " не знайдено");
                    });

            Hotel hotel = null;
            if (dto.getHotelId() != null) {
                hotel = hotelRepository.findById(dto.getHotelId())
                        .orElseThrow(() -> {
                            log.warn("Mapping stops failed: Hotel ID {} not found", dto.getHotelId());
                            return new HotelNotFoundException("Готель з Id " + dto.getHotelId() + " не знайдено");
                        });
            }

            TourStop stop = TourStop.builder()
                    .tour(tour)
                    .location(loc)
                    .hotel(hotel)
                    .build();

            stops.add(stop);
        }

        return stops;
    }
}