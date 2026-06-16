import { useState, useEffect, useCallback } from 'react';
import { TourCard, TourSearchCriteria } from '../types/tour.types';
import { TourService } from '../services/TourService';

export const useTourCatalog = (
    userRole: 'admin' | 'user' | 'guide' | null, 
    searchTerm: string
) => {
    const [tours, setTours] = useState<TourCard[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        try {
        
            const criteria: TourSearchCriteria = {
                query: searchTerm || undefined,
            };

            const response = await TourService.getAll(criteria, 1, 100);
            setTours(response.content);

        } catch (error) {
            console.error("Failed to load catalog:", error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        loadData();

        const intervalId = setInterval(() => {
            loadData(); 
        }, 60000);

        return () => clearInterval(intervalId);
    }, [loadData]);

    return { tours, loading, setTours };
};
