export interface Location {
    locationId: number;
    countryName: string;
    cityName: string;
    regionName: string;
    isDeleted: boolean;
}

export interface LocationRequest {
    countryName: string;
    cityName: string;
    regionName: string;
}