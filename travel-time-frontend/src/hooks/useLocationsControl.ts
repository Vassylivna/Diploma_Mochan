import { useState, useEffect, useCallback } from 'react';
import { Location, LocationRequest } from '../types/location.types';
import { LocationService } from '../services/LocationService';

const ITEMS_PER_PAGE = 6;
type ConfirmActionType = 'DELETE' | 'SAVE' | 'CANCEL' | null;

export const useLocationsControl = () => {
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [formData, setFormData] = useState<LocationRequest>({
        countryName: '',
        cityName: '',
        regionName: ''
    });

    const [initialFormData, setInitialFormData] = useState<LocationRequest>({
        countryName: '',
        cityName: '',
        regionName: ''
    });

    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        type: ConfirmActionType;
        payload: any;
    }>({ open: false, type: null, payload: null });

    const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({
        open: false, message: '', severity: 'success'
    });

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await LocationService.getPaginated(page, ITEMS_PER_PAGE, searchTerm);
            setLocations(response.content);
            setTotalPages(response.totalPages || 1);
        } catch (error) {
            console.error("Failed to load locations", error);
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setPage(1);
    };

    const handleOpenForm = (location?: Location) => {
        let data: LocationRequest;

        if (location) {
            setEditingId(location.locationId);
            data = {
                countryName: location.countryName,
                cityName: location.cityName,
                regionName: location.regionName,
            };
        } else {
            setEditingId(null);
            data = { countryName: '', cityName: '', regionName: '' };
        }
        setFormData(data);
        setInitialFormData(data);
        setIsFormOpen(true);
    };

    const handleRequestCancel = () => {
        const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData);
        if (hasChanges) {
            setConfirmDialog({ open: true, type: 'CANCEL', payload: null });
        } else {
            setIsFormOpen(false);
        }
    };

    const handleRequestSave = () => {
        if (!formData.countryName.trim() || !formData.cityName.trim() || !formData.regionName.trim()) {
            setSnackbar({ open: true, message: 'Всі поля є обов’язковими!', severity: 'error' });
            return;
        }

        setIsFormOpen(false);
        setConfirmDialog({
            open: true,
            type: 'SAVE',
            payload: { id: editingId, data: formData }
        });
    };

    const handleRequestDelete = (id: number) => {
        setConfirmDialog({ open: true, type: 'DELETE', payload: id });
    };

    const handleConfirmAction = async () => {
        const { type, payload } = confirmDialog;
        setConfirmDialog(prev => ({ ...prev, open: false }));

        try {
            if (type === 'CANCEL') {
                setIsFormOpen(false);
            }
            else if (type === 'DELETE') {
                await LocationService.delete(payload);
                setSnackbar({ open: true, message: 'Локацію успішно видалено', severity: 'success' });
                
                if (locations.length === 1 && page > 1) {
                    setPage(prev => prev - 1);
                } else {
                    loadData();
                }
            }
            else if (type === 'SAVE') {
                if (payload.id) {
                    await LocationService.update(payload.id, payload.data);
                    setSnackbar({ open: true, message: 'Локацію оновлено', severity: 'success' });
                } else {
                    await LocationService.create(payload.data);
                    setSnackbar({ open: true, message: 'Нову локацію створено', severity: 'success' });
                    setPage(1);
                    setSearchTerm('');
                }
                loadData();
            }
        } catch (error) {
            console.error("Action error:", error);
        }
    };

    return {
        locations, loading, page, totalPages, searchTerm,
        isFormOpen, formData, editingId,
        confirmDialog, snackbar,
        setPage, setFormData, setIsFormOpen, setConfirmDialog, setSnackbar,
        handleSearchChange, handleOpenForm, handleRequestSave,
        handleRequestDelete, handleConfirmAction, handleRequestCancel
    };
};