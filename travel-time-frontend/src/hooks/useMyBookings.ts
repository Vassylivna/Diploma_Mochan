import { useState, useEffect, useCallback } from 'react';
import { Booking } from '../types/booking.types';
import { BookingService } from '../services/BookingService';

const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('uk-UA', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

const calculateGroupTimes = (startDateStr: string) => {
    if (!startDateStr) return { start: '--:--', arrival: '--:--' };
    const start = new Date(startDateStr);
    if (isNaN(start.getTime())) return { start: '--:--', arrival: '--:--' };
    
    const arrival = new Date(start.getTime() - 30 * 60000); 
    const fmt = (d: Date) => d.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
    return { start: fmt(start), arrival: fmt(arrival) };
};

export const useMyBookings = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const itemsPerPage = 3; 

    // UI States
    const [openPayment, setOpenPayment] = useState(false);
    const [paymentBooking, setPaymentBooking] = useState<Booking | null>(null);
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');
    const [cardHolder, setCardHolder] = useState('');
    const [processingPayment, setProcessingPayment] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [openSuccess, setOpenSuccess] = useState(false);
    const [openDetails, setOpenDetails] = useState(false);
    const [detailsBooking, setDetailsBooking] = useState<Booking | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; type: 'CANCEL_BOOKING' | 'REQUEST_REFUND' | 'CANCEL_WITHOUT_REFUND' | 'CANCEL_PAYMENT' | 'SUBMIT_PAYMENT' | 'TIME_EXPIRED' | null }>({ open: false, type: null });
    const [actionId, setActionId] = useState<number | null>(null);
    const [pdfGeneratingId, setPdfGeneratingId] = useState<number | null>(null);
    const [pdfError, setPdfError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await BookingService.getMyBookings(page, itemsPerPage);
            const rawList = response.content || [];
            
            const transformedList = rawList.map((b: any) => {
                const rawStart = b.tour.startDate; 
                return {
                    ...b,
                    rawStartDate: rawStart, 
                    tour: {
                        ...b.tour,
                        startDate: formatDateTime(b.tour.startDate),
                        endDate: formatDateTime(b.tour.endDate),
                        groupTimes: calculateGroupTimes(rawStart)
                    }
                };
            });

            setBookings(transformedList);
            setTotalPages(response.totalPages);
        } catch (e) {
            console.error("Failed to load bookings", e);
            setBookings([]);
        } finally {
            setLoading(false);
        }
    }, [page]); 

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredBookings = (bookings || []).filter(b => 
        b.paymentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.tour.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleOpenDetails = (booking: Booking) => {
        setDetailsBooking(booking);
        setOpenDetails(true);
    };

    const handleOpenPayment = (booking: Booking) => {
        setPaymentBooking(booking);
        setCardNumber('');
        setCardExpiry('');
        setCardCvv('');
        setCardHolder(`${booking.user.firstName} ${booking.user.lastName}`.toUpperCase());
        setPaymentError(null);
        setOpenPayment(true);
    };

    const handleTryClosePayment = () => {
        setConfirmDialog({ open: true, type: 'CANCEL_PAYMENT' });
    };

    const validateExpiryDate = (expiry: string): string | null => {
        if (!/^\d{2}\/\d{2}$/.test(expiry)) return "Формат ММ/РР";
        const [monthStr, yearStr] = expiry.split('/');
        const month = parseInt(monthStr, 10);
        const year = parseInt(`20${yearStr}`, 10);
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        if (month < 1 || month > 12) return "Некоректний місяць";
        if (year < currentYear || (year === currentYear && month < currentMonth)) return "Картка протермінована";
        return null;
    };

    const handleTrySubmitPayment = () => {
        const cleanNumber = cardNumber.replace(/\D/g, '');
        if (cleanNumber.length !== 16) { setPaymentError("Номер картки має містити 16 цифр"); return; }
        const expiryError = validateExpiryDate(cardExpiry);
        if (expiryError) { setPaymentError(expiryError); return; }
        if (cardCvv.length !== 3) { setPaymentError("CVV має містити 3 цифри"); return; }
        setPaymentError(null);
        setConfirmDialog({ open: true, type: 'SUBMIT_PAYMENT' });
    };

    const handleTryCancelBooking = (id: number) => {
        setActionId(id);
        setConfirmDialog({ open: true, type: 'CANCEL_BOOKING' });
    };

    const handleTryRefund = (booking: Booking) => {
        setActionId(booking.bookingId);
        const isoDate = (booking as any).rawStartDate || booking.tour.startDate;
        const daysLeft = (new Date(isoDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        
        if (daysLeft < 14) setConfirmDialog({ open: true, type: 'CANCEL_WITHOUT_REFUND' });
        else setConfirmDialog({ open: true, type: 'REQUEST_REFUND' });
    };

    const handleConfirmAction = async () => {
        const type = confirmDialog.type;
        if (type === 'CANCEL_PAYMENT') {
            setConfirmDialog({ open: false, type: null });
            setOpenPayment(false);
            return;
        }
        if (type === 'SUBMIT_PAYMENT' && paymentBooking) {
            setConfirmDialog({ open: false, type: null }); 
            setProcessingPayment(true);
            setPaymentError(null);
            try {
                await BookingService.pay(paymentBooking.bookingId, cardNumber.replace(/\D/g, ''));
                setOpenPayment(false);
                setOpenSuccess(true);
                loadData();
            } catch (e: any) {
                if (e.response && e.response.data && e.response.data.message) setPaymentError(e.response.data.message);
                else setPaymentError("Помилка оплати. Спробуйте пізніше.");
            } finally {
                setProcessingPayment(false);
            }
            return;
        }
        setConfirmDialog({ open: false, type: null });
        if ((type === 'CANCEL_BOOKING' || type === 'CANCEL_WITHOUT_REFUND' || type === 'REQUEST_REFUND') && actionId) {
            try {
                await BookingService.cancelByUser(actionId);
                loadData();
            } catch (e) { }
        }
    };

    const handleTimerExpire = (id: number) => {
        setConfirmDialog({ open: true, type: 'TIME_EXPIRED' });
        loadData();
    };

    const handleDownloadTicket = async (booking: Booking) => {
        setPdfGeneratingId(booking.bookingId);
        setPdfError(null);
        try { await BookingService.downloadTicket(booking.bookingId); } catch(e) { } finally { setPdfGeneratingId(null); }
    };

    const canShowRefundButton = (booking: Booking) => {
        const isoDate = (booking as any).rawStartDate || booking.tour.startDate;
        return booking.status === 'PAID' && new Date(isoDate).getTime() > Date.now();
    };

    const onCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '').slice(0, 16);
        const parts = val.match(/.{1,4}/g) || [];
        setCardNumber(parts.join(' '));
        setPaymentError(null);
    };

    const onCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '').slice(0, 4);
        if (val.length >= 2) val = `${val.slice(0, 2)}/${val.slice(2)}`;
        setCardExpiry(val);
        setPaymentError(null);
    };

    const onCardCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3));
        setPaymentError(null);
    };

    return {
        paginatedBookings: filteredBookings,
        totalPages, loading, page, searchQuery,
        pdfGeneratingId, pdfError, setPdfError, processingPayment, paymentError,
        openPayment, setOpenPayment, openSuccess, setOpenSuccess, openDetails, setOpenDetails, confirmDialog, setConfirmDialog,
        paymentBooking, detailsBooking,
        cardHolder, cardNumber, cardExpiry, cardCvv,
        setPage, handleSearchChange, handleDownloadTicket, handleOpenDetails, handleOpenPayment,
        handleTryCancelBooking, handleTryRefund, handleTryClosePayment, handleTrySubmitPayment,
        handleConfirmAction, handleTimerExpire,
        onCardNumberChange, onCardExpiryChange, onCardCvvChange,
        canShowRefundButton
    };
};