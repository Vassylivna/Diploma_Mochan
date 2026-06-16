import { useState } from 'react';
import { TourCard } from '../types/tour.types';

export const useTourCard = (userRole: 'admin' | 'user' | 'guide' | null, tour: TourCard) => {
    const [openForm, setOpenForm] = useState(false);
    const [openRoute, setOpenRoute] = useState(false);
    const [showAuthWarning, setShowAuthWarning] = useState(false);

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('uk-UA');

    const handleCardClick = () => {
        if (userRole === 'admin') return;
        if (userRole === 'user') setOpenForm(true);
        else setShowAuthWarning(true);
    };

    const handleRouteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenRoute(true);
    };

    const handleProceedToBooking = () => {
        setOpenRoute(false);
        if (userRole === 'user') setOpenForm(true);
        else setShowAuthWarning(true);
    };

    return {
        openForm, setOpenForm,
        openRoute, setOpenRoute,
        showAuthWarning, setShowAuthWarning,
        formatDate,
        handleCardClick,
        handleRouteClick,
        handleProceedToBooking
    };
};