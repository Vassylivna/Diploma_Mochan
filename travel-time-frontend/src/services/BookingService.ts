import axiosClient from '../api/axiosClient';
import { 
    Booking, CreateBookingRequest, PaymentRequest, BookingStatus 
} from '../types/booking.types';
import { PageResponse } from '../types/pagination.types';

const BASE_URL = '/bookings';

export type WarningReason = 'none' | 'child' | 'teen' | 'child_teen';

export const BookingService = {

    create: async (payload: CreateBookingRequest): Promise<Booking> => {
        const { data } = await axiosClient.post<Booking>(BASE_URL, payload);
        return data;
    },

    getMyBookings: async (page: number = 1, size: number = 3): Promise<PageResponse<Booking>> => {
        const { data } = await axiosClient.get<PageResponse<Booking>>(`${BASE_URL}/user`, {
            params: { 
                page: page - 1, 
                size 
            }
        });
        
        return data;
    },

    getBookingsByTourId: async (tourId: number): Promise<Booking[]> => {
        const { data } = await axiosClient.get<Booking[]>(`${BASE_URL}/tour/${tourId}`);
        return data;
    },

    pay: async (bookingId: number, cardNumber: string): Promise<Booking> => {
        const payload: PaymentRequest = { cardNumber };
        const { data } = await axiosClient.patch<Booking>(`${BASE_URL}/${bookingId}/pay`, payload);
        return data;
    },

    cancelByUser: async (bookingId: number): Promise<Booking> => {
        const { data } = await axiosClient.patch<Booking>(`${BASE_URL}/${bookingId}/cancel`);
        return data;
    },

    downloadTicket: async (bookingId: number): Promise<void> => {
        try {
            const response = await axiosClient.get(`${BASE_URL}/${bookingId}/ticket`, {
                responseType: 'blob', 
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            const contentDisposition = response.headers['content-disposition'];
            let fileName = `Ticket_${bookingId}.pdf`;
            
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
                if (fileNameMatch && fileNameMatch.length === 2)
                    fileName = fileNameMatch[1];
            }
            
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to download ticket", error);
            throw new Error("Не вдалося завантажити квиток");
        }
    },

    getAll: async (
        page: number = 1, 
        size: number = 10,
        search: string = '', 
        status: string = 'ALL',
        types: string[] = [] 
    ): Promise<PageResponse<Booking>> => {
        const params = {
            page: page - 1,
            size,
            search: search || undefined,
            status: status !== 'ALL' ? status : undefined,
            type: types.length > 0 ? types : undefined, 
            sort: 'createdAt,desc'
        };
        const { data } = await axiosClient.get<PageResponse<Booking>>(BASE_URL, { params });
        return data;
    },

    updateStatusByAdmin: async (bookingId: number, newStatus: BookingStatus): Promise<Booking> => {
        const { data } = await axiosClient.patch<Booking>(`${BASE_URL}/${bookingId}/status`, {
            status: newStatus
        });
        return data;
    },

    calculateAge(birthDateString: string): number {
        const today = new Date();
        const birthDate = new Date(birthDateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    },

    calculateTotals(basePrice: number, adults: number, children: number, teens: number) {
        const discountPercent = 20; 
        const childPrice = basePrice * (1 - discountPercent / 100);
        const teenPrice = basePrice;

        const totalPrice = (adults * basePrice) + (teens * teenPrice) + (children * childPrice);
        const totalPeople = adults + teens + children;

        return { childPrice, teenPrice, totalPrice, totalPeople };
    },

    determineWarningReason(hasChildren: boolean, hasTeens: boolean): WarningReason {
        if (hasChildren && hasTeens) return 'child_teen';
        if (hasChildren) return 'child';
        if (hasTeens) return 'teen';
        return 'none';
    },

    getWarningText(reason: WarningReason): string {
        switch (reason) {
            case 'child': return 'У замовленні є діти (0-12 років) без супроводу дорослих (18+). Згідно з правилами перевезень, такі поїздки потребують додаткового узгодження.';
            case 'teen': return 'У замовленні є підлітки (13-17 років) без супроводу дорослих. Для підтвердження поїздки необхідна згода батьків або опікунів.';
            case 'child_teen': return 'У замовленні присутні лише неповнолітні особи (діти та підлітки). Така подорож потребує обов\'язкового узгодження з адміністратором.';
            default: return '';
        }
    },
    
    formatPhoneNumber(value: string): string {
        const digits = value.replace(/\D/g, ""); 
        return digits.slice(0, 9);
    }
};