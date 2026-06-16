import React from 'react';
import {
    Box, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, IconButton,
    TextField, Stack, Dialog, DialogTitle, DialogContent,
    DialogActions, InputAdornment, useMediaQuery, useTheme,
    CircularProgress, Snackbar, Alert, Pagination, Tooltip,
    Chip
} from '@mui/material';
import {
    Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon,
    ArrowBack as ArrowBackIcon, Search as SearchIcon,
    WarningAmberRounded as WarningIcon, CheckCircle as SuccessIcon,
    ErrorOutline as UnsavedIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { useTransportControl } from '../../hooks/useTransportControl';

const TransportControlPage: React.FC = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    const {
        transports, loading, page, totalPages, searchTerm,
        isFormOpen, formData, editingId,
        confirmDialog, snackbar,
        setPage, setFormData, setIsFormOpen, setConfirmDialog, setSnackbar,
        handleSearchChange, handleOpenForm, handleRequestSave, 
        handleRequestDelete, handleConfirmAction, handleRequestCancel
    } = useTransportControl();

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
                            Типи Транспорту
                        </Typography>
                        <Typography sx={{ color: UI_STYLE.textSub, fontWeight: 600 }}>
                            Керування доступними видами транспорту
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
                    Додати транспорт
                </Button>
            </Stack>

            <Paper elevation={0} sx={{ p: 2, mb: 4, borderRadius: '16px', bgcolor: '#fff', border: '1px solid #E2E8F0', boxShadow: UI_STYLE.shadow }}>
                <TextField
                    fullWidth
                    variant="standard"
                    placeholder="Пошук за назвою, номером або описом"
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

            <TableContainer component={Paper} sx={{ borderRadius: '24px', boxShadow: UI_STYLE.shadow, border: 'none', overflow: 'hidden' }}>
                <Table sx={{ minWidth: 900 }}>
                    <TableHead sx={{ bgcolor: '#F1F5F9' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800, color: UI_STYLE.textSub, pl: 4, py: 2, width: '25%' }}>НАЗВА</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: UI_STYLE.textSub, width: '20%' }}>НОМЕР / РЕЙС</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: UI_STYLE.textSub, width: '40%' }}>ОПИС ТА КОМФОРТ</TableCell>
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
                        ) : transports.length > 0 ? (
                            transports.map((item) => (
                                <TableRow key={item.transportId} hover sx={{ '&:hover': { bgcolor: '#F8FAFC !important' } }}>
                                    
                                    <TableCell sx={{ pl: 4, py: 2.5 }}>
                                        <Typography sx={{ fontWeight: 800, color: UI_STYLE.textMain, fontSize: '1rem' }}>
                                            {item.transportName}
                                        </Typography>
                                    </TableCell>
                                    
                                    <TableCell>
                                        <Chip 
                                            label={item.transportNumber} 
                                            size="small" 
                                            sx={{ 
                                                bgcolor: '#EFF6FF', 
                                                color: UI_STYLE.primary, 
                                                fontWeight: 700,
                                                borderRadius: '8px',
                                                fontSize: '0.9rem'
                                            }} 
                                        />
                                    </TableCell>

                                    <TableCell>
                                        <Tooltip title={item.description} placement="top-start" arrow>
                                            <Typography sx={{ 
                                                fontWeight: 500, 
                                                color: UI_STYLE.textSub, 
                                                lineHeight: 1.5,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                maxWidth: '400px'
                                            }}>
                                                {item.description}
                                            </Typography>
                                        </Tooltip>
                                    </TableCell>

                                    <TableCell align="right" sx={{ pr: 4 }}>
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Tooltip title="Редагувати">
                                                <IconButton
                                                    onClick={() => handleOpenForm(item)}
                                                    sx={{ color: UI_STYLE.primary, bgcolor: '#EFF6FF', '&:hover': { bgcolor: '#DBEAFE' } }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Видалити">
                                                <IconButton
                                                    onClick={() => handleRequestDelete(item.transportId)}
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
                                    <Typography color="text.secondary">Транспорт не знайдено</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

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

            <Dialog 
                open={isFormOpen} 
                onClose={() => handleRequestCancel()}
                fullWidth 
                maxWidth="sm"
                PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', pb: 1 }}>
                    {editingId ? 'Редагування' : 'Новий транспорт'}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField
                            label="Назва транспорту"
                            fullWidth
                            value={formData.transportName}
                            onChange={(e) => setFormData({ ...formData, transportName: e.target.value })}
                            variant="outlined"
                            InputProps={{ sx: { borderRadius: 3 } }}
                        />
                        <TextField
                            label="Номер рейсу або транспорту"
                            fullWidth
                            value={formData.transportNumber}
                            onChange={(e) => setFormData({ ...formData, transportNumber: e.target.value })}
                            variant="outlined"
                            InputProps={{ sx: { borderRadius: 3 } }}
                        />
                        <TextField
                            label="Опис та деталі комфорту"
                            fullWidth
                            multiline
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                    {confirmDialog.type === 'DELETE' && 'Видалити транспорт?'}
                    {confirmDialog.type === 'SAVE' && 'Зберегти зміни?'}
                    {confirmDialog.type === 'CANCEL' && 'Скасувати зміни?'}
                </DialogTitle>
                
                <DialogContent>
                    <Typography textAlign="center" color="text.secondary">
                        {confirmDialog.type === 'DELETE' && 'Ви впевнені? Це може вплинути на тури, де використовується цей транспорт.'}
                        {confirmDialog.type === 'SAVE' && 'Ви впевнені, що введені дані правильні?'}
                        {confirmDialog.type === 'CANCEL' && 'Ви внесли зміни, які не були збережені. Дані будуть втрачені.'}
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

export default TransportControlPage;