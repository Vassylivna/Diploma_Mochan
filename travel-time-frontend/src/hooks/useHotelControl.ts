import { useState, useEffect, useCallback, useRef } from 'react';
import { Hotel, HotelRequest } from '../types/hotel.types';
import { Location } from '../types/location.types';
import { HotelService } from '../services/HotelService';
import { LocationService } from '../services/LocationService';
import { imageUploadService } from '../services/ImageUploadService';

const ITEMS_PER_PAGE = 6;
type ConfirmActionType = 'DELETE' | 'SAVE' | 'CANCEL' | null;

export const useHotelControl = () => {
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [locationsList, setLocationsList] = useState<Location[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [formData, setFormData] = useState<HotelRequest>({
        name: '',
        stars: 3,
        description: '',
        locationId: 0, 
        images: []
    });

    const [initialFormData, setInitialFormData] = useState<HotelRequest>({
        name: '', stars: 3, description: '', locationId: 0, images: []
    });

    const [currentImageUrl, setCurrentImageUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            const hotelResponse = await HotelService.getPaginated(page, ITEMS_PER_PAGE, searchTerm);
            setHotels(hotelResponse.content);
            setTotalPages(hotelResponse.totalPages || 1);

            const locationsResponse = await LocationService.getAllActive();
            setLocationsList(locationsResponse);

        } catch (error) {
            console.error("Failed to load data", error);
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

    const handleLocationChange = (id: number) => {
        setFormData(prev => ({ ...prev, locationId: id }));
    };

    const handleOpenForm = (hotel?: Hotel) => {
        let data: HotelRequest;

        if (hotel) {
            setEditingId(hotel.hotelId);
            data = {
                name: hotel.name,
                stars: hotel.stars,
                description: hotel.description,
                locationId: hotel.location.locationId, 
                images: hotel.images.map(img => img.imageUrl) 
            };
        } else {
            setEditingId(null);
            data = { 
                name: '', 
                stars: 3, 
                description: '', 
                locationId: 0, 
                images: []
            };
        }
        
        setFormData(data);
        setInitialFormData(JSON.parse(JSON.stringify(data)));
        setCurrentImageUrl('');
        setIsFormOpen(true);
    };

    const handleAddImageUrl = () => {
        if (!currentImageUrl.trim()) return;
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, currentImageUrl.trim()]
        }));
        setCurrentImageUrl('');
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setUploadingImage(true);
            try {
                const url = await imageUploadService.uploadImage(file);
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, url]
                }));
                setSnackbar({ open: true, message: 'Фото успішно завантажено', severity: 'success' });
            } catch (error) {
                console.error("Image upload error:", error);
            } finally {
                setUploadingImage(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        }
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
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
        if (
            !formData.name.trim() || 
            !formData.description.trim() || 
            !formData.locationId || 
            formData.images.length === 0
        ) {
            setSnackbar({ 
                open: true, 
                message: 'Заповніть назву, опис, виберіть локацію та додайте хоча б 1 фото!', 
                severity: 'error' 
            });
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
                await HotelService.delete(payload);
                // Успіх
                setSnackbar({ open: true, message: 'Готель видалено', severity: 'success' });
                if (hotels.length === 1 && page > 1) {
                    setPage(prev => prev - 1);
                } else {
                    loadData();
                }
            } 
            else if (type === 'SAVE') {
                if (payload.id) {
                    await HotelService.update(payload.id, payload.data);
                    // Успіх
                    setSnackbar({ open: true, message: 'Дані готелю оновлено', severity: 'success' });
                } else {
                    await HotelService.create(payload.data);
                    // Успіх
                    setSnackbar({ open: true, message: 'Готель створено', severity: 'success' });
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
        hotels, locationsList, loading, page, totalPages, searchTerm,
        isFormOpen, formData, editingId, 
        confirmDialog, snackbar,
        uploadingImage, currentImageUrl, fileInputRef,
        selectedLocationId: formData.locationId,
        
        setIsFormOpen, 
        setPage, setFormData, setConfirmDialog, setSnackbar, setCurrentImageUrl,
        
        handleSearchChange, handleOpenForm, handleRequestSave, 
        handleRequestDelete, handleConfirmAction, handleRequestCancel,
        handleAddImageUrl, handleFileSelect, handleRemoveImage,
        handleLocationChange 
    };
};