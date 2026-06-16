import { useState, useEffect, useMemo } from 'react';
import { TourDetails } from '../types/tour.types';
import { UserService } from '../services/UserService';
import { BookingService, WarningReason } from '../services/BookingService';
import { CreateBookingRequest, BookingStatus } from '../types/booking.types';

export const useBookingForm = (open: boolean, tour: TourDetails, onClose: () => void) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [userAge, setUserAge] = useState<number | null>(null);

    const [adults, setAdults] = useState(1);
    const [teens, setTeens] = useState(0);
    const [children, setChildren] = useState(0);

    const [isSuccess, setIsSuccess] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');
    const [bookingResultType, setBookingResultType] = useState<'NORMAL' | 'NEED_APPROVAL'>('NORMAL');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; type: 'submit' | 'cancel' }>({ open: false, type: 'submit' });
    const [adminWarningDialog, setAdminWarningDialog] = useState<{ open: boolean; reason: WarningReason }>({ open: false, reason: 'none' });
    const [zeroTotalDialog, setZeroTotalDialog] = useState(false);

    useEffect(() => {
        if (open) {
            UserService.getProfile().then(user => {
                if (user) {
                    setFirstName(user.firstName);
                    setLastName(user.lastName);
                    setMiddleName(user.middleName || '');
                    setPhone(user.phoneNumber);
                    setEmail(user.email);
                    if (user.birthDate) {
                        setUserAge(BookingService.calculateAge(user.birthDate));
                    }
                }
            });
            setAdults(1); 
            setTeens(0); 
            setChildren(0);
            setErrors({});
            setIsSuccess(false);
        }
    }, [open]);

    const totals = useMemo(() => 
        BookingService.calculateTotals(tour.price, adults, children, teens), 
    [tour.price, adults, children, teens]);

    const remainingSeats = tour.availableSeats - totals.totalPeople;
    const canAddPassenger = remainingSeats > 0;
    
    const isUserAdult = userAge !== null && userAge >= 18; 

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        
        if (!firstName.trim()) newErrors.firstName = "Ім'я обов'язкове";
        if (!lastName.trim()) newErrors.lastName = "Прізвище обов'язкове";
        if (!phone.trim() || phone.replace(/\D/g, '').length < 10) newErrors.phone = "Некоректний телефон";
        
        if (remainingSeats < 0) {
            newErrors.seats = "Недостатньо вільних місць";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const processBooking = async (status: BookingStatus) => {
        try {
            const payload: CreateBookingRequest = {
                tourId: tour.tourId,
                adultsCount: adults,
                childrenCount: children,
                teensCount: teens,
                totalPrice: totals.totalPrice,
                initialStatus: status
            };

            const booking = await BookingService.create(payload);
            
            setOrderNumber(booking.paymentCode);
            setBookingResultType(status === 'PENDING_APPROVAL' ? 'NEED_APPROVAL' : 'NORMAL');
            setIsSuccess(true);
        } catch (error) {

        }
    };

    const handleSubmitClick = () => {
        if (tour.availableSeats === 0) return;
        
        if (totals.totalPrice <= 0) {
            setZeroTotalDialog(true);
            return;
        }

        if (validate()) {
            setConfirmDialog({ open: true, type: 'submit' });
        }
    };

    const handleCancelClick = () => {
        if (adults !== 1 || children !== 0 || teens !== 0) {
            setConfirmDialog({ open: true, type: 'cancel' });
        } else {
            onClose();
        }
    };

    const handleConfirmAction = () => {
        setConfirmDialog(prev => ({ ...prev, open: false }));
        
        if (confirmDialog.type === 'cancel') {
            onClose();
            return;
        }
        
        const reason = BookingService.determineWarningReason(children > 0, teens > 0);
        
        if (reason !== 'none') {
            setAdminWarningDialog({ open: true, reason });
        } else {
            processBooking('AWAITING_PAYMENT');
        }
    };

    const handleAdminWarningConfirm = () => {
        setAdminWarningDialog(prev => ({ ...prev, open: false }));
        processBooking('PENDING_APPROVAL');
    };

    return {
        firstName, setFirstName,
        lastName, setLastName,
        middleName, setMiddleName,
        phone, setPhone,
        email, setEmail,
        
        passengers: { 
            adults, setAdults, 
            children, setChildren, 
            teens, setTeens 
        },
        
        totals,
        remainingSeats,
        canAddPassenger,
        isUserAdult,
        
        errors,
        isSuccess,
        orderNumber,
        bookingResultType,
        
        dialogs: {
            confirmDialog, setConfirmDialog,
            adminWarningDialog, setAdminWarningDialog,
            zeroTotalDialog, setZeroTotalDialog
        },
        
        handleSubmitClick,
        handleCancelClick,
        handleConfirmAction,
        handleAdminWarningConfirm,
        
        isSoldOut: tour.availableSeats === 0
    };
};