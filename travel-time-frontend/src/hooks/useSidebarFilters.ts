import { useState, useEffect, useCallback } from 'react';
import { Transport } from '../types/transport.types';
import { TourCard, TourSearchCriteria } from '../types/tour.types';
import { TransportService } from '../services/TransportService';
import { TourService } from '../services/TourService';

const FILTERS_STORAGE_KEY = 'user_tour_filters_state';

export const useSidebarFilters = (onApply: (tours: TourCard[]) => void) => {
    
    const getSavedFilters = () => {
        try {
            const saved = localStorage.getItem(FILTERS_STORAGE_KEY);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    };

    const savedData = getSavedFilters();

    const [transport, setTransport] = useState<string | null>(savedData.transport || null);
    const [priceFrom, setPriceFrom] = useState(savedData.priceFrom || '');
    const [priceTo, setPriceTo] = useState(savedData.priceTo || '');
    const [country, setCountry] = useState(savedData.country || '');
    const [startLocation, setStartLocation] = useState(savedData.startLocation || '');
    const [hotelType, setHotelType] = useState<string | number>(savedData.hotelType || '');
    const [dateFrom, setDateFrom] = useState(savedData.dateFrom || '');
    const [dateTo, setDateTo] = useState(savedData.dateTo || '');
    
    const [transportList, setTransportList] = useState<Transport[]>([]);
    const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

    const getLocalTodayDate = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const today = getLocalTodayDate();

    const getCurrentUserId = () => {
        const storedId = localStorage.getItem('app_current_user_id');
        return storedId ? Number(storedId) : 0;
    };

    useEffect(() => {
        const fetchTransports = async () => {
            try {
                const data = await TransportService.getAllActive();
                setTransportList(data);
            } catch (error) {
                console.error("Failed to load transports", error);
            }
        };
        fetchTransports();
    }, []);

    useEffect(() => {
        const filtersToSave = {
            transport, priceFrom, priceTo, country, startLocation, hotelType, dateFrom, dateTo
        };
        localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filtersToSave));
    }, [transport, priceFrom, priceTo, country, startLocation, hotelType, dateFrom, dateTo]);

    const runFilterLogic = useCallback(async () => {
        const newErrors: { [key: string]: boolean } = {};
        let isValid = true;

        if (dateFrom && dateFrom < today) { newErrors.dateFrom = true; isValid = false; }
        if (dateFrom && dateTo && dateTo < dateFrom) { newErrors.dateTo = true; isValid = false; }

        setErrors(newErrors);
        if (!isValid) return; 

        const criteria: TourSearchCriteria = {
            priceFrom: priceFrom ? Number(priceFrom) : undefined,
            priceTo: priceTo ? Number(priceTo) : undefined,
            country: country.trim() || undefined,
            startCity: startLocation.trim() || undefined,
            hotelStars: hotelType ? Number(hotelType) : undefined,
            transportType: transport || undefined,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            showActive: true 
        };

        const userId = getCurrentUserId();
        const userRole = localStorage.getItem('app_user_role') || undefined;

        const response = await TourService.getAll(criteria, 1, 100);
        onApply(response.content);

    }, [transport, priceFrom, priceTo, country, startLocation, hotelType, dateFrom, dateTo, today, onApply]);

    const handleDateFromChange = (val: string) => {
        setDateFrom(val);
        if (dateTo && val > dateTo) setDateTo('');
    };

    const handleApply = () => {
        runFilterLogic();
    };

    const handleClear = async () => {
        setPriceFrom(''); setPriceTo(''); 
        setCountry(''); setStartLocation('');
        setHotelType('');
        setTransport(null); setDateFrom(''); setDateTo(''); setErrors({});
        
        localStorage.removeItem(FILTERS_STORAGE_KEY);
        
        const response = await TourService.getAll({}, 1, 100);
        onApply(response.content);
    };

    return {
        transport, priceFrom, priceTo, country, startLocation, hotelType, dateFrom, dateTo,
        transportList, errors, today,
        setTransport, setPriceFrom, setPriceTo, setCountry, setStartLocation, setHotelType, setDateTo,
        handleDateFromChange, handleApply, handleClear
    };
};