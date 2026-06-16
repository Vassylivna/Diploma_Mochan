import { useState, useEffect, useCallback } from 'react';
import { Transport, TransportRequest } from '../types/transport.types';
import { TransportService } from '../services/TransportService';

const ITEMS_PER_PAGE = 6;
type ConfirmActionType = 'DELETE' | 'SAVE' | 'CANCEL' | null;

export const useTransportControl = () => {
    const [transports, setTransports] = useState<Transport[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [formData, setFormData] = useState<TransportRequest>({
        transportName: '',
        transportNumber: '',
        description: ''
    });

    const [initialFormData, setInitialFormData] = useState<TransportRequest>({
        transportName: '',
        transportNumber: '',
        description: ''
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
            const response = await TransportService.getPaginated(page, ITEMS_PER_PAGE, searchTerm);
            setTransports(response.content);
            setTotalPages(response.totalPages || 1);
        } catch (error) {
            console.error("Failed to load transports", error);
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

    const handleOpenForm = (transport?: Transport) => {
        let data: TransportRequest;
        if (transport) {
            setEditingId(transport.transportId);
            data = {
                transportName: transport.transportName, 
                transportNumber: transport.transportNumber,
                description: transport.description || '',
            };
        } else {
            setEditingId(null);
            data = { transportName: '', transportNumber: '', description: '' };
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
        if (!formData.transportName.trim() || !formData.transportNumber.trim()) {
            setSnackbar({ open: true, message: 'Назва та номер транспорту є обов’язковими!', severity: 'error' });
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
                await TransportService.delete(payload);
                setSnackbar({ open: true, message: 'Транспорт успішно видалено', severity: 'success' });
                
                if (transports.length === 1 && page > 1) {
                    setPage(prev => prev - 1);
                } else {
                    loadData();
                }
            }
            else if (type === 'SAVE') {
                if (payload.id) {
                    await TransportService.update(payload.id, payload.data);
                    setSnackbar({ open: true, message: 'Транспорт оновлено', severity: 'success' });
                } else {
                    await TransportService.create(payload.data);
                    setSnackbar({ open: true, message: 'Транспорт створено', severity: 'success' });
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
        transports, loading, page, totalPages, searchTerm,
        isFormOpen, formData, editingId,
        confirmDialog, snackbar,
        setPage, setFormData, setIsFormOpen, setConfirmDialog, setSnackbar,
        handleSearchChange, handleOpenForm, handleRequestSave,
        handleRequestDelete, handleConfirmAction, handleRequestCancel
    };
};