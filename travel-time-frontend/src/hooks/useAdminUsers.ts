import { useState, useEffect, useCallback } from 'react';
import { UserService } from '../services/UserService';
import { User, UpdateUserRequest } from '../types/user.types';

const ROWS_PER_PAGE = 5;
export type ConfirmActionType = 'DELETE' | 'BLOCK' | 'ROLE' | null;

export const useAdminUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({
        open: false, message: '', severity: 'success'
    });

    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        type: ConfirmActionType;
        title: string;
        content: string;
        payload: any;
    }>({ open: false, type: null, title: '', content: '', payload: null });

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await UserService.getPaginatedUsers(
                page, ROWS_PER_PAGE, searchQuery, filterRole, filterStatus
            );
            setUsers(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    }, [page, searchQuery, filterRole, filterStatus]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSearchChange = (val: string) => { setSearchQuery(val); setPage(1); };
    const handleRoleChange = (val: string) => { setFilterRole(val); setPage(1); };
    const handleStatusChange = (val: string) => { setFilterStatus(val); setPage(1); };
    const handlePageChange = (e: any, val: number) => setPage(val);

    const openConfirmDialog = (type: ConfirmActionType, user: User, targetRole?: string) => {
        let title = '';
        let content = '';
        
        const payload = { userId: user.userId, currentStatus: user.accountStatus, targetRole };

        if (type === 'DELETE') {
            title = 'Видалити користувача?';
            content = `Ви впевнені, що хочете видалити ${user.firstName} ${user.lastName}? Цю дію неможливо скасувати.`;
        } else if (type === 'BLOCK') {
            const isBlocking = user.accountStatus === 'ACTIVE';
            title = isBlocking ? 'Заблокувати користувача?' : 'Розблокувати користувача?';
            content = isBlocking 
                ? `Користувач ${user.firstName} втратить доступ до системи.` 
                : `Доступ для ${user.firstName} буде відновлено.`;
        } else if (type === 'ROLE') {
            title = 'Змінити роль?';
            content = `Роль користувача ${user.firstName} буде змінено на ${targetRole?.toUpperCase()}.`;
        }

        setConfirmDialog({ open: true, type, title, content, payload });
    };

    const closeConfirmDialog = () => {
        setConfirmDialog(prev => ({ ...prev, open: false }));
    };

    const handleConfirmAction = async () => {
        const { type, payload } = confirmDialog;
        closeConfirmDialog();
        if (!payload) return;

        try {
            if (type === 'DELETE') {
                await UserService.deleteUser(payload.userId);
                setSnackbar({ open: true, message: 'Користувача видалено', severity: 'success' });
            } 
            else if (type === 'BLOCK' || type === 'ROLE') {
                const updateRequest: UpdateUserRequest = {};
                
                if (type === 'BLOCK') {
                    updateRequest.accountStatus = payload.currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
                } else if (type === 'ROLE') {
                    updateRequest.role = payload.targetRole?.toUpperCase();
                }

                await UserService.updateUserByAdmin(payload.userId, updateRequest);
                setSnackbar({ open: true, message: 'Оновлено успішно', severity: 'success' });
            }
            
            fetchUsers();
            
        } catch (error) {
            console.error("Action failed", error);
        }
    };

    return {
        users, loading, page, totalPages,
        searchQuery, filterRole, filterStatus,
        snackbar, confirmDialog,
        
        setSnackbar, 
        handleSearchChange, handleRoleChange, handleStatusChange, handlePageChange,
        
        openConfirmDialog, closeConfirmDialog, handleConfirmAction
    };
};