import React from 'react';
import {
    Box, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, IconButton,
    TextField, Stack, Dialog, DialogTitle, DialogContent,
    DialogActions, InputAdornment, useTheme,
    CircularProgress, Snackbar, Alert, Pagination, Tooltip,
    Avatar
} from '@mui/material';
import {
    Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon,
    ArrowBack as ArrowBackIcon, Public as CountryIcon,
    FmdGood as AddressIcon, Search as SearchIcon,
    WarningAmberRounded as WarningIcon, CheckCircle as SuccessIcon,
    ErrorOutline as UnsavedIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { useLocationsControl } from '../../hooks/useLocationsControl';

const ManagePlacesPage: React.FC = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    
    const {
        locations, loading, page, totalPages, searchTerm,
        isFormOpen, formData, editingId,
        confirmDialog, snackbar,
        setPage, setFormData, setIsFormOpen, setConfirmDialog, setSnackbar,
        handleSearchChange, handleOpenForm, handleRequestSave, 
        handleRequestDelete, handleConfirmAction, handleRequestCancel
    } = useLocationsControl();

    // --- STYLES ---
    const UI_STYLE = {
        bg: '#F8FAFC',
        textMain: '#0F172A',
        textSub: '#64748B',
        primary: '#2563EB',
        primaryHover: '#1D4ED8',
        danger: '#EF4444',
        success: '#10B981',
        warning: '#F59E0B',
        shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
    };

    return (
        <Box sx={{ p: { xs: 2, md: 5 }, bgcolor: UI_STYLE.bg, minHeight: '100vh' }}>
            
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 5 }}>
                <Box display="flex" alignItems="center" gap={1}> 
                    <IconButton
                        onClick={() => navigate('/management/tours')} 
                        sx={{ p: 0, mr: 2, color: UI_STYLE.textMain, '&:hover': { bgcolor: 'transparent', opacity: 0.7 } }}
                        disableRipple
                    >
                        <ArrowBackIcon sx={{ fontSize: 32 }} />
                    </IconButton>
                    
                    <Box>
                        <Typography variant="h3" sx={{ fontWeight: 950, color: UI_STYLE.textMain, letterSpacing: '-1.5px' }}>
                            Керування Локаціями
                        </Typography>
                        <Typography sx={{ color: UI_STYLE.textSub, fontWeight: 600 }}>
                            Додавайте та редагуйте напрямки для турів
                        </Typography>
                    </Box>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenForm()}
                    sx={{ 
                        bgcolor: UI_STYLE.primary,
                        borderRadius: '14px', px: 4, py: 1.5, 
                        fontWeight: 800, textTransform: 'uppercase',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                        '&:hover': { bgcolor: UI_STYLE.primaryHover, transform: 'translateY(-1px)' }
                    }}
                >
                    Додати локацію
                </Button>
            </Stack>

            {/* Search */}
            <Paper elevation={0} sx={{ p: 2, mb: 4, borderRadius: '16px', bgcolor: '#fff', border: '1px solid #E2E8F0', boxShadow: UI_STYLE.shadow }}>
                <TextField
                    fullWidth
                    variant="standard"
                    placeholder="Швидкий пошук за країною або містом"
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    InputProps={{
                        disableUnderline: true,
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ ml: 1, color: UI_STYLE.primary }} />
                            </InputAdornment>
                        ),
                        sx: { fontWeight: 600, fontSize: '1.1rem' }
                    }}
                />
            </Paper>

            {/* Table */}
            <TableContainer component={Paper} sx={{ borderRadius: '24px', boxShadow: UI_STYLE.shadow, border: 'none', overflow: 'hidden' }}>
                <Table sx={{ minWidth: 900 }}>
                    <TableHead sx={{ bgcolor: '#F1F5F9' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800, color: UI_STYLE.textSub, pl: 4, py: 2, width: '25%' }}>КРАЇНА</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: UI_STYLE.textSub, width: '25%' }}>МІСТО</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: UI_STYLE.textSub, width: '35%' }}>РЕГІОН</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800, color: UI_STYLE.textSub, pr: 4, width: '15%' }}>ДІЇ</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody sx={{ bgcolor: '#fff' }}>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : locations.length > 0 ? (
                            locations.map((loc) => (
                                // camelCase: locationId
                                <TableRow key={loc.locationId} hover sx={{ '&:hover': { bgcolor: '#F8FAFC !important' } }}>
                                    
                                    {/* 1. Колонка КРАЇНА (camelCase: countryName) */}
                                    <TableCell sx={{ pl: 4, py: 2.5 }}>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar sx={{ bgcolor: '#E0F2FE', color: UI_STYLE.primary, borderRadius: '12px', width: 40, height: 40 }}>
                                                <CountryIcon fontSize="small" />
                                            </Avatar>
                                            <Typography sx={{ fontWeight: 800, color: UI_STYLE.textMain, fontSize: '1rem' }}>
                                                {loc.countryName}
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                    
                                    {/* 2. Колонка МІСТО (camelCase: cityName) */}
                                    <TableCell>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography sx={{ fontWeight: 600, color: UI_STYLE.textMain, fontSize: '0.95rem' }}>
                                                {loc.cityName}
                                            </Typography>
                                        </Stack>
                                    </TableCell>

                                    {/* 3. Колонка РЕГІОН (camelCase: region) */}
                                    <TableCell>
                                        <Typography sx={{ fontWeight: 500, color: UI_STYLE.textSub, display: 'flex', alignItems: 'center', gap: 1, lineHeight: 1.4 }}>
                                            <AddressIcon sx={{ fontSize: '1.1rem', color: UI_STYLE.primary, flexShrink: 0 }} />
                                            {loc.regionName || '—'}
                                        </Typography>
                                    </TableCell>

                                    {/* 4. Колонка ДІЇ */}
                                    <TableCell align="right" sx={{ pr: 4 }}>
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Tooltip title="Редагувати">
                                                <IconButton
                                                    onClick={() => handleOpenForm(loc)}
                                                    sx={{ color: UI_STYLE.primary, bgcolor: '#EFF6FF', '&:hover': { bgcolor: '#DBEAFE' } }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Видалити">
                                                <IconButton
                                                    // camelCase: locationId
                                                    onClick={() => handleRequestDelete(loc.locationId)}
                                                    sx={{ color: UI_STYLE.danger, bgcolor: '#FEF2F2', '&:hover': { bgcolor: '#FEE2E2' } }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                                    <Typography color="text.secondary">Локацій не знайдено</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination */}
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                <Pagination 
                    count={totalPages} 
                    page={page} 
                    onChange={(e, v) => setPage(v)} 
                    shape="rounded" 
                    color="primary" 
                    size="large"
                />
            </Box>

            {/* FORM DIALOG */}
            <Dialog 
                open={isFormOpen} 
                onClose={() => handleRequestCancel()}
                fullWidth 
                maxWidth="sm"
                PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', pb: 1 }}>
                    {editingId ? 'Редагування локації' : 'Нова локація'}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField
                            label="Країна"
                            fullWidth
                            // camelCase: countryName
                            value={formData.countryName}
                            onChange={(e) => setFormData({ ...formData, countryName: e.target.value })}
                            variant="outlined"
                            InputProps={{ sx: { borderRadius: 3 } }}
                        />
                        <TextField
                            label="Місто"
                            fullWidth
                            // camelCase: cityName
                            value={formData.cityName}
                            onChange={(e) => setFormData({ ...formData, cityName: e.target.value })}
                            variant="outlined"
                            InputProps={{ sx: { borderRadius: 3 } }}
                        />
                        <TextField
                            label="Регіон"
                            fullWidth
                            // camelCase: regionName
                            value={formData.regionName}
                            onChange={(e) => setFormData({ ...formData, regionName: e.target.value })}
                            variant="outlined"
                            InputProps={{ sx: { borderRadius: 3 } }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => handleRequestCancel()} color="inherit" sx={{ fontWeight: 600, borderRadius: 2 }}>
                        Скасувати
                    </Button>
                    <Button 
                        onClick={handleRequestSave} 
                        variant="contained" 
                        sx={{ fontWeight: 700, borderRadius: 2, px: 4, py: 1, boxShadow: 'none', bgcolor: UI_STYLE.primary }}
                    >
                        Зберегти
                    </Button>
                </DialogActions>
            </Dialog>

            {/* CONFIRM DIALOG */}
            <Dialog 
                open={confirmDialog.open} 
                onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
                PaperProps={{ sx: { borderRadius: 4, p: 1, maxWidth: 400 } }}
            >
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                    {confirmDialog.type === 'DELETE' && (
                         <WarningIcon sx={{ fontSize: 60, color: UI_STYLE.danger, bgcolor: '#FEE2E2', borderRadius: '50%', p: 1 }} />
                    )}
                    {confirmDialog.type === 'SAVE' && (
                        <SuccessIcon sx={{ fontSize: 60, color: UI_STYLE.success, bgcolor: '#DCFCE7', borderRadius: '50%', p: 1 }} />
                    )}
                    {confirmDialog.type === 'CANCEL' && (
                        <UnsavedIcon sx={{ fontSize: 60, color: UI_STYLE.warning, bgcolor: '#FEF3C7', borderRadius: '50%', p: 1 }} />
                    )}
                </Box>
                
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 800 }}>
                    {confirmDialog.type === 'DELETE' && 'Видалити локацію?'}
                    {confirmDialog.type === 'SAVE' && 'Зберегти зміни?'}
                    {confirmDialog.type === 'CANCEL' && 'Скасувати зміни?'}
                </DialogTitle>
                
                <DialogContent>
                    <Typography textAlign="center" color="text.secondary">
                        {confirmDialog.type === 'DELETE' && 'Ви впевнені, що хочете видалити цю локацію? Це може вплинути на існуючі тури.'}
                        {confirmDialog.type === 'SAVE' && 'Ви впевнені, що введені дані правильні?'}
                        {confirmDialog.type === 'CANCEL' && 'Ви внесли зміни, які не були збережені. Ви впевнені, що хочете закрити вікно? Дані будуть втрачені.'}
                    </Typography>
                </DialogContent>
                
                <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
                    <Button 
                        onClick={() => {
                            setConfirmDialog({ ...confirmDialog, open: false });
                            if (confirmDialog.type === 'SAVE') setIsFormOpen(true);
                        }} 
                        color="inherit" 
                        sx={{ fontWeight: 600 }}
                    >
                        Ні, повернутись
                    </Button>
                    <Button 
                        onClick={handleConfirmAction} 
                        variant="contained" 
                        color={confirmDialog.type === 'DELETE' || confirmDialog.type === 'CANCEL' ? 'error' : 'success'}
                        sx={{ borderRadius: 2, fontWeight: 700, px: 3, boxShadow: 'none' }}
                    >
                        {confirmDialog.type === 'DELETE' && 'Видалити'}
                        {confirmDialog.type === 'SAVE' && 'Так, зберегти'}
                        {confirmDialog.type === 'CANCEL' && 'Так, скасувати'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={4000} 
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%', fontWeight: 600, borderRadius: 2 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

        </Box>
    );
};

export default ManagePlacesPage;