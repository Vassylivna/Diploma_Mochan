import React from 'react';
import {
    Box, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, IconButton,
    TextField, InputAdornment, Stack, Chip, Tooltip,
    Pagination, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions,
    CircularProgress, FormGroup, Divider, Switch, Snackbar, Alert
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Search as SearchIcon,
    Archive as ArchiveIcon,
    Unarchive as UnarchiveIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    LocationOn as LocationIcon,
    CalendarMonth as DateIcon,
    Groups as SeatsIcon,
    CreditCard as CardIcon,
    Hotel as HotelIcon,
    DirectionsBus as BusIcon,
    ArrowBack as ArrowBackIcon,
    Settings as SettingsIcon,
    LocalShipping as TransportSettingsIcon,
    WarningAmberRounded as WarningIcon,
    HelpOutlineRounded as HelpIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useToursControl } from '../../hooks/useToursControl';

const getSeatsLabel = (count: number) => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return 'місць';
    }
    if (lastDigit === 1) {
        return 'місце';
    }
    if (lastDigit >= 2 && lastDigit <= 4) {
        return 'місця';
    }
    return 'місць';
};

const ToursControlPage: React.FC = () => {
    const navigate = useNavigate();
    
    const {
        tours, loading, page, totalPages, searchTerm, filters, errorMsg, confirmDialog,
        setErrorMsg,
        handleSearchChange, handlePageChange, handleFilterChange,
        openConfirmDialog, closeConfirmDialog, handleConfirmAction,
        handleInstantRestore, isError
    } = useToursControl();

    const UI_STYLE = {
        bg: '#F8FAFC',
        textMain: '#0F172A',
        textSub: '#64748B',
        primary: '#2563EB',
        primaryLight: '#3B82F6',
        primaryHover: '#1D4ED8',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
        shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
    };

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('uk-UA', { day: '2-digit', month: 'short', year: 'numeric' });

    // Спільні стилі для верхніх кнопок
    const headerBtnStyle = {
        borderRadius: '12px',
        fontWeight: 700,
        textTransform: 'none',
        fontSize: '0.95rem',
        px: 2.5,
        py: 1,
        height: 48
    };

    return (
        <Box sx={{ p: { xs: 2, md: 5 }, bgcolor: UI_STYLE.bg, minHeight: '100vh' }}>
            
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 5 }}>
                <Box display="flex" alignItems="center" gap={1}> 
                    <Tooltip title="На головну">
                        <IconButton
                            onClick={() => navigate('/')}
                            sx={{ p: 1, mr: 2, color: UI_STYLE.textMain, '&:hover': { bgcolor: 'transparent', opacity: 0.7 } }}
                            disableRipple
                        >
                            <ArrowBackIcon sx={{ fontSize: 36 }} />
                        </IconButton>
                    </Tooltip>
                    
                    <Box>
                        <Typography variant="h3" sx={{ fontWeight: 800, color: UI_STYLE.textMain, letterSpacing: '-1px', fontSize: '2.2rem' }}>
                            Контроль Турів
                        </Typography>
                        <Typography sx={{ color: UI_STYLE.textSub, fontWeight: 500, fontSize: '1.05rem' }}>
                            Керування пропозиціями та налаштування
                        </Typography>
                    </Box>
                </Box>
                
                <Stack direction="row" spacing={2}>
                    <Button variant="outlined" startIcon={<TransportSettingsIcon />} onClick={() => navigate('/management/transports')} sx={headerBtnStyle}>
                        Транспорт
                    </Button>
                    <Button variant="outlined" startIcon={<HotelIcon />} onClick={() => navigate('/management/hotels')} sx={headerBtnStyle}>
                        Готелі
                    </Button>
                    <Button variant="outlined" startIcon={<SettingsIcon />} onClick={() => navigate('/management/locations')} sx={headerBtnStyle}>
                        Локації
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/management/create-tour')}
                        sx={{ 
                            ...headerBtnStyle,
                            bgcolor: UI_STYLE.primary,
                            px: 4,
                            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)',
                            '&:hover': { bgcolor: UI_STYLE.primaryHover, transform: 'translateY(-1px)' }
                        }}
                    >
                        Створити тур
                    </Button>
                </Stack>
            </Stack>

            <Paper elevation={0} sx={{ 
                p: 2.5, mb: 4, borderRadius: '16px', bgcolor: '#fff', 
                border: '1px solid #E2E8F0',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3
            }}>
                <TextField
                    fullWidth
                    variant="standard"
                    placeholder="Пошук туру..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    InputProps={{
                        disableUnderline: true,
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: UI_STYLE.textSub, fontSize: 28 }} />
                            </InputAdornment>
                        ),
                        sx: { fontWeight: 500, fontSize: '1.1rem' }
                    }}
                    sx={{ flex: 1 }} 
                />
                
                <Box sx={{ display: 'flex', alignItems: 'center', borderLeft: '1px solid #E2E8F0', pl: 3 }}>
                    <FormGroup row sx={{ flexWrap: 'nowrap', gap: 2 }}>
                        <FormControlLabel
                            control={<Switch checked={filters.showAll} onChange={handleFilterChange} name="showAll" />}
                            label={<Typography fontSize="0.95rem" fontWeight={600} color={filters.showAll ? "text.primary" : "text.secondary"}>Всі</Typography>}
                        />
                        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 24, alignSelf: 'center' }} />
                        <FormControlLabel
                            control={<Switch checked={filters.showActive} onChange={handleFilterChange} name="showActive" />}
                            label={<Typography fontSize="0.95rem" fontWeight={500} color={filters.showActive ? "text.primary" : "text.secondary"}>Активні</Typography>}
                        />
                        <FormControlLabel
                            control={<Switch checked={filters.showHidden} onChange={handleFilterChange} name="showHidden" />}
                            label={<Typography fontSize="0.95rem" fontWeight={500} color={filters.showHidden ? "text.primary" : "text.secondary"}>Приховані</Typography>}
                        />
                        <FormControlLabel
                            control={<Switch checked={filters.showArchived} onChange={handleFilterChange} name="showArchived" />}
                            label={<Typography fontSize="0.95rem" fontWeight={500} color={filters.showArchived ? "text.primary" : "text.secondary"}>Архівні</Typography>}
                        />
                    </FormGroup>
                </Box>
            </Paper>

            <TableContainer component={Paper} sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
                <Table sx={{ minWidth: 1000 }}>
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700, color: UI_STYLE.textSub, fontSize: '0.8rem', py: 2.5, pl: 3 }}>НАЗВА ТУРУ / ID</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: UI_STYLE.textSub, fontSize: '0.8rem', py: 2.5 }}>СТАТУС</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: UI_STYLE.textSub, fontSize: '0.8rem', py: 2.5 }}>ЛОКАЦІЯ</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: UI_STYLE.textSub, fontSize: '0.8rem', py: 2.5 }}>ДЕТАЛІ ПОДОРОЖІ</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: UI_STYLE.textSub, fontSize: '0.8rem', py: 2.5 }}>ДАТИ ТА ЦІНА</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: UI_STYLE.textSub, fontSize: '0.8rem', py: 2.5, pr: 3 }}>ДІЇ</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 10 }}><CircularProgress size={40} /></TableCell>
                            </TableRow>
                        ) : tours.map((tour) => {
                            const isArchived = tour.isArchived;
                            const isHidden = tour.isHidden;

                            let rowBgColor = 'inherit';
                            if (isArchived) {
                                rowBgColor = '#F8FAFC';
                            } else if (isHidden) {
                                rowBgColor = '#FEFCE8';
                            }

                            return (
                                <TableRow 
                                    key={tour.tourId} 
                                    hover 
                                    sx={{ 
                                        bgcolor: rowBgColor,
                                        opacity: isArchived ? 0.75 : 1,
                                        transition: 'background-color 0.2s',
                                        '&:hover': { 
                                            bgcolor: isArchived ? '#F1F5F9 !important' : (isHidden ? '#FEF9C3 !important' : undefined) 
                                        }
                                    }}
                                >
                                    <TableCell sx={{ py: 3, pl: 3 }}>
                                        <Box>
                                            <Typography sx={{ fontWeight: 700, color: UI_STYLE.textMain, fontSize: '1.05rem', lineHeight: 1.4, mb: 0.5 }}>
                                                {tour.title}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: UI_STYLE.textSub, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                                ID: #{tour.tourId}
                                            </Typography>
                                        </Box>
                                    </TableCell>

                                    <TableCell>
                                        {isArchived ? 
                                            <Chip label="Архів" sx={{ height: 28, fontSize: '0.8rem', fontWeight: 600, bgcolor: '#E2E8F0', color: '#64748B' }} /> :
                                        isHidden ? 
                                            <Chip label="Прихований" sx={{ height: 28, fontSize: '0.8rem', fontWeight: 600, bgcolor: '#FEF3C7', color: '#D97706' }} /> :
                                            <Chip label="Активний" sx={{ height: 28, fontSize: '0.8rem', fontWeight: 600, bgcolor: '#DCFCE7', color: '#166534' }} />
                                        }
                                    </TableCell>

                                    <TableCell>
                                        <Box display="flex" alignItems="flex-start" gap={1.5}>
                                            <LocationIcon sx={{ fontSize: 22, color: UI_STYLE.textSub, mt: 0.2 }} />
                                            <Typography sx={{ fontSize: '1rem', color: UI_STYLE.textMain, fontWeight: 500, lineHeight: 1.4 }}>
                                                {tour.tourCountries && tour.tourCountries.length > 0 
                                                    ? tour.tourCountries.join(', ') 
                                                    : '—'}
                                            </Typography>
                                        </Box>
                                    </TableCell>

                                    <TableCell>
                                        <Stack spacing={1}>
                                            <Box display="flex" alignItems="center" gap={1.5} color={UI_STYLE.textSub}>
                                                <BusIcon sx={{ fontSize: 20 }} />
                                                <Typography variant="body1" fontSize="0.95rem">
                                                    {tour.transport?.transportName || '—'}
                                                </Typography>
                                            </Box>
                                            
                                            {tour.stars ? (
                                                <Box display="flex" alignItems="center" gap={1.5} color={UI_STYLE.textSub}>
                                                    <HotelIcon sx={{ fontSize: 20 }} />
                                                    <Typography variant="body1" fontSize="0.95rem">
                                                        {tour.stars} ★
                                                    </Typography>
                                                </Box>
                                            ) : null}

                                            <Box display="flex" alignItems="center" gap={1.5} color={UI_STYLE.textSub}>
                                                <SeatsIcon sx={{ fontSize: 20 }} />
                                                <Typography variant="body1" fontSize="0.95rem" fontWeight={400}>
                                                    {tour.totalSeats} {getSeatsLabel(tour.totalSeats)} (всього)
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>

                                    <TableCell>
                                        <Box>
                                            <Typography sx={{ fontWeight: 800, color: UI_STYLE.textMain, fontSize: '1.15rem', mb: 0.5 }}>
                                                {tour.price.toLocaleString()} грн
                                            </Typography>
                                            <Box display="flex" alignItems="center" gap={0.5} color={UI_STYLE.textSub}>
                                                <DateIcon sx={{ fontSize: 16 }} />
                                                <Typography variant="body2" fontWeight={500} fontSize="0.8rem">
                                                    {formatDate(tour.startDate)} — {formatDate(tour.endDate)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>

                                    <TableCell align="right" sx={{ pr: 3 }}>
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Tooltip title="Редагувати">
                                                <IconButton onClick={() => navigate(`/management/edit-tour/${tour.tourId}`)}>
                                                    <EditIcon sx={{ color: UI_STYLE.textSub, fontSize: 22 }} />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title={isHidden ? "Відобразити" : "Приховати"}>
                                                <IconButton onClick={() => openConfirmDialog('HIDE', tour.tourId, tour.title, isHidden)}>
                                                    {isHidden ? <VisibilityOffIcon sx={{ fontSize: 22, color: '#D97706' }} /> : <VisibilityIcon sx={{ fontSize: 22, color: UI_STYLE.textSub }} />}
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title={isArchived ? "Відновити" : "В архів"}>
                                                <IconButton 
                                                    onClick={() => isArchived ? handleInstantRestore(tour.tourId) : openConfirmDialog('ARCHIVE', tour.tourId, tour.title, false)}
                                                >
                                                    {isArchived ? <UnarchiveIcon sx={{ fontSize: 22, color: UI_STYLE.success }} /> : <ArchiveIcon sx={{ fontSize: 22, color: UI_STYLE.textSub }} />}
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title="Видалити">
                                                <IconButton onClick={() => openConfirmDialog('DELETE', tour.tourId, tour.title)}>
                                                    <DeleteIcon sx={{ fontSize: 22, color: UI_STYLE.danger }} />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                <Pagination count={totalPages} page={page} onChange={handlePageChange} shape="rounded" color="primary" size="large" />
            </Box>

            <Snackbar 
                open={!!errorMsg} 
                autoHideDuration={4000} 
                onClose={() => setErrorMsg(null)} 
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert 
                    onClose={() => setErrorMsg(null)} 
                    severity={isError ? "error" : "success"} 
                    sx={{ width: '100%', fontWeight: 600, fontSize: '0.95rem', borderRadius: 2 }}
                >
                    {errorMsg}
                </Alert>
            </Snackbar>

            {/* Dialogs */}
            <Dialog open={confirmDialog.open} onClose={closeConfirmDialog} PaperProps={{ sx: { borderRadius: 4, p: 2, maxWidth: 450 } }}>
                <Box sx={{ textAlign: 'center', mt: 1 }}>
                    {confirmDialog.type === 'DELETE' && <WarningIcon sx={{ fontSize: 56, color: UI_STYLE.danger, bgcolor: '#FEF2F2', borderRadius: '50%', p: 1.5 }} />}
                    {confirmDialog.type === 'ARCHIVE' && <HelpIcon sx={{ fontSize: 56, color: UI_STYLE.textSub, bgcolor: '#F1F5F9', borderRadius: '50%', p: 1.5 }} />}
                    {confirmDialog.type === 'HIDE' && <VisibilityOffIcon sx={{ fontSize: 56, color: UI_STYLE.warning, bgcolor: '#FEF3C7', borderRadius: '50%', p: 1.5 }} />}
                </Box>
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 800, fontSize: '1.25rem' }}>
                    {confirmDialog.type === 'DELETE' ? 'Видалити тур?' : 
                     confirmDialog.type === 'ARCHIVE' ? 'В архів?' :
                     confirmDialog.type === 'HIDE' ? (confirmDialog.currentState ? 'Відобразити тур?' : 'Приховати тур?') : ''}
                </DialogTitle>
                <DialogContent>
                    <Box textAlign="center" color="text.secondary" fontSize="1rem">
                        {confirmDialog.type === 'DELETE' && `Ви впевнені, що бажаєте видалити "${confirmDialog.tourTitle}"?`}
                        {confirmDialog.type === 'ARCHIVE' && `Перемістити тур "${confirmDialog.tourTitle}" в архів?`}
                        {confirmDialog.type === 'HIDE' && `Змінити видимість для "${confirmDialog.tourTitle}"?`}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 2, gap: 2 }}>
                    <Button onClick={closeConfirmDialog} color="inherit" sx={{ fontWeight: 600, fontSize: '0.95rem', color: 'text.secondary' }}>Ні</Button>
                    <Button onClick={handleConfirmAction} variant="contained" color={confirmDialog.type === 'DELETE' ? 'error' : confirmDialog.type === 'HIDE' ? 'warning' : 'primary'} sx={{ borderRadius: 2, fontWeight: 700, px: 4, py: 1, fontSize: '0.95rem', boxShadow: 'none' }}>Так</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ToursControlPage;