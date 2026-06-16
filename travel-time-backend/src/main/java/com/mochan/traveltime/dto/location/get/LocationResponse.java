package com.mochan.traveltime.dto.location.get;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LocationResponse {

    private Long locationId;
    private String countryName;
    private String cityName;
    private String regionName;
}
