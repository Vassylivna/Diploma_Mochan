import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TourCard, TourSearchCriteria } from '../types/tour.types';
import { TourService } from '../services/TourService';

interface AdminTourCard extends TourCard {
    isArchived?: boolean;
    isHidden?: boolean;
}

const ITEMS_PER_PAGE = 7;
export type ConfirmType = 'DELETE' | 'ARCHIVE' | 'HIDE' | null;

export const useToursControl = () => {
    const navigate = useNavigate();

    const [tours, setTours] = useState<AdminTourCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        showAll: true,
        showActive: false,
        showHidden: false,
        showArchived: false
    });

    const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);
    
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        type: ConfirmType;
        tourId: number | null;
        tourTitle: string;
        currentState?: boolean;
    }>({ open: false, type: null, tourId: null, tourTitle: '', currentState: false });

    const loadData = useCallback(async (isBackground = false) => {
        if (!isBackground) {
            setLoading(true);
        }
        
        try {
            const criteria: TourSearchCriteria = {
                query: searchTerm || undefined,
            };

            if (!filters.showAll) {
                if (filters.showActive) criteria.showActive = true;
                if (filters.showHidden) criteria.showHidden = true;
                if (filters.showArchived) criteria.showArchived = true;
            } else {
                criteria.showActive = true;
                criteria.showHidden = true;
                criteria.showArchived = true;
            }

           
            const response = await TourService.getAll(criteria, page, ITEMS_PER_PAGE);
            
            setTours(response.content as AdminTourCard[]);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error("Failed to load tours:", error);
        } finally {
            if (!isBackground) {
                setLoading(false);
            }
        }
    }, [page, searchTerm, filters]);

    useEffect(() => {
        loadData(false);

        const intervalId = setInterval(() => {
            loadData(true); 
        }, 60000);

        return () => clearInterval(intervalId);
    }, [loadData]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    const handlePageChange = (_: any, value: number) => {
        setPage(value);
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        
        setFilters(prev => {
            if (name === 'showAll') {
                return checked 
                    ? { showAll: true, showActive: false, showHidden: false, showArchived: false } 
                    : prev;
            } else {
                const nextState = { ...prev, [name]: checked };
                const hasAnySpecificFilter = nextState.showActive || nextState.showHidden || nextState.showArchived;
                return {
                    ...nextState,
                    showAll: !hasAnySpecificFilter
                };
            }
        });
        setPage(1);
    };

    const handleInstantRestore = (id: number) => {
        navigate('/management/create-tour', { state: { restoreFromId: id } });
    };

    const openConfirmDialog = (type: ConfirmType, id: number, title: string, currentState: boolean = false) => {
        setConfirmDialog({ open: true, type, tourId: id, tourTitle: title, currentState });
    };

    const closeConfirmDialog = () => {
        setConfirmDialog(prev => ({ ...prev, open: false }));
    };

    const handleConfirmAction = async () => {
        const { type, tourId } = confirmDialog;
        if (!tourId) return;
        setConfirmDialog(p => ({ ...p, open: false }));

        try {
            if (type === 'DELETE') {
                await TourService.delete(tourId);
                setSnackbarMessage("Тур видалено");
                setIsError(false);
            } 
            else if (type === 'ARCHIVE') {
                await TourService.toggleArchive(tourId);
                setSnackbarMessage("Статус архіву змінено");
                setIsError(false);
            } 
            else if (type === 'HIDE') {
                await TourService.toggleHidden(tourId);
                setSnackbarMessage("Видимість змінено");
                setIsError(false);
            }
            
            loadData(false); 

        } catch (error) {
            loadData(false);
        }
    };

    return {
        tours, loading, page, totalPages, searchTerm, filters,
        errorMsg: snackbarMessage, isError, setErrorMsg: setSnackbarMessage,
        confirmDialog,
        
        handleSearchChange, handlePageChange, handleFilterChange,
        openConfirmDialog, closeConfirmDialog, handleConfirmAction, handleInstantRestore
    };
};