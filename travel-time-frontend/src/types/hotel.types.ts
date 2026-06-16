import { Location } from "./location.types";

export interface HotelImage {
    hotelImageId: number;
    imageUrl: string;
}

export interface Hotel {
    hotelId: number;
    name: string;
    stars: number;
    description: string;
    location: Location;
    images: HotelImage[];
    isDeleted?: boolean;
}

export interface HotelRequest {
    name: string;
    stars: number;
    description: string;
    locationId: number;
    images: string[];
}

export interface HotelSimple {
    name: string;
    stars: number;
}
