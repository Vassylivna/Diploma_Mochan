package com.mochan.traveltime.dto.location.create;

import lombok.Data;

@Data
public class CreateLocationRequest {

    private String countryName;
    private String cityName;
    private String regionName;
}
