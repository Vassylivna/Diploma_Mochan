package com.mochan.traveltime.dto.location.update;

import lombok.Data;

@Data
public class UpdateLocationRequest {

    private String countryName;
    private String cityName;
    private String regionName;
}
