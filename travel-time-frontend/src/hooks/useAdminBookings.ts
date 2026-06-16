import { useState, useEffect, useCallback } from 'react';
import { Booking, BookingStatus } from '../types/booking.types';
import { BookingService } from '../services/BookingService';

const ROWS_PER_PAGE = 7;

export type GroupTypeFilter = 'ADULTS_ONLY' | 'WITH_KIDS' | 'WITH_TEENS';

export const useAdminBookings = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [typeFilters, setTypeFilters] = useState<GroupTypeFilter[]>([]);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        type: string | null;
        booking: Booking | null;
    }>({ open: false, type: null, booking: null });
    
    const loadData = useCallback(async (isBackground = false) => {
        if (!isBackground) setLoading(true);
        
        try {
            const response = await BookingService.getAll(
                page, 
                ROWS_PER_PAGE, 
                searchQuery, 
                statusFilter,
                typeFilters
            );
            
            setBookings(response.content);
            setTotalPages(response.totalPages);
        } catch (e) {
            console.error("Не вдалося завантажити бронювання адміністратора", e);
        } finally {
            if (!isBackground) setLoading(false);
        }
    }, [page, searchQuery, statusFilter, typeFilters]);

    useEffect(() => {
        loadData(false);

        const intervalId = setInterval(() => {
            loadData(true);
        }, 60000);

        return () => clearInterval(intervalId);
    }, [loadData]);

    const handlePageChange = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleStatusChange = (event: React.SyntheticEvent, newValue: string) => {
        setStatusFilter(newValue);
        setPage(1);

        if (newValue === 'PENDING_APPROVAL') {
            let sanitizedFilters = [...typeFilters];

            if (sanitizedFilters.includes('ADULTS_ONLY')) {
                sanitizedFilters = sanitizedFilters.filter(f => f !== 'ADULTS_ONLY');
            }

            const hasKids = sanitizedFilters.includes('WITH_KIDS');
            const hasTeens = sanitizedFilters.includes('WITH_TEENS');

            if (hasKids && hasTeens) {
                sanitizedFilters = [];
            }
            
            if (sanitizedFilters.length !== typeFilters.length || (hasKids && hasTeens)) {
                setTypeFilters(sanitizedFilters);
            }
        }
    };

    const handleTypeFilter = (event: React.MouseEvent<HTMLElement>, newFormats: GroupTypeFilter[]) => {
        if (newFormats.length === 0) {
            setTypeFilters([]);
            setPage(1);
            return;
        }

        let processedFormats = [...newFormats];

        const hasAdults = processedFormats.includes('ADULTS_ONLY');
        const hasOthers = processedFormats.some(f => f === 'WITH_KIDS' || f === 'WITH_TEENS');

        if (hasAdults && hasOthers) {
            const wasAdults = typeFilters.includes('ADULTS_ONLY');
            if (wasAdults) {
                processedFormats = processedFormats.filter(f => f !== 'ADULTS_ONLY');
            } else {
                processedFormats = ['ADULTS_ONLY'];
            }
        }

        if (statusFilter === 'PENDING_APPROVAL') {
            const hasKids = processedFormats.includes('WITH_KIDS');
            const hasTeens = processedFormats.includes('WITH_TEENS');

            if (hasKids && hasTeens) {
                const wasKids = typeFilters.includes('WITH_KIDS');
                if (wasKids) {
                    processedFormats = processedFormats.filter(f => f !== 'WITH_KIDS');
                } else {
                    processedFormats = processedFormats.filter(f => f !== 'WITH_TEENS');
                }
            }
        }

        setTypeFilters(processedFormats);
        setPage(1);
    };

    const clearTypeFilter = () => {
        setTypeFilters([]);
        setPage(1);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, booking: Booking) => {
        setAnchorEl(event.currentTarget);
        setSelectedBooking(booking);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleCloseDetails = () => {
        setDetailsOpen(false);
        setSelectedBooking(null);
    };

    const handleViewDetails = (booking: Booking) => {
        setSelectedBooking(booking);
        setDetailsOpen(true);
        handleMenuClose();
    };


    const handleRequestAction = (actionType: string, booking: Booking) => {
        setConfirmDialog({ open: true, type: actionType, booking });
        handleMenuClose();
    };

    const handleConfirmAction = async () => {
        const { type, booking } = confirmDialog;
        if (!booking || !type) return;

        let newStatus: BookingStatus | null = null;

        switch (type) {
            case 'APPROVE_BOOKING': newStatus = 'AWAITING_PAYMENT'; break;
            case 'CANCEL_BOOKING': newStatus = 'CANCELLED'; break;
            case 'APPROVE_REFUND': newStatus = 'REFUNDED'; break;
            case 'REJECT_REFUND': newStatus = 'PAID'; break;
            case 'MARK_PAID': newStatus = 'PAID'; break;
            case 'FORCE_REFUND': newStatus = 'REFUNDED'; break;
            case 'CANCEL_ADMIN_ERROR': newStatus = 'CANCELLED'; break;
            default: break;
        }

        if (newStatus) {
            try {
                await BookingService.updateStatusByAdmin(booking.bookingId, newStatus);
                setConfirmDialog({ open: false, type: null, booking: null });
                setDetailsOpen(false);
                loadData(false);
            } catch (e) {
                console.error(e);
            }
        }
    };

    return {
        paginatedBookings: bookings,
        totalPages,
        loading,
        page,
        
        searchQuery,
        statusFilter,
        typeFilters,
        
        anchorEl,
        selectedBooking,
        detailsOpen,
        confirmDialog,
        
        setPage,
        setSearchQuery,
        setConfirmDialog,
        
        handlePageChange,
        handleStatusChange,
        handleTypeFilter,
        clearTypeFilter,
        
        handleMenuOpen,
        handleMenuClose,
        handleViewDetails,
        handleCloseDetails,
        
        handleRequestAction,
        handleConfirmAction
    };
};