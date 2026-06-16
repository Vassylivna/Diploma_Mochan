import { User } from './user.types';
import { TourDetails } from './tour.types';

export type BookingStatus = 
    | 'AWAITING_PAYMENT' 
    | 'PAID' 
    | 'CANCELLED' 
    | 'PENDING_APPROVAL' 
    | 'REFUND_REQUESTED' 
    | 'REFUNDED'
    | 'CANCELLED_WITH_PAYMENT';

export interface Booking {
    bookingId: number;
    user: User;
    tour: TourDetails;
    
    adultsCount: number;
    childrenCount: number;
    teensCount: number;
    totalPrice: number;
    
    status: BookingStatus;
    paymentCode: string;
    cardNumberMasked?: string;
    
    createdAt: string;
    paymentDeadline?: string;
    confirmedAt?: string;
}

export interface CreateBookingRequest {
    tourId: number;
    adultsCount: number;
    childrenCount: number;
    teensCount: number;
    totalPrice: number;
    initialStatus: BookingStatus;
}

export interface PaymentRequest {
    cardNumber: string;
}
