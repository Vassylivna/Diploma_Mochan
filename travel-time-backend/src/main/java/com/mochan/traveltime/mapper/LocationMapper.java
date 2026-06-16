package com.mochan.traveltime.mapper;

import com.mochan.traveltime.dto.location.create.CreateLocationRequest;
import com.mochan.traveltime.dto.location.get.LocationResponse;
import com.mochan.traveltime.dto.location.update.UpdateLocationRequest;
import com.mochan.traveltime.model.Location;
import org.springframework.stereotype.Component;

@Component
public class LocationMapper {

    public LocationResponse locationToLocationResponse(Location location) {
        return LocationResponse.builder()
                .locationId(location.getLocationId())
                .countryName(location.getCountryName())
                .cityName(location.getCityName())
                .regionName(location.getRegionName())
                .build();
    }

    public Location toLocation(CreateLocationRequest createLocationRequest) {
        return Location.builder()
                .cityName(createLocationRequest.getCityName())
                .countryName(createLocationRequest.getCountryName())
                .regionName(createLocationRequest.getRegionName())
                .build();
    }

    public void updateLocationFromRequest(UpdateLocationRequest updateLocationRequest, Location location) {
        if (updateLocationRequest == null) {
            return;
        }

        location.setCountryName(updateLocationRequest.getCountryName());
        location.setCityName(updateLocationRequest.getCityName());
        location.setRegionName(updateLocationRequest.getRegionName());
    }
}
