package com.mochan.traveltime.mapper;

import com.mochan.traveltime.dto.hotel.HotelImageResponse;
import com.mochan.traveltime.dto.hotel.create.CreateHotelRequest;
import com.mochan.traveltime.dto.hotel.get.HotelWithDetailsResponse;
import com.mochan.traveltime.dto.hotel.update.UpdateHotelRequest;
import com.mochan.traveltime.model.Hotel;
import com.mochan.traveltime.model.HotelImage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class HotelMapper {

    private final LocationMapper locationMapper;

    public Hotel createHotelRequestToHotel(CreateHotelRequest createHotelRequest) {
        return Hotel.builder()
                .name(createHotelRequest.getName())
                .stars(createHotelRequest.getStars())
                .description(createHotelRequest.getDescription())
                .isDeleted(false)
                .build();
    }

    public HotelWithDetailsResponse hotelToHotelWithDetailsResponse(Hotel hotel) {
        return HotelWithDetailsResponse.builder()
                .hotelId(hotel.getHotelId())
                .location(locationMapper.locationToLocationResponse(hotel.getLocation()))
                .name(hotel.getName())
                .stars(hotel.getStars())
                .description(hotel.getDescription())
                .images(getHotelResponseImages(hotel.getImages()))
                .build();
    }

    public void updateHotelFromRequest(UpdateHotelRequest updateHotelRequest, Hotel hotel) {
        if (updateHotelRequest == null) {
            return;
        }

        hotel.setName(updateHotelRequest.getName());
        hotel.setStars(updateHotelRequest.getStars());
        hotel.setDescription(updateHotelRequest.getDescription());
    }

    private List<HotelImageResponse> getHotelResponseImages(Set<HotelImage> images) {
        return images.stream()
                .map(hotelImage -> HotelImageResponse.builder()
                        .hotelImageId(hotelImage.getHotelImageId())
                        .imageUrl(hotelImage.getImageUrl())
                        .build())
                .collect(Collectors.toList());
    }

}
