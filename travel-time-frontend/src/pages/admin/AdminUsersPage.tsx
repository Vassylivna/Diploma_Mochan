import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, IconButton,
    TextField, Stack, Dialog, DialogTitle, DialogContent,
    DialogActions, InputAdornment, Button, Chip,
    CircularProgress, Snackbar, Alert, Pagination, Tooltip,
    FormControl, Select, MenuItem, Menu, ListItemIcon, ListItemText
} from '@mui/material';

import {
    Delete as DeleteIcon,
    ArrowBack as ArrowBackIcon,
    Search as SearchIcon,
    WarningAmberRounded as WarningIcon,
    CheckCircle as SuccessIcon,
    AdminPanelSettings as AdminIcon,
    Person as UserIcon,
    Block as BlockIcon,
    CheckCircleOutline as ActiveIcon,
    Map as GuideIcon,
    ManageAccounts as ManageAccountsIcon 
} from '@mui/icons-material';


import { useAdminUsers } from '../../hooks/useAdminUsers'; 
import { User } from '../../types/user.types';

const UI_STYLE = {
    bg: '#F8FAFC',
    textMain: '#0F172A',
    textSub: '#64748B',
    primary: '#2563EB',
    primaryHover: '#1D4ED8',
    danger: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    guide: '#8B5CF6', 
    shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
};

const AdminUsersPage: React.FC = () => {
    const navigate = useNavigate();

    const {
        users, loading, page, totalPages,
        searchQuery, filterRole, filterStatus,
        snackbar, confirmDialog,
        setSnackbar,
        handleSearchChange, handleRoleChange, handleStatusChange, handlePageChange,
        openConfirmDialog, closeConfirmDialog, handleConfirmAction
    } = useAdminUsers();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedUserForMenu, setSelectedUserForMenu] = useState<User | null>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
        setAnchorEl(event.currentTarget);
        setSelectedUserForMenu(user);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedUserForMenu(null);
    };

    const handleRoleSelect = (role: 'admin' | 'user' | 'guide') => {
        if (selectedUserForMenu) {
            openConfirmDialog('ROLE', selectedUserForMenu, role);
        }
        handleMenuClose();
    };

    const getRoleConfig = (role: string) => {
        switch (role) {
            case 'ADMIN': return { label: 'Admin', color: '#DBEAFE', text: '#1E40AF', icon: <AdminIcon fontSize="small"/> };
            case 'GUIDE': return { label: 'Guide', color: '#EDE9FE', text: '#6D28D9', icon: <GuideIcon fontSize="small"/> };
            default: return { label: 'User', color: '#F1F5F9', text: '#475569', icon: <UserIcon fontSize="small"/> };
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 5 }, bgcolor: UI_STYLE.bg, minHeight: '100vh' }}>
            
            <Stack direction="row" alignItems="center" gap={2} sx={{ mb: 5 }}>
                <IconButton
                    onClick={() => navigate('/')} 
                    sx={{ p: 0, color: UI_STYLE.textMain, '&:hover': { bgcolor: 'transparent', opacity: 0.7 } }}
                    disableRipple
                >
                    <ArrowBackIcon sx={{ fontSize: 32 }} />
                </IconButton>
                
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: UI_STYLE.textMain, letterSpacing: '-1px', fontSize: { xs: '1.8rem', md: '2.5rem'} }}>
                        Користувачі
                    </Typography>
                    <Typography sx={{ color: UI_STYLE.textSub, fontWeight: 500, mt: 0.5 }}>
                        Керування доступом та ролями
                    </Typography>
                </Box>
            </Stack>

            <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: '16px', bgcolor: '#fff', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
                    <TextField
                        fullWidth
                        placeholder="Введіть ім'я або email"
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: '#94A3B8' }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ 
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                bgcolor: '#F8FAFC',
                                '& fieldset': { borderColor: '#E2E8F0' },
                                '&:hover fieldset': { borderColor: '#CBD5E1' },
                                '&.Mui-focused fieldset': { borderColor: UI_STYLE.primary }
                            }
                        }}
                    />

                    {/* ФІЛЬТРИ */}
                    <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', md: 'auto' }, minWidth: { md: 400 } }}>
                        <FormControl fullWidth>
                            <Select
                                value={filterRole}
                                onChange={(e) => handleRoleChange(e.target.value)}
                                displayEmpty
                                sx={{ borderRadius: '12px', bgcolor: '#F8FAFC' }}
                            >
                                <MenuItem value="all">Всі ролі</MenuItem>
                                <MenuItem value="ADMIN">Адміністратори</MenuItem>
                                <MenuItem value="GUIDE">Гіди</MenuItem>
                                <MenuItem value="USER">Користувачі</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <Select
                                value={filterStatus}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                displayEmpty
                                sx={{ borderRadius: '12px', bgcolor: '#F8FAFC' }}
                            >
                                <MenuItem value="all">Всі статуси</MenuItem>
                                <MenuItem value="ACTIVE">Активні</MenuItem>
                                <MenuItem value="BLOCKED">Заблоковані</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </Stack>
            </Paper>

            {/* --- TABLE --- */}
            <TableContainer component={Paper} sx={{ borderRadius: '16px', boxShadow: 'none', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                <Table sx={{ minWidth: 800 }}>
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700, color: UI_STYLE.textSub, pl: 4, py: 2.5, fontSize: '0.8rem' }}>КОРИСТУВАЧ</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: UI_STYLE.textSub, fontSize: '0.8rem' }}>КОНТАКТИ</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: UI_STYLE.textSub, fontSize: '0.8rem' }}>РОЛЬ</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: UI_STYLE.textSub, fontSize: '0.8rem' }}>СТАТУС</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: UI_STYLE.textSub, pr: 4, fontSize: '0.8rem' }}>ДІЇ</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody sx={{ bgcolor: '#fff' }}>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : users.length > 0 ? (
                            users.map((user) => {
                                const roleConfig = getRoleConfig(user.role);
                                return (
                                <TableRow key={user.userId} hover sx={{ '&:hover': { bgcolor: '#F8FAFC !important' }, '&:last-child td': { border: 0 } }}>
                                    <TableCell sx={{ pl: 4, py: 2.5 }}>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Box sx={{ 
                                                width: 40, height: 40, borderRadius: '10px', 
                                                bgcolor: roleConfig.color, 
                                                color: roleConfig.text,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                {roleConfig.icon}
                                            </Box>
                                            <Box>
                                                <Typography sx={{ fontWeight: 700, color: UI_STYLE.textMain, fontSize: '0.95rem' }}>
                                                    {user.lastName} {user.firstName} {user.middleName}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: UI_STYLE.textSub, fontFamily: 'monospace' }}>
                                                    ID: {user.userId}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 500, color: UI_STYLE.textMain }}>{user.email}</Typography>
                                        <Typography variant="caption" sx={{ color: UI_STYLE.textSub }}>{user.phoneNumber || '—'}</Typography>
                                    </TableCell>

                                    <TableCell>
                                        <Chip 
                                            label={roleConfig.label} 
                                            size="small"
                                            sx={{ 
                                                bgcolor: roleConfig.color,
                                                color: roleConfig.text,
                                                fontWeight: 700, borderRadius: '6px', height: 24, fontSize: '0.75rem'
                                            }}
                                        />
                                    </TableCell>

                                    <TableCell>
                                        <Chip 
                                            // Java: ACTIVE / BLOCKED
                                            icon={user.accountStatus === 'ACTIVE' ? <ActiveIcon style={{fontSize: 14}}/> : <BlockIcon style={{fontSize: 14}}/>}
                                            label={user.accountStatus === 'ACTIVE' ? 'Active' : 'Blocked'} 
                                            size="small"
                                            sx={{ 
                                                bgcolor: user.accountStatus === 'ACTIVE' ? '#DCFCE7' : '#FEE2E2',
                                                color: user.accountStatus === 'ACTIVE' ? '#166534' : '#991B1B',
                                                fontWeight: 700, borderRadius: '6px', height: 24, fontSize: '0.75rem',
                                                '& .MuiChip-icon': { color: 'inherit' }
                                            }}
                                        />
                                    </TableCell>

                                    <TableCell align="right" sx={{ pr: 4 }}>
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            
                                            {/* --- МЕНЮ РОЛЕЙ --- */}
                                            <Tooltip title="Змінити роль">
                                                <IconButton
                                                    onClick={(e) => handleMenuOpen(e, user)}
                                                    disabled={user.userId === 0}
                                                    size="small"
                                                    sx={{ color: UI_STYLE.textSub, bgcolor: '#F1F5F9', borderRadius: '8px', '&:hover': { bgcolor: '#E2E8F0' } }}
                                                >
                                                    <ManageAccountsIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            
                                            <Tooltip title={user.accountStatus === 'BLOCKED' ? "Розблокувати" : "Заблокувати"}>
                                                <IconButton
                                                    onClick={() => openConfirmDialog('BLOCK', user)}
                                                    disabled={user.userId === 0}
                                                    size="small"
                                                    sx={{ 
                                                        color: user.accountStatus === 'BLOCKED' ? UI_STYLE.success : UI_STYLE.warning, 
                                                        bgcolor: user.accountStatus === 'BLOCKED' ? '#F0FDF4' : '#FFFBEB',
                                                        borderRadius: '8px',
                                                        '&:hover': { bgcolor: user.accountStatus === 'BLOCKED' ? '#DCFCE7' : '#FEF3C7' } 
                                                    }}
                                                >
                                                    {user.accountStatus === 'BLOCKED' ? <ActiveIcon fontSize="small" /> : <BlockIcon fontSize="small" />}
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title="Видалити">
                                                <IconButton
                                                    onClick={() => openConfirmDialog('DELETE', user)}
                                                    disabled={user.userId === 0}
                                                    size="small"
                                                    sx={{ 
                                                        color: UI_STYLE.danger, bgcolor: '#FEF2F2', borderRadius: '8px',
                                                        '&:hover': { bgcolor: '#FEE2E2' } 
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            )})
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                    <Typography color="text.secondary" fontWeight={500}>Користувачів не знайдено</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                <Pagination 
                    count={totalPages} page={page} onChange={handlePageChange} 
                    shape="rounded" color="primary" size="large"
                />
            </Box>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{ sx: { borderRadius: '12px', mt: 1, minWidth: 200, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } }}
                transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            >
                {selectedUserForMenu?.role !== 'ADMIN' && (
                    <MenuItem onClick={() => handleRoleSelect('admin')}>
                        <ListItemIcon><AdminIcon fontSize="small" sx={{ color: '#475569' }} /></ListItemIcon>
                        <ListItemText primary="Зробити адміністратором" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }} />
                    </MenuItem>
                )}
                {selectedUserForMenu?.role !== 'GUIDE' && (
                    <MenuItem onClick={() => handleRoleSelect('guide')}>
                        <ListItemIcon><GuideIcon fontSize="small" sx={{ color: '#475569' }} /></ListItemIcon>
                        <ListItemText primary="Зробити гідом" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }} />
                    </MenuItem>
                )}
                {selectedUserForMenu?.role !== 'USER' && (
                    <MenuItem onClick={() => handleRoleSelect('user')}>
                        <ListItemIcon><UserIcon fontSize="small" sx={{ color: '#475569' }} /></ListItemIcon>
                        <ListItemText primary="Зробити користувачем" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }} />
                    </MenuItem>
                )}
            </Menu>

            {/* --- ДІАЛОГ ПІДТВЕРДЖЕННЯ --- */}
            <Dialog 
                open={confirmDialog.open} 
                onClose={closeConfirmDialog}
                PaperProps={{ sx: { borderRadius: 4, p: 1, maxWidth: 400 } }}
            >
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                    {confirmDialog.type === 'BLOCK' ? (
                        <WarningIcon sx={{ fontSize: 60, color: UI_STYLE.warning, bgcolor: '#FEF3C7', borderRadius: '50%', p: 1 }} />
                    ) : confirmDialog.type === 'DELETE' ? (
                        <WarningIcon sx={{ fontSize: 60, color: UI_STYLE.danger, bgcolor: '#FEE2E2', borderRadius: '50%', p: 1 }} />
                    ) : (
                        <SuccessIcon sx={{ fontSize: 60, color: UI_STYLE.primary, bgcolor: '#EFF6FF', borderRadius: '50%', p: 1 }} />
                    )}
                </Box>
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 800, pt: 2 }}>
                    {confirmDialog.title}
                </DialogTitle>
                <DialogContent>
                    <Typography textAlign="center" color="text.secondary" fontSize="0.95rem">
                        {confirmDialog.content}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
                    <Button onClick={closeConfirmDialog} color="inherit" variant="text" sx={{ fontWeight: 600, borderRadius: 2 }}>
                        Скасувати
                    </Button>
                    <Button 
                        onClick={handleConfirmAction} 
                        variant="contained" 
                        sx={{ 
                            borderRadius: 2, fontWeight: 700, px: 3, boxShadow: 'none',
                            bgcolor: confirmDialog.type === 'DELETE' ? UI_STYLE.danger : UI_STYLE.primary,
                            '&:hover': { bgcolor: confirmDialog.type === 'DELETE' ? '#DC2626' : UI_STYLE.primaryHover }
                        }}
                    >
                        Підтвердити
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={4000} 
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert 
                    severity={snackbar.severity} 
                    sx={{ width: '100%', fontWeight: 600, borderRadius: 2 }} 
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminUsersPage;