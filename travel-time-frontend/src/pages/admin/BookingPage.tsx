import React from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Chip, IconButton, TextField, InputAdornment, Button,
    Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Divider,
    Tabs, Tab, Stack, CircularProgress, Pagination, Container, ToggleButton,
    ToggleButtonGroup, Alert
} from '@mui/material';
import {
    Search as SearchIcon, MoreVert as MoreVertIcon, CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon, Visibility as VisibilityIcon, ArrowBack as ArrowBackIcon,
    Person as PersonIcon, Email as EmailIcon, Phone as PhoneIcon, CreditCard as CreditCardIcon,
    WarningAmberRounded as WarningAmberRoundedIcon, HelpOutlineRounded as HelpOutlineRoundedIcon,
    AccountBalanceWallet as AccountBalanceWalletIcon, RemoveCircleOutline as RemoveCircleOutlineIcon,
    CalendarToday as CalendarTodayIcon, ConfirmationNumber as ConfirmationNumberIcon,
    SwapHoriz as SwapHorizIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { isPast } from 'date-fns';

import { useAdminBookings } from '../../hooks/useAdminBookings';

const AdminBookings: React.FC = () => {
    const navigate = useNavigate();
    
    const {
        paginatedBookings, totalPages, loading, page,
        searchQuery, statusFilter, typeFilters,
        anchorEl, selectedBooking, detailsOpen, confirmDialog,
        setPage, setSearchQuery, setConfirmDialog,
        handlePageChange, handleStatusChange, handleTypeFilter,
        clearTypeFilter,
        handleMenuOpen, handleMenuClose, handleViewDetails, handleCloseDetails,
        handleRequestAction, handleConfirmAction
    } = useAdminBookings();

    // --- HELPERS (UI ONLY) ---
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return { bg: '#dcfce7', color: '#166534', label: 'Оплачено' };
            case 'AWAITING_PAYMENT': return { bg: '#fef3c7', color: '#92400e', label: 'Очікують оплати' };
            case 'PENDING_APPROVAL': return { bg: '#eff6ff', color: '#1e40af', label: 'На перевірці' };
            case 'CANCELLED': return { bg: '#fee2e2', color: '#991b1b', label: 'Скасовано' };
            case 'REFUND_REQUESTED': return { bg: '#f3e5f5', color: '#7b1fa2', label: 'Запит повернення' };
            case 'REFUNDED': return { bg: '#e0f2f1', color: '#00695c', label: 'Повернено' };
            case 'CANCELLED_WITH_PAYMENT': return { bg: '#e0e7ff', color: '#3730a3', label: 'Скасовано (Оплачено)' };
            default: return { bg: '#f1f5f9', color: '#475569', label: status };
        }
    };

    const isTourStarted = confirmDialog.booking ? isPast(new Date(confirmDialog.booking.tour.startDate)) : false;

    const menuStyles = { item: { py: 1.2, px: 2.5, minHeight: 40, gap: 2, fontSize: '0.875rem', fontWeight: 500, color: '#334155', transition: 'all 0.2s', '&:hover': { bgcolor: '#f8fafc', color: '#0f172a' } } };
    const iconColors = { success: '#10b981', danger: '#ef4444', warning: '#f59e0b', info: '#3b82f6', admin: '#8b5cf6' };
    const toggleBtnStyle = { borderRadius: '8px !important', border: '1px solid #e2e8f0 !important', px: 2, py: 0.6, textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', color: '#64748b', bgcolor: '#fff', transition: 'all 0.2s', '&.Mui-selected': { bgcolor: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe !important', '&:hover': { bgcolor: '#dbeafe' } }, '&:hover': { bgcolor: '#f8fafc' } };
    const allBtnActiveStyle = { bgcolor: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe', '&:hover': { bgcolor: '#dbeafe' } };
    const labelStyle = { fontWeight: 700, color: '#94a3b8', width: 80, fontSize: '0.75rem', textTransform: 'uppercase' };

    const renderFilterPanel = () => {
        if (statusFilter === 'ALL') return null;
        
        const isPendingTab = statusFilter === 'PENDING_APPROVAL';

        return (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="caption" sx={labelStyle}>Склад:</Typography>
                    <Button variant="outlined" onClick={clearTypeFilter} sx={{ ...toggleBtnStyle, ...(typeFilters.length === 0 ? allBtnActiveStyle : {}) }}>Всі</Button>
                    <ToggleButtonGroup value={typeFilters} onChange={handleTypeFilter} size="small" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {!isPendingTab && (
                            <ToggleButton value="ADULTS_ONLY" sx={toggleBtnStyle}>Тільки дорослі</ToggleButton>
                        )}
                        <ToggleButton value="WITH_KIDS" sx={toggleBtnStyle}>Діти (0-12)</ToggleButton>
                        <ToggleButton value="WITH_TEENS" sx={toggleBtnStyle}>Підлітки (13-17)</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            </Box>
        );
    };

    return (
        <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            <Container maxWidth="xl">
                <Box display="flex" alignItems="center" gap={1} mb={4}>
                    <IconButton onClick={() => navigate('/tours')} sx={{ p: 0, mr: 1, '&:hover': { bgcolor: 'transparent', opacity: 0.7 } }} disableRipple>
                        <ArrowBackIcon sx={{ fontSize: 32, color: '#1e293b' }} />
                    </IconButton>
                    <Typography variant="h4" fontWeight="800" color="#1e293b">Керування бронюваннями</Typography>
                </Box>

                <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center" justifyContent="space-between">
                        <Tabs value={statusFilter} onChange={handleStatusChange} variant="standard" sx={{ minHeight: 36, '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', fontSize: '0.8rem', minWidth: 'auto', px: 1.5, py: 1, minHeight: 36 }, '& .Mui-selected': { color: '#0f172a' }, '& .MuiTabs-indicator': { bgcolor: '#0f172a', height: 2 } }}>
                            <Tab label="Усі" value="ALL" />
                            <Tab label="На перевірці" value="PENDING_APPROVAL" />
                            <Tab label="Запити на повернення" value="REFUND_REQUESTED" />
                            <Tab label="Очікують оплати" value="AWAITING_PAYMENT" />
                            <Tab label="Оплачені" value="PAID" />
                            <Tab label="Скасовано (оплачені)" value="CANCELLED_WITH_PAYMENT" />
                            <Tab label="Повернені" value="REFUNDED" />
                            <Tab label="Скасовані" value="CANCELLED" />
                        </Tabs>
                        <TextField placeholder="Код бронювання" size="small" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon color="action" fontSize="small" /></InputAdornment>) }} sx={{ minWidth: 250, '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#f8fafc', fontSize: '0.9rem' } }} />
                    </Stack>
                    <Divider sx={{ my: 2, borderColor: '#f1f5f9' }} />
                    {renderFilterPanel()}
                </Paper>

                <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700, color: '#475569', py: 2 }}>Клієнт</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#475569', py: 2 }}>Тур / Код</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#475569', py: 2 }}>Дати подорожі</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#475569', py: 2 }}>До сплати</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#475569', py: 2 }}>Статус</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', py: 2 }}>Управління</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={6} align="center" sx={{ py: 10 }}><CircularProgress /></TableCell></TableRow>
                                ) : paginatedBookings.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} align="center" sx={{ py: 8 }}><Typography color="text.secondary" fontWeight={500}>Записів не знайдено</Typography></TableCell></TableRow>
                                ) : (
                                    paginatedBookings.map((booking) => {
                                        const statusInfo = getStatusColor(booking.status);
                                        return (
                                            // camelCase: bookingId
                                            <TableRow key={booking.bookingId} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                <TableCell>
                                                    <Box>
                                                        {/* camelCase: user.lastName, firstName */}
                                                        <Typography fontWeight={600} color="#0f172a" fontSize="0.95rem">{booking.user.lastName} {booking.user.firstName}</Typography>
                                                        {/* camelCase: phoneNumber */}
                                                        <Typography variant="body2" color="text.secondary" fontSize="0.85rem">{booking.user.phoneNumber}</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography fontWeight={500} color="#334155" sx={{ maxWidth: 220 }} noWrap fontSize="0.95rem">{booking.tour.title}</Typography>
                                                    {/* camelCase: paymentCode */}
                                                    <Chip label={booking.paymentCode || '-'} size="small" variant="outlined" sx={{ mt: 0.5, height: 20, fontSize: '0.7rem', fontWeight: 600, borderColor: '#cbd5e1' }} />
                                                </TableCell>
                                                <TableCell>
                                                    {/* camelCase: startDate */}
                                                    <Typography variant="body2" color="#334155" fontSize="0.9rem">{new Date(booking.tour.startDate).toLocaleDateString('uk-UA')}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    {/* camelCase: totalPrice */}
                                                    <Typography fontWeight={700} color="#0f172a" fontSize="0.95rem">{booking.totalPrice.toLocaleString()} грн</Typography>
                                                </TableCell>
                                                <TableCell><Chip label={statusInfo.label} size="small" sx={{ bgcolor: statusInfo.bg, color: statusInfo.color, fontWeight: 700, borderRadius: 1.5, fontSize: '0.75rem', height: 24 }} /></TableCell>
                                                <TableCell align="right">
                                                    {booking.status === 'PENDING_APPROVAL' && (<Button variant="contained" size="small" color="primary" disableElevation onClick={() => handleRequestAction('APPROVE_BOOKING', booking)} sx={{ mr: 1, borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}>Підтвердити</Button>)}
                                                    {booking.status === 'REFUND_REQUESTED' && (<Button variant="contained" size="small" color="warning" disableElevation onClick={() => handleRequestAction('APPROVE_REFUND', booking)} sx={{ mr: 1, borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}>Повернути кошти</Button>)}
                                                    <IconButton onClick={(e) => handleMenuOpen(e, booking)} size="small"><MoreVertIcon fontSize="small" color="action" /></IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', borderTop: '1px solid #e2e8f0', bgcolor: '#fff' }}>
                        <Pagination count={totalPages} page={page} onChange={handlePageChange} shape="rounded" color="primary" />
                    </Box>
                </Paper>
            </Container>

            {/* --- МЕНЮ --- */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} PaperProps={{ sx: { borderRadius: 3, minWidth: 280, boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' } }} transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
                <MenuItem onClick={() => selectedBooking && handleViewDetails(selectedBooking)} sx={menuStyles.item}><VisibilityIcon sx={{ fontSize: 20, color: '#64748b' }} /> Деталі бронювання</MenuItem>
                
                {selectedBooking && ['PENDING_APPROVAL', 'REFUND_REQUESTED', 'AWAITING_PAYMENT', 'PAID'].includes(selectedBooking.status) && (
                    <Divider sx={{ my: 0.5 }} />
                )}
                
                {selectedBooking?.status === 'PENDING_APPROVAL' && (<>
                    <MenuItem onClick={() => selectedBooking && handleRequestAction('APPROVE_BOOKING', selectedBooking)} sx={menuStyles.item}><CheckCircleIcon sx={{ fontSize: 20, color: iconColors.success }} /> Підтвердити бронювання</MenuItem>
                    <MenuItem onClick={() => selectedBooking && handleRequestAction('CANCEL_BOOKING', selectedBooking)} sx={menuStyles.item}><CancelIcon sx={{ fontSize: 20, color: iconColors.danger }} /> Скасувати бронювання</MenuItem>
                </>)}

                {selectedBooking?.status === 'REFUND_REQUESTED' && (<>
                    <MenuItem onClick={() => selectedBooking && handleRequestAction('APPROVE_REFUND', selectedBooking)} sx={menuStyles.item}><AccountBalanceWalletIcon sx={{ fontSize: 20, color: iconColors.warning }} /> Підтвердити повернення коштів</MenuItem>
                    <MenuItem onClick={() => selectedBooking && handleRequestAction('REJECT_REFUND', selectedBooking)} sx={menuStyles.item}><RemoveCircleOutlineIcon sx={{ fontSize: 20, color: iconColors.danger }} /> Відмовити та залишити оплаченим</MenuItem>
                </>)}

                {selectedBooking?.status === 'AWAITING_PAYMENT' && (<>
                    <MenuItem onClick={() => selectedBooking && handleRequestAction('MARK_PAID', selectedBooking)} sx={menuStyles.item}><CreditCardIcon sx={{ fontSize: 20, color: iconColors.success }} /> Підтвердити отримання оплати</MenuItem>
                </>)}

                {selectedBooking?.status === 'PAID' && (<>
                    <MenuItem onClick={() => selectedBooking && handleRequestAction('FORCE_REFUND', selectedBooking)} sx={menuStyles.item}><AccountBalanceWalletIcon sx={{ fontSize: 20, color: iconColors.warning }} /> Виконати повернення коштів</MenuItem>
                </>)}
            </Menu>

            {/* --- ДІАЛОГ ПІДТВЕРДЖЕННЯ --- */}
            <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ ...confirmDialog, open: false })} PaperProps={{ sx: { borderRadius: 4, p: 2, maxWidth: 420 } }}>
                <Box sx={{ textAlign: 'center', mt: 1 }}>
                    {confirmDialog.type === 'APPROVE_BOOKING' && <HelpOutlineRoundedIcon sx={{ fontSize: 60, color: '#3b82f6', bgcolor: '#dbeafe', borderRadius: '50%', p: 1 }} />}
                    {(confirmDialog.type === 'MARK_PAID' || confirmDialog.type === 'RESTORE_TO_PAID') && (<CreditCardIcon sx={{ fontSize: 60, color: '#16a34a', bgcolor: '#dcfce7', borderRadius: '50%', p: 1 }} />)}
                    {(confirmDialog.type === 'APPROVE_REFUND' || confirmDialog.type === 'FORCE_REFUND') && (<AccountBalanceWalletIcon sx={{ fontSize: 60, color: '#f59e0b', bgcolor: '#fef3c7', borderRadius: '50%', p: 1 }} />)}
                    {['CANCEL_BOOKING', 'CANCEL_ADMIN_ERROR', 'REJECT_REFUND', 'MOVE_TO_CANCELLED_WITH_PAYMENT'].includes(confirmDialog.type || '') && <WarningAmberRoundedIcon sx={{ fontSize: 60, color: '#ef4444', bgcolor: '#fee2e2', borderRadius: '50%', p: 1 }} />}
                    {['RESTORE_TO_PENDING', 'RESTORE_TO_AWAITING', 'RESTORE_TO_REFUND_REQUESTED'].includes(confirmDialog.type || '') && <SwapHorizIcon sx={{ fontSize: 60, color: '#7e22ce', bgcolor: '#f3e8ff', borderRadius: '50%', p: 1 }} />}
                </Box>
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 800, fontSize: '1.25rem', pt: 2, pb: 1 }}>
                    {['APPROVE_BOOKING', 'MARK_PAID', 'RESTORE_TO_PAID', 'APPROVE_REFUND', 'FORCE_REFUND', 'REJECT_REFUND'].includes(confirmDialog.type || '') ? "Підтвердити дію?" : 
                     ['CANCEL_BOOKING', 'CANCEL_ADMIN_ERROR', 'MOVE_TO_CANCELLED_WITH_PAYMENT'].includes(confirmDialog.type || '') ? "Скасування / Ануляція" : "Зміна статусу"}
                </DialogTitle>
                <DialogContent>
                    <Typography textAlign="center" color="text.secondary" fontSize="0.95rem" sx={{ mb: isTourStarted ? 2 : 0 }}>
                          Ви впевнені, що хочете виконати цю дію?
                    </Typography>
                    {isTourStarted && <Alert severity="warning" sx={{ mt: 2, borderRadius: 2, fontSize: '0.85rem' }}><Typography variant="subtitle2" fontWeight={700}>Увага: Тур вже розпочався або завершився</Typography>Зміна статусу вплине лише на звітність.</Alert>}
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 2 }}>
                    <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })} color="inherit" variant="text" sx={{ borderRadius: 2, fontWeight: 600, color: 'text.secondary' }}>Скасувати</Button>
                    <Button onClick={handleConfirmAction} variant="contained" color={['CANCEL_BOOKING', 'CANCEL_ADMIN_ERROR', 'REJECT_REFUND', 'MOVE_TO_CANCELLED_WITH_PAYMENT'].includes(confirmDialog.type || '') ? "error" : ['APPROVE_REFUND', 'FORCE_REFUND'].includes(confirmDialog.type || '') ? "warning" : "primary"} disableElevation sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}>Підтвердити</Button>
                </DialogActions>
            </Dialog>

            {/* --- ДЕТАЛІ БРОНЮВАННЯ --- */}
            <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
                {selectedBooking && (
                    <>
                        <DialogTitle sx={{ borderBottom: '1px solid #f1f5f9', pb: 2, pt: 3, px: 3, bgcolor: '#fff' }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                {/* camelCase: bookingId */}
                                <Typography variant="h6" fontWeight="800" fontSize="1.1rem" color="#1e293b">Бронювання #{selectedBooking.bookingId}</Typography>
                                <Chip label={getStatusColor(selectedBooking.status).label} size="small" sx={{ bgcolor: getStatusColor(selectedBooking.status).bg, color: getStatusColor(selectedBooking.status).color, fontWeight: 700, borderRadius: 1.5, height: 24, fontSize: '0.75rem' }} />
                            </Box>
                        </DialogTitle>
                        <DialogContent sx={{ p: 3, bgcolor: '#fff' }}>
                            <Stack spacing={2}>
                                {/* КЛІЄНТ */}
                                <Paper elevation={0} variant="outlined" sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box sx={{ p: 1, bgcolor: '#fff', borderRadius: '50%', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex' }}><PersonIcon color="action" fontSize="small" /></Box>
                                        <Box flex={1}>
                                            <Typography variant="caption" color="text.secondary" fontWeight={700} letterSpacing={0.5}>КЛІЄНТ</Typography>
                                            {/* camelCase: lastName, firstName, middleName */}
                                            <Typography fontWeight={700} color="#1e293b" fontSize="0.95rem" lineHeight={1.2}>{selectedBooking.user.lastName} {selectedBooking.user.firstName} {selectedBooking.user.middleName}</Typography>
                                            <Stack direction="row" spacing={2} mt={0.5} alignItems="center" flexWrap="wrap">
                                                {/* camelCase: phoneNumber */}
                                                <Box display="flex" alignItems="center" gap={0.5}><PhoneIcon sx={{ fontSize: 14, color: '#64748b' }} /><Typography variant="caption" color="text.secondary" fontWeight={500}>{selectedBooking.user.phoneNumber}</Typography></Box>
                                                <Box display="flex" alignItems="center" gap={0.5}><EmailIcon sx={{ fontSize: 14, color: '#64748b' }} /><Typography variant="caption" color="text.secondary" fontWeight={500}>{selectedBooking.user.email}</Typography></Box>
                                            </Stack>
                                        </Box>
                                    </Box>
                                </Paper>
                                {/* ТУР */}
                                <Box>
                                    <Typography variant="h6" fontWeight={700} color="#0f172a" fontSize="1.05rem" gutterBottom lineHeight={1.2}>{selectedBooking.tour.title}</Typography>
                                    <Box display="flex" flexDirection="column" gap={1.5}>
                                        <Box display="flex" gap={1.5}>
                                            <Box flex={1} sx={{ p: 1.5, border: '1px solid #f1f5f9', borderRadius: 2 }}>
                                                <Box display="flex" alignItems="center" gap={1} mb={0.5}><ConfirmationNumberIcon sx={{ fontSize: 16, color: '#3b82f6' }} /><Typography variant="caption" fontWeight={600} color="text.secondary">КОД</Typography></Box>
                                                {/* camelCase: paymentCode */}
                                                <Typography variant="body2" fontWeight={700} color="#1e293b">{selectedBooking.paymentCode || '—'}</Typography>
                                            </Box>
                                            <Box flex={1} sx={{ p: 1.5, border: '1px solid #f1f5f9', borderRadius: 2 }}>
                                                <Box display="flex" alignItems="center" gap={1} mb={0.5}><CalendarTodayIcon sx={{ fontSize: 16, color: '#3b82f6' }} /><Typography variant="caption" fontWeight={600} color="text.secondary">ДАТИ</Typography></Box>
                                                {/* camelCase: startDate, endDate */}
                                                <Typography variant="body2" fontWeight={700} color="#1e293b" noWrap>{new Date(selectedBooking.tour.startDate).toLocaleDateString('uk-UA')} — {new Date(selectedBooking.tour.endDate).toLocaleDateString('uk-UA')}</Typography>
                                            </Box>
                                        </Box>
                                        {/* camelCase: cardNumberMasked */}
                                        {selectedBooking.cardNumberMasked && (
                                            <Box sx={{ width: '100%', px: 1.5, py: 1, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px dashed #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Box display="flex" alignItems="center" gap={1}><CreditCardIcon sx={{ fontSize: 16, color: '#16a34a' }} /><Typography variant="caption" fontWeight={600} color="#15803d">ОПЛАТА КАРТОЮ</Typography></Box>
                                                <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace', letterSpacing: 1, color: '#166534' }}>{selectedBooking.cardNumberMasked}</Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                                {/* СКЛАД ТА ЦІНА */}
                                <Box sx={{ pt: 1 }}>
                                    <Box display="flex" alignItems="center" gap={1} mb={1.5} flexWrap="wrap">
                                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mr: 1 }}>ГОСТІ:</Typography>
                                        {/* camelCase: adultsCount, childrenCount, teensCount */}
                                        <Chip label={`Дорослі: ${selectedBooking.adultsCount}`} size="small" sx={{ height: 24, fontSize: '0.75rem', fontWeight: 600, bgcolor: '#f1f5f9', color: '#475569', borderRadius: 1 }} />
                                        {selectedBooking.childrenCount > 0 && <Chip label={`Діти: ${selectedBooking.childrenCount}`} size="small" sx={{ height: 24, fontSize: '0.75rem', fontWeight: 600, bgcolor: '#fff7ed', color: '#c2410c', borderRadius: 1 }} />}
                                        {(selectedBooking.teensCount || 0) > 0 && <Chip label={`Підлітки: ${selectedBooking.teensCount}`} size="small" sx={{ height: 24, fontSize: '0.75rem', fontWeight: 600, bgcolor: '#eff6ff', color: '#1d4ed8', borderRadius: 1 }} />}
                                    </Box>
                                    <Divider sx={{ mb: 2 }} />
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-end">
                                        <Box>
                                            <Typography variant="caption" display="block" color="text.secondary" fontWeight={600} mb={0.5}>ЗАГАЛЬНА КІЛЬКІСТЬ</Typography>
                                            <Typography variant="body2" fontWeight={700} color="#334155">{selectedBooking.adultsCount + selectedBooking.childrenCount + (selectedBooking.teensCount || 0)} осіб</Typography>
                                        </Box>
                                        <Box textAlign="right">
                                            <Typography variant="caption" display="block" color="text.secondary" fontWeight={600} mb={0.5}>ДО СПЛАТИ</Typography>
                                            {/* camelCase: totalPrice */}
                                            <Typography variant="h5" fontWeight={800} color="#0f172a" lineHeight={1}>{selectedBooking.totalPrice.toLocaleString()} <Typography component="span" variant="caption" fontWeight={700} color="text.secondary">грн</Typography></Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
                            <Button onClick={handleCloseDetails} color="inherit" sx={{ fontWeight: 600, borderRadius: 2, color: '#64748b' }}>Закрити</Button>
                            {selectedBooking.status === 'PENDING_APPROVAL' && (<Button variant="contained" disableElevation onClick={() => handleRequestAction('APPROVE_BOOKING', selectedBooking)} sx={{ fontWeight: 700, borderRadius: 2 }}>Підтвердити заявку</Button>)}
                            {selectedBooking.status === 'REFUND_REQUESTED' && (<Button variant="contained" color="warning" disableElevation onClick={() => handleRequestAction('APPROVE_REFUND', selectedBooking)} sx={{ fontWeight: 700, borderRadius: 2 }}>Повернути кошти</Button>)}
                        </DialogActions>
                    </>
                )}
            </Dialog>

        </Box>
    );
};

export default AdminBookings;