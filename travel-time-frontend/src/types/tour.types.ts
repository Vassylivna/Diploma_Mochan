import { Location } from './location.types';
import { User } from './user.types';
import { Hotel, HotelSimple } from './hotel.types';

export interface TourImageResponse {
    tourImageId: number;
    imageUrl: string;
}

export interface TransportResponse {
    transportId: number;
    transportName: string;
    transportNumber: string;
    description: string;
}

export interface TourInclusion {
    tourInclusionId: number;
    itemDescription: string;
    isIncluded: boolean;
}

export interface TourRouteEvent {
    tourRouteEventId: number;
    description: string;
}

export interface TourRouteStep {
    tourRouteStepId: number;
    dayNumber: number;
    events: TourRouteEvent[];
}

export interface TourStop {
    tourStopId: number;
    location: Location;
    hotel?: Hotel;
}

export interface TourCard {
    tourId: number;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    transport: TransportResponse;
    price: number;
    totalSeats: number;
    
    availableSeats?: number; 

    images: TourImageResponse[];
    tourCountries: string[];
    
    stars?: number;

    isArchived?: boolean;
    isHidden?: boolean;
}

export interface TourDetails {
    tourId: number;
    title: string;
    description: string;
    startLocation: Location;
    startAddress: string;
    startDate: string;
    endDate: string;
    guide?: User;
    transport: TransportResponse;
    price: number;
    totalSeats: number;
    availableSeats: number;
    
    images: TourImageResponse[];
    inclusions: TourInclusion[];
    routeSteps: TourRouteStep[];
    stops: TourStop[];
}

export interface GuidePassenger {
    bookingId: number;
    firstName: string;
    lastName: string;
    middleName?: string;
    phoneNumber: string;
    totalSeats: number;
    status: string;
}

export interface GuideTourView {
    tourId: number;
    title: string;
    startDate: string;
    endDate: string;
    startAddress: string;
    startCity: string;
    startCountry: string;
    
    transportName: string;
    transportNumber?: string;
    
    hotels: HotelSimple[];
    
    guideFirstName?: string;
    guideLastName?: string;
    guidePhone?: string;

    totalSeats: number;
    bookedSeats: number;

    passengers: GuidePassenger[];
}

export interface TourSearchCriteria {
    query?: string;
    
    priceFrom?: number;
    priceTo?: number;
    
    dateFrom?: string;
    dateTo?: string;
    
    country?: string;
    startCity?: string;
    
    transportType?: string;
    hotelStars?: number;
    
    showActive?: boolean;
    showHidden?: boolean;
    showArchived?: boolean;

    isArchived?: boolean;
    isHidden?: boolean;  

    isComingSoon?: boolean
}

export interface CreateInclusionRequest {
    itemDescription: string;
    isIncluded: boolean;
}

export interface CreateRouteStepRequest {
    dayNumber: number;
    events: string[];
}

export interface CreateStopRequest {
    locationId: number;
    hotelId?: number | null;
}

export interface TourRequest {
    title: string;
    description: string;
    startAddress: string;
    startDate: string;
    endDate: string;
    price: number;
    totalSeats: number;
    
    startLocationId: number;
    transportId: number;
    guideId?: number | null;
    
    images: string[];
    inclusions: CreateInclusionRequest[];
    routeSteps: CreateRouteStepRequest[];
    stops: CreateStopRequest[];
}
