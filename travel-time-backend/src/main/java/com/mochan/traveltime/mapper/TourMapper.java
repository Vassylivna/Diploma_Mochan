package com.mochan.traveltime.mapper;

import com.mochan.traveltime.dto.hotel.get.HotelSimpleResponse;
import com.mochan.traveltime.dto.tour.TourImageResponse;
import com.mochan.traveltime.dto.tour.TourInclusionResponse;
import com.mochan.traveltime.dto.tour.TourRouteEventResponse;
import com.mochan.traveltime.dto.tour.TourRouteStepResponse;
import com.mochan.traveltime.dto.tour.TourStopWithDetailsResponse;
import com.mochan.traveltime.dto.tour.create.CreateTourRequest;
import com.mochan.traveltime.dto.tour.get.GuideTourViewResponse;
import com.mochan.traveltime.dto.tour.get.TourCardResponse;
import com.mochan.traveltime.dto.tour.get.TourWithDetailsResponse;
import com.mochan.traveltime.dto.tour.update.UpdateTourRequest;
import com.mochan.traveltime.dto.user.get.GuidePassengerResponse;
import com.mochan.traveltime.model.Booking;
import com.mochan.traveltime.model.Hotel;
import com.mochan.traveltime.model.Tour;
import com.mochan.traveltime.model.TourImage;
import com.mochan.traveltime.model.TourInclusion;
import com.mochan.traveltime.model.TourRouteStep;
import com.mochan.traveltime.model.TourStop;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class TourMapper {

    private final UserMapper userMapper;
    private final LocationMapper locationMapper;
    private final TransportMapper transportMapper;
    private final HotelMapper hotelMapper;

    public Tour createTourRequestToTour(CreateTourRequest createTourRequest) {
        return Tour.builder()
                .title(createTourRequest.getTitle())
                .description(createTourRequest.getDescription())
                .startAddress(createTourRequest.getStartAddress())
                .startDate(createTourRequest.getStartDate())
                .endDate(createTourRequest.getEndDate())
                .price(createTourRequest.getPrice())
                .totalSeats(createTourRequest.getTotalSeats())
                .isDeleted(false)
                .isHidden(false)
                .isArchived(false)
                .build();
    }
    public TourWithDetailsResponse toTourWithDetailsResponse(Tour tour) {
        return TourWithDetailsResponse.builder()
                .tourId(tour.getTourId())
                .title(tour.getTitle())
                .description(tour.getDescription())
                .startLocation(locationMapper.locationToLocationResponse(tour.getStartLocation()))
                .startAddress(tour.getStartAddress())
                .startDate(tour.getStartDate())
                .endDate(tour.getEndDate())
                .guide(userMapper.userToUserResponse(tour.getGuide()))
                .transport(transportMapper.transportToTransportResponse(tour.getTransport()))
                .price(tour.getPrice())
                .totalSeats(tour.getTotalSeats())
                .images(getImages(tour.getImages()))
                .inclusions(getInclusions(tour.getInclusions()))
                .routeSteps(getRouteSteps(tour.getRouteSteps()))
                .stops(getStops(tour.getStops()))
                .build();
    }

    public TourCardResponse toTourCardResponse(Tour tour) {
        return TourCardResponse.builder()
                .tourId(tour.getTourId())
                .title(tour.getTitle())
                .description(tour.getDescription())
                .startDate(tour.getStartDate())
                .endDate(tour.getEndDate())
                .transport(transportMapper.transportToTransportResponse(tour.getTransport()))
                .price(tour.getPrice())
                .totalSeats(tour.getTotalSeats())
                .images(getImages(tour.getImages()))
                .tourCountries(getTourCountries(tour.getStops()))
                .stars(getHotelStars(tour.getStops()))
                .isHidden(tour.getIsHidden())
                .isArchived(tour.getIsArchived())
                .build();
    }

    public void updateLocationFromRequest(UpdateTourRequest updateTourRequest, Tour tour) {
        if (updateTourRequest == null) {
            return;
        }

        tour.setTitle(updateTourRequest.getTitle());
        tour.setDescription(updateTourRequest.getDescription());
        tour.setStartAddress(updateTourRequest.getStartAddress());
        tour.setStartDate(updateTourRequest.getStartDate());
        tour.setEndDate(updateTourRequest.getEndDate());
        tour.setPrice(updateTourRequest.getPrice());
        tour.setTotalSeats(updateTourRequest.getTotalSeats());
    }

    public GuideTourViewResponse toGuideTourViewDto(Tour tour, List<Booking> paidBookings) {
        List<GuidePassengerResponse> passengers = new ArrayList<>();
        int totalBookedSeats = 0;

        for (Booking booking : paidBookings) {
            int seats = (booking.getAdultsCount() != null ? booking.getAdultsCount() : 0) +
                    (booking.getChildrenCount() != null ? booking.getChildrenCount() : 0) +
                    (booking.getTeensCount() != null ? booking.getTeensCount() : 0);

            totalBookedSeats += seats;
            passengers.add(toGuidePassengerDto(booking, seats));
        }

        List<HotelSimpleResponse> hotels = new ArrayList<>();
        if (tour.getStops() != null) {
            hotels = tour.getStops().stream()
                    .filter(stop -> stop.getHotel() != null)
                    .map(this::toHotelSimpleDto)
                    .distinct()
                    .collect(Collectors.toList());
        }

        return GuideTourViewResponse.builder()
                .tourId(tour.getTourId())
                .title(tour.getTitle())
                .startDate(tour.getStartDate())
                .endDate(tour.getEndDate())
                .startAddress(tour.getStartAddress())
                .startCity(tour.getStartLocation() != null ? tour.getStartLocation().getCityName() : null)
                .startCountry(tour.getStartLocation() != null ? tour.getStartLocation().getCountryName() : null)
                .transportName(tour.getTransport() != null ? tour.getTransport().getTransportName() : null)
                .transportNumber(tour.getTransport() != null ? tour.getTransport().getTransportNumber() : null)
                .hotels(hotels)
                .guideFirstName(tour.getGuide() != null ? tour.getGuide().getFirstName() : null)
                .guideLastName(tour.getGuide() != null ? tour.getGuide().getLastName() : null)
                .guidePhone(tour.getGuide() != null ? tour.getGuide().getPhoneNumber() : null)
                .totalSeats(tour.getTotalSeats())
                .bookedSeats(totalBookedSeats)
                .passengers(passengers)
                .build();
    }

    private GuidePassengerResponse toGuidePassengerDto(Booking booking, int totalSeats) {
        return GuidePassengerResponse.builder()
                .bookingId(booking.getBookingId())
                .firstName(booking.getUser().getFirstName())
                .lastName(booking.getUser().getLastName())
                .middleName(booking.getUser().getMiddleName())
                .phoneNumber(booking.getUser().getPhoneNumber())
                .totalSeats(totalSeats)
                .status(booking.getStatus().name())
                .build();
    }

    private HotelSimpleResponse toHotelSimpleDto(TourStop stop) {
        return HotelSimpleResponse.builder()
                .name(stop.getHotel().getName())
                .stars(stop.getHotel().getStars())
                .build();
    }

    private Integer getHotelStars(Set<TourStop> stops) {
        return stops.stream()
                .map(TourStop::getHotel)
                .filter(Objects::nonNull)
                .map(Hotel::getStars)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Список зупинок порожній. Неможливо визначити зірковість готелю."));
    }

    private Set<String> getTourCountries(Set<TourStop> stops) {
        return stops.stream()
                .map(tourStop -> tourStop.getLocation().getCountryName())
                .collect(Collectors.toSet());
    }

    private Set<TourStopWithDetailsResponse> getStops(Set<TourStop> stops) {
        return stops.stream()
                .map(tourStop -> TourStopWithDetailsResponse.builder()
                        .tourStopId(tourStop.getTourStopId())
                        .location(locationMapper.locationToLocationResponse(tourStop.getLocation()))
                        .hotel(hotelMapper.hotelToHotelWithDetailsResponse(tourStop.getHotel()))
                        .build())
                .collect(Collectors.toSet());
    }

    private Set<TourRouteStepResponse> getRouteSteps(Set<TourRouteStep> routeSteps) {
        return routeSteps.stream()
                .map(tourRouteStep -> TourRouteStepResponse.builder()
                        .tourRouteStepId(tourRouteStep.getTourRouteStepId())
                        .dayNumber(tourRouteStep.getDayNumber())
                        .events(tourRouteStep.getEvents().stream()
                                .map(tourRouteEvent -> TourRouteEventResponse.builder()
                                        .tourRouteEventId(tourRouteEvent.getTourRouteEventId())
                                        .description(tourRouteEvent.getDescription())
                                        .build())
                                .collect(Collectors.toSet())
                        )
                        .build())
                .collect(Collectors.toSet());
    }

    private Set<TourInclusionResponse> getInclusions(Set<TourInclusion> inclusions) {
        return inclusions.stream()
                .map(tourIncl -> TourInclusionResponse.builder()
                        .tourInclusionId(tourIncl.getTourInclusionId())
                        .itemDescription(tourIncl.getItemDescription())
                        .isIncluded(tourIncl.getIsIncluded())
                        .build())
                .collect(Collectors.toSet());
    }

    private Set<TourImageResponse> getImages(Set<TourImage> images) {
        return images.stream()
                .map(tourImg -> TourImageResponse.builder()
                        .tourImageId(tourImg.getTourImageId())
                        .imageUrl(tourImg.getImageUrl())
                        .build())
                .collect(Collectors.toSet());
    }
}
