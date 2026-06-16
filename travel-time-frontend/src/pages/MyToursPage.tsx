import React, { useState, useEffect } from "react";
import {
    Box, Typography, Paper, List, ListItem, IconButton, Button, Chip,
    Dialog, DialogContent, TextField, Container,
    Fade, CircularProgress, Pagination, Divider, Stack, InputAdornment,
    Alert, Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Card, CardMedia, Avatar, Link, Snackbar
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LockIcon from '@mui/icons-material/Lock';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import PhoneIcon from '@mui/icons-material/Phone';
import HotelIcon from '@mui/icons-material/Hotel';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupsIcon from '@mui/icons-material/Groups';
import FlightIcon from '@mui/icons-material/Flight';
import TrainIcon from '@mui/icons-material/Train';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';

import { useNavigate } from "react-router-dom";
import { useMyBookings } from "../hooks/useMyBookings";
import { TransportResponse } from "../types/tour.types";

const getTransportIconElement = (transport: TransportResponse | undefined) => {
    const name = transport?.transportName || "";
    const lowerName = name.toLowerCase();
    if (lowerName.includes('літак') || lowerName.includes('авіа')) return <FlightIcon fontSize="small" color="action" />;
    if (lowerName.includes('поїзд') || lowerName.includes('залізн')) return <TrainIcon fontSize="small" color="action" />;
    return <DirectionsBusIcon fontSize="small" color="action" />;
};

const CountdownTimer = ({ deadlineStr, onExpire }: { deadlineStr: string, onExpire: () => void }) => {
    const [timeLeft, setTimeLeft] = useState<string>("");

    useEffect(() => {
        const deadline = new Date(deadlineStr).getTime();
        const calculateTimeLeft = () => {
            const now = Date.now();
            const difference = deadline - now;
            if (difference <= 0) { onExpire(); return; }
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);
            setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        };
        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, [deadlineStr, onExpire]);

    if (!timeLeft) return null;

    return (
        <Chip 
            icon={<HourglassBottomIcon style={{ fontSize: 18 }} />} label={timeLeft} size="small" variant="outlined"
            sx={{ height: 28, fontSize: "0.85rem", fontWeight: 600, borderColor: '#ffa726', color: '#ef6c00', bgcolor: '#fff3e0', ml: 1 }} 
        />
    );
};

const MyTours: React.FC = () => {
    const navigate = useNavigate();

    const {
        paginatedBookings,
        totalPages, loading, page, searchQuery,
        pdfGeneratingId,
        processingPayment, paymentError,
        pdfError, setPdfError,
        openPayment, openSuccess, openDetails, confirmDialog,
        paymentBooking, detailsBooking,
        cardHolder, cardNumber, cardExpiry, cardCvv,
        setPage, setOpenDetails, setOpenSuccess, setConfirmDialog,
        handleSearchChange, handleDownloadTicket, handleOpenDetails, handleOpenPayment,
        handleTryCancelBooking, handleTryRefund, handleTryClosePayment, handleTrySubmitPayment,
        handleConfirmAction, handleTimerExpire,
        onCardNumberChange, onCardExpiryChange, onCardCvvChange,
        canShowRefundButton
    } = useMyBookings();

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'PAID': return { bg: '#e8f5e9', text: '#1b5e20', border: '#c8e6c9', label: 'Оплачено' };
            case 'AWAITING_PAYMENT': return { bg: '#fffde7', text: '#f57f17', border: '#fff9c4', label: 'Очікує оплати' };
            case 'PENDING_APPROVAL': return { bg: '#fff3e0', text: '#e65100', border: '#ffe0b2', label: 'На перевірці' };
            case 'CANCELLED': return { bg: '#ffebee', text: '#c62828', border: '#ffcdd2', label: 'Скасовано' };
            case 'CANCELLED_WITH_PAYMENT': return { bg: '#eeeeee', text: '#616161', border: '#bdbdbd', label: 'Скасовано без повернення' };
            case 'REFUND_REQUESTED': return { bg: '#f3e5f5', text: '#7b1fa2', border: '#e1bee7', label: 'Очікує повернення' };
            case 'REFUNDED': return { bg: '#e0f2f1', text: '#00695c', border: '#b2dfdb', label: 'Повернено' };
            default: return { bg: '#f5f5f5', text: '#616161', border: '#e0e0e0', label: status };
        }
    };

    const dialogData = (() => {
        switch (confirmDialog.type) {
            case 'CANCEL_BOOKING': return { title: "Скасувати бронювання?", text: "Місця будуть звільнені. Цю дію неможливо відмінити.", icon: <WarningAmberRoundedIcon sx={{ fontSize: 50, color: '#d32f2f', bgcolor: '#ffebee', borderRadius: '50%', p: 1 }} />, btnText: "Скасувати тур", btnColor: "error" as const };
            case 'REQUEST_REFUND': return { title: "Повернути кошти?", text: "Вашу заявку на скасування буде надіслано адміністратору. Кошти будуть повернуті на ваш рахунок протягом 3–5 робочих днів", icon: <WarningAmberRoundedIcon sx={{ fontSize: 50, color: '#f57f17', bgcolor: '#fffde7', borderRadius: '50%', p: 1 }} />, btnText: "Надіслати запит", btnColor: "warning" as const };
            case 'CANCEL_WITHOUT_REFUND': return { title: "Скасування без повернення коштів", text: "До початку туру залишилося менше ніж 14 днів. Згідно з політикою компанії, повернення коштів у такому разі неможливе. Після підтвердження тур буде скасовано, а ваше місце звільнено. Ви впевнені, що бажаєте продовжити?", icon: <WarningAmberRoundedIcon sx={{ fontSize: 50, color: '#d32f2f', bgcolor: '#ffebee', borderRadius: '50%', p: 1 }} />, btnText: "Так, скасувати без повернення коштів", btnColor: "error" as const };
            case 'CANCEL_PAYMENT': return { title: "Скасувати оплату?", text: "Дані не будуть збережені.", icon: <WarningAmberRoundedIcon sx={{ fontSize: 50, color: '#f57c00', bgcolor: '#fff3e0', borderRadius: '50%', p: 1 }} />, btnText: "Закрити", btnColor: "inherit" as const };
            case 'SUBMIT_PAYMENT': return { title: "Підтвердити транзакцію?", text: `З вашої картки буде списано ${paymentBooking?.totalPrice.toLocaleString()} грн за тур "${paymentBooking?.tour.title}".`, icon: <ReceiptLongIcon sx={{ fontSize: 50, color: '#0284c7', bgcolor: '#e0f2fe', borderRadius: '50%', p: 1 }} />, btnText: "Підтвердити", btnColor: "primary" as const };
            case 'TIME_EXPIRED': return { title: "Час вийшов", text: "Час на оплату минув. Бронювання було автоматично скасовано.", icon: <AccessTimeIcon sx={{ fontSize: 50, color: '#d32f2f', bgcolor: '#ffebee', borderRadius: '50%', p: 1 }} />, btnText: "Зрозуміло", btnColor: "primary" as const };
            default: return { title: "", text: "", icon: null, btnText: "", btnColor: "primary" as const };
        }
    })();

    const calculatePrices = (total: number, a: number, c: number, t: number) => {
        const factor = a + t + (c * 0.8);
        const base = factor > 0 ? Math.floor(total / factor) : 0;
        return { pricePerAdult: base, pricePerTeen: base, pricePerChild: Math.floor(base * 0.8) };
    };

    return (
        <Box sx={{ background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
            <Container maxWidth="lg">
                <Paper elevation={3} sx={{ p: 3, borderRadius: 3, background: "#fff", minHeight: "60vh", display: "flex", flexDirection: "column" }}>
                    
                    <Box display="flex" flexDirection={{xs: 'column', sm: 'row'}} justifyContent="space-between" alignItems={{xs: 'stretch', sm: 'center'}} gap={2} mb={3} pb={2} borderBottom="1px solid #eeeeee">
                        <Box display="flex" alignItems="center" gap={2}>
                            <IconButton onClick={() => navigate(-1)} size="small"><ArrowBackIcon /></IconButton>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: "#263238" }}>Мої бронювання</Typography>
                        </Box>
                        
                        <TextField
                            size="small" placeholder="Пошук за кодом"
                            value={searchQuery} onChange={handleSearchChange}
                            sx={{ width: {xs: '100%', sm: 300} }}
                            InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon color="action" fontSize="small" /></InputAdornment>) }}
                        />
                    </Box>

                    <Box sx={{ flexGrow: 1 }}>
                        {loading ? (
                            <Box display="flex" justifyContent="center" py={5}><CircularProgress /></Box>
                        ) : paginatedBookings.length === 0 ? (
                            <Box textAlign="center" py={5}>
                                <Typography variant="h6" color="text.secondary">{searchQuery ? "За вашим запитом нічого не знайдено" : "У вас поки немає бронювань"}</Typography>
                            </Box>
                        ) : (
                            <List disablePadding>
                                {paginatedBookings.map((booking) => {
                                    const styles = getStatusStyles(booking.status);
                                    const isThisPdfLoading = pdfGeneratingId === booking.bookingId;

                                    return (
                                        <Fade in key={booking.bookingId} timeout={400}>
                                            <ListItem sx={{ flexDirection: "column", bgcolor: "#fff", borderRadius: 2, mb: 2, p: 0, border: "1px solid #e0e0e0", transition: "all 0.2s ease", "&:hover": { borderColor: "#90caf9", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" } }}>
                                                <Box sx={{ width: '100%', px: 3, py: 1.5, bgcolor: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e0e0' }}>
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#424242' }}>{booking.paymentCode}</Typography>
                                                    </Box>
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        {booking.status === 'AWAITING_PAYMENT' && booking.paymentDeadline && (
                                                            <CountdownTimer deadlineStr={booking.paymentDeadline} onExpire={() => handleTimerExpire(booking.bookingId)} />
                                                        )}
                                                        {booking.status === 'PENDING_APPROVAL' && (
                                                             <Chip icon={<AccessTimeIcon style={{ fontSize: 16 }} />} label="Очікування" size="small" variant="outlined" sx={{ height: 24, fontSize: "0.75rem", borderColor: '#b0bec5', color: '#78909c' }} />
                                                        )}
                                                        <Chip label={styles.label} size="small" sx={{ height: 24, fontSize: "0.75rem", fontWeight: "bold", borderRadius: 1, bgcolor: styles.bg, color: styles.text, border: `1px solid ${styles.border}` }} />
                                                    </Box>
                                                </Box>
                                                <Box sx={{ p: 2.5, width: '100%' }}>
                                                    <Box sx={{ display: 'flex', flexDirection: {xs: 'column', sm: 'row'}, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                                                        <Box sx={{ textAlign: {xs: 'center', sm: 'left'} }}>
                                                            <Typography variant="h6" fontWeight="700" sx={{ color: "#263238", mb: 0.5 }}>{booking.tour.title}</Typography>
                                                            {/* [FIX] Використовуємо вже відформатовані рядки з хука */}
                                                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <CalendarTodayIcon sx={{ fontSize: 16 }} /> {booking.tour.startDate} — {booking.tour.endDate}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                                            <Typography variant="h6" sx={{ fontWeight: 800, color: "#0277bd" }}>{booking.totalPrice.toLocaleString()} грн</Typography>
                                                            <Box display="flex" gap={1}>
                                                                <Tooltip title="Деталі">
                                                                    <IconButton onClick={() => handleOpenDetails(booking)} sx={{ border: '1px solid #e0e0e0', borderRadius: 1.5 }}><VisibilityIcon fontSize="small" /></IconButton>
                                                                </Tooltip>
                                                                {booking.status === "PAID" && (
                                                                    <Tooltip title="Завантажити квиток (PDF)">
                                                                        <IconButton onClick={() => handleDownloadTicket(booking)} disabled={isThisPdfLoading} sx={{ border: '1px solid #e0e0e0', borderRadius: 1.5, color: '#2e7d32' }}>
                                                                            {isThisPdfLoading ? <CircularProgress size={20} /> : <DownloadIcon fontSize="small" />}
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                )}
                                                                {booking.status === "AWAITING_PAYMENT" && (
                                                                    <>
                                                                        <Button variant="contained" onClick={() => handleOpenPayment(booking)} sx={{ borderRadius: 1.5, px: 3, fontWeight: 700 }}>Оплатити</Button>
                                                                        <Tooltip title="Скасувати бронювання"><IconButton onClick={() => handleTryCancelBooking(booking.bookingId)} sx={{ border: '1px solid #ffebee', bgcolor: "#ffebee", color: "#d32f2f", borderRadius: 1.5 }}><CloseIcon fontSize="small" /></IconButton></Tooltip>
                                                                    </>
                                                                )}
                                                                {canShowRefundButton(booking) && (
                                                                    <Tooltip title="Повернути кошти"><Button variant="outlined" color="error" onClick={() => handleTryRefund(booking)} sx={{ borderRadius: 1.5, fontWeight: 600, textTransform: 'none', borderColor: '#d32f2f', color: '#d32f2f' }} >Повернути кошти</Button></Tooltip>
                                                                )}
                                                                {booking.status === "PENDING_APPROVAL" && (
                                                                    <Tooltip title="Скасувати заявку"><IconButton onClick={() => handleTryCancelBooking(booking.bookingId)} sx={{ border: '1px solid #ffebee', bgcolor: "#ffebee", color: "#d32f2f", borderRadius: 1.5 }}><CloseIcon fontSize="small" /></IconButton></Tooltip>
                                                                )}
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </ListItem>
                                        </Fade>
                                    );
                                })}
                            </List>
                        )}
                    </Box>
                    {totalPages > 1 && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}><Pagination count={totalPages} page={page} onChange={(e, v) => setPage(v)} color="primary" shape="rounded" /></Box>}
                </Paper>
            </Container>

            <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
                {detailsBooking && (
                    <>
                        <Box sx={{ px: 3, py: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box display="flex" alignItems="center" gap={1.5}>
                                <Typography variant="h6" fontWeight="800" sx={{ color: '#1e293b' }}>Замовлення #{detailsBooking.paymentCode}</Typography>
                                <Chip label={getStatusStyles(detailsBooking.status).label} size="small" sx={{ fontWeight: 700, bgcolor: getStatusStyles(detailsBooking.status).bg, color: getStatusStyles(detailsBooking.status).text }} />
                            </Box>
                            <IconButton onClick={() => setOpenDetails(false)} size="small"><CloseIcon /></IconButton>
                        </Box>
                        <DialogContent sx={{ p: 0 }}>
                            <Box sx={{ zoom: '96%' }}>
                                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: 400 }}>
                                    
                                    <Box sx={{ width: { xs: '100%', md: '40%' }, bgcolor: '#f1f5f9', p: 3, borderRight: { md: '1px solid #e2e8f0' }, display: 'flex', flexDirection: 'column' }}>
                                        <Card elevation={0} sx={{ borderRadius: 3, mb: 3, overflow: 'hidden', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                                            <CardMedia component="img" height="160" image={detailsBooking.tour.images?.[0]?.imageUrl || "https://via.placeholder.com/400x200?text=No+Image"} alt={detailsBooking.tour.title} />
                                        </Card>
                                        <Typography variant="h6" fontWeight="800" lineHeight={1.2} gutterBottom sx={{ fontSize: '1.1rem' }}>{detailsBooking.tour.title}</Typography>
                                        
                                        <Stack spacing={2} sx={{ mt: 2 }}>
                                            <Box display="flex" gap={1.5}>
                                                <CalendarTodayIcon fontSize="small" color="action" />
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">Дати туру</Typography>
                                                    <Typography variant="body2" fontWeight="600">{detailsBooking.tour.startDate} — {detailsBooking.tour.endDate}</Typography>
                                                </Box>
                                            </Box>
                                            
                                            <Box display="flex" gap={1.5}>
                                                <LocationOnIcon fontSize="small" color="action" />
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">Місце збору</Typography>
                                                    <Typography variant="body2" fontWeight="600">{detailsBooking.tour.startLocation?.countryName}, {detailsBooking.tour.startLocation?.cityName}</Typography>
                                                    <Typography variant="caption" display="block" color="text.secondary" sx={{ lineHeight: 1.1, mt: 0.5 }}>{detailsBooking.tour.startAddress}</Typography>
                                                    
                                                    <Typography variant="caption" display="block" color="primary.main" fontWeight="bold" sx={{ mt: 0.5 }}>
                                                        Збір групи: {(detailsBooking.tour as any).groupTimes?.arrival} | Виїзд: {(detailsBooking.tour as any).groupTimes?.start}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Box display="flex" gap={1.5}>
                                                {getTransportIconElement(detailsBooking.tour.transport)} 
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">Основний транспорт</Typography>
                                                    <Typography variant="body2" fontWeight="600">
                                                        {detailsBooking.tour.transport?.transportName || "Автобус"}
                                                        {detailsBooking.tour.transport?.transportNumber && ` (${detailsBooking.tour.transport.transportNumber})`}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Box display="flex" gap={1.5}>
                                                <HotelIcon fontSize="small" color="action" />
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">Тип готелю</Typography>
                                                    <Typography variant="body2" fontWeight="600" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        {detailsBooking.tour.stops?.[0]?.hotel?.stars ? (
                                                            <Box display="flex">{[...Array(detailsBooking.tour.stops[0].hotel.stars)].map((_, index) => <StarIcon key={index} sx={{ fontSize: 16, color: '#fbc02d' }} />)}</Box>
                                                        ) : "Не вказано"}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Stack>

                                        {detailsBooking.status === 'PAID' && detailsBooking.tour.guide && (
                                            <Paper elevation={0} sx={{ p: 1, bgcolor: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: 2, mt: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{ bgcolor: '#2e7d32', width: 32, height: 32, fontSize: '0.8rem' }}>{detailsBooking.tour.guide.firstName.charAt(0)}</Avatar>
                                                <Box>
                                                    <Typography variant="caption" fontWeight="800" color="success.main" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, lineHeight: 1 }}>Ваш гід</Typography>
                                                    <Typography variant="subtitle2" fontWeight="700" lineHeight={1.2} sx={{ fontSize: '0.85rem' }}>{detailsBooking.tour.guide.firstName} {detailsBooking.tour.guide.lastName}</Typography>
                                                    <Link href={`tel:${detailsBooking.tour.guide.phoneNumber}`} underline="hover" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#1565c0', fontWeight: 500, fontSize: '0.7rem' }}><PhoneIcon sx={{ fontSize: 12 }} /> {detailsBooking.tour.guide.phoneNumber}</Link>
                                                </Box>
                                            </Paper>
                                        )}
                                    </Box>

                                    <Box sx={{ width: { xs: '100%', md: '60%' }, p: 3 }}>
                                        {detailsBooking.status === 'PAID' && (
                                            <Paper elevation={0} sx={{ mb: 4, p: 1.5, borderRadius: 2, border: '1px dashed #4caf50', bgcolor: '#f1f8e9' }}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                                    <Typography variant="subtitle2" fontWeight="800" color="success.main" sx={{ fontSize: '0.8rem' }}>ІНФОРМАЦІЯ ПРО ОПЛАТУ</Typography>
                                                    <CheckCircleIcon color="success" sx={{ fontSize: 18 }} />
                                                </Stack>
                                                <Stack spacing={0.5}>
                                                    <Box display="flex" alignItems="center"><Typography variant="body2" color="text.secondary" sx={{ minWidth: 85, fontSize: '0.85rem' }}>Статус:</Typography><Typography variant="body2" fontWeight="700" color="success.main" sx={{ fontSize: '0.9rem' }}>Успішно</Typography></Box>
                                                    <Box display="flex" alignItems="center"><Typography variant="body2" color="text.secondary" sx={{ minWidth: 85, fontSize: '0.85rem' }}>Картка:</Typography><Typography variant="body2" fontWeight="600" sx={{ fontFamily: 'monospace', fontSize: '0.95rem', letterSpacing: 1 }}>{detailsBooking.cardNumberMasked || "••••"}</Typography></Box>
                                                    <Box display="flex" alignItems="center"><Typography variant="body2" color="text.secondary" sx={{ minWidth: 85, fontSize: '0.85rem' }}>Дата:</Typography><Typography variant="body2" fontWeight="600" sx={{ fontSize: '0.9rem' }}>{detailsBooking.confirmedAt ? new Date(detailsBooking.confirmedAt).toLocaleDateString() : new Date().toLocaleDateString()}</Typography></Box>
                                                </Stack>
                                            </Paper>
                                        )}
                                        <Box mb={2}>
                                            <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>Дані замовника</Typography>
                                            <Stack spacing={2}>
                                                <Box display="flex" alignItems="center" gap={2}><Avatar sx={{ width: 32, height: 32, bgcolor: '#e0f2fe', color: '#0284c7' }}><PersonIcon fontSize="small"/></Avatar><Box><Typography variant="caption" color="text.secondary">ПІБ</Typography><Typography variant="body2" fontWeight="600">{detailsBooking.user.lastName} {detailsBooking.user.firstName} {detailsBooking.user.middleName}</Typography></Box></Box>
                                                <Box display="flex" gap={4}>
                                                    <Box display="flex" alignItems="center" gap={2}><Avatar sx={{ width: 32, height: 32, bgcolor: '#f3e8ff', color: '#7e22ce' }}><PhoneIcon fontSize="small"/></Avatar><Box><Typography variant="caption" color="text.secondary">Телефон</Typography><Typography variant="body2" fontWeight="600">{detailsBooking.user.phoneNumber}</Typography></Box></Box>
                                                    <Box display="flex" alignItems="center" gap={2}><Avatar sx={{ width: 32, height: 32, bgcolor: '#ffedd5', color: '#c2410c' }}><EmailIcon fontSize="small"/></Avatar><Box><Typography variant="caption" color="text.secondary">Email</Typography><Typography variant="body2" fontWeight="600">{detailsBooking.user.email}</Typography></Box></Box>
                                                </Box>
                                            </Stack>
                                        </Box>
                                        <Divider sx={{ my: 2 }} />
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>Деталі замовлення</Typography>
                                            <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
                                                <Table size="small">
                                                    <TableHead sx={{ bgcolor: '#f8fafc' }}><TableRow><TableCell sx={{ fontWeight: 600, color: '#475569' }}>Категорія</TableCell><TableCell align="center" sx={{ fontWeight: 600, color: '#475569' }}><GroupsIcon fontSize="small" /></TableCell><TableCell align="right" sx={{ fontWeight: 600, color: '#475569' }}>Ціна за од.</TableCell><TableCell align="right" sx={{ fontWeight: 600, color: '#475569' }}>Сума</TableCell></TableRow></TableHead>
                                                    <TableBody>
                                                        {(() => {
                                                            const p = calculatePrices(detailsBooking.totalPrice, detailsBooking.adultsCount, detailsBooking.childrenCount, detailsBooking.teensCount);
                                                            return (
                                                                <>
                                                                    <TableRow><TableCell>Дорослі</TableCell><TableCell align="center">{detailsBooking.adultsCount}</TableCell><TableCell align="right">{p.pricePerAdult.toLocaleString()} ₴</TableCell><TableCell align="right">{(p.pricePerAdult * detailsBooking.adultsCount).toLocaleString()} ₴</TableCell></TableRow>
                                                                    {detailsBooking.teensCount > 0 && (<TableRow><TableCell>Підлітки</TableCell><TableCell align="center">{detailsBooking.teensCount}</TableCell><TableCell align="right">{p.pricePerTeen.toLocaleString()} ₴</TableCell><TableCell align="right">{(p.pricePerTeen * detailsBooking.teensCount).toLocaleString()} ₴</TableCell></TableRow>)}
                                                                    {detailsBooking.childrenCount > 0 && (<TableRow><TableCell>Діти <Typography component="span" variant="caption" color="success.main" fontWeight="bold">(-20%)</Typography></TableCell><TableCell align="center">{detailsBooking.childrenCount}</TableCell><TableCell align="right">{p.pricePerChild.toLocaleString()} ₴</TableCell><TableCell align="right">{(p.pricePerChild * detailsBooking.childrenCount).toLocaleString()} ₴</TableCell></TableRow>)}
                                                                </>
                                                            );
                                                        })()}
                                                        <TableRow sx={{ bgcolor: '#f1f5f9' }}><TableCell colSpan={3} sx={{ fontWeight: 700, fontSize: '1rem' }}>ВСЬОГО ДО СПЛАТИ</TableCell><TableCell align="right" sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0277bd' }}>{detailsBooking.totalPrice.toLocaleString()} ₴</TableCell></TableRow>
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </DialogContent>
                    </>
                )}
            </Dialog>

            <Dialog open={openPayment} onClose={handleTryClosePayment} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
                <Box sx={{ bgcolor: "#f8fafc", p: 2, borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Stack direction="row" alignItems="center" spacing={1}><LockIcon sx={{ fontSize: 18, color: '#10b981' }} /><Typography variant="subtitle1" fontWeight="700">Оплата</Typography></Stack>
                    <IconButton onClick={handleTryClosePayment} size="small"><CloseIcon fontSize="small"/></IconButton>
                </Box>
                <DialogContent sx={{ p: 3 }}>
                    <Box sx={{ width: '100%', height: 140, borderRadius: 3, mb: 3, p: 2, background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Box sx={{ width: 40, height: 26, bgcolor: '#fbbf24', borderRadius: 0.5, opacity: 0.9 }} /><Typography variant="body2" fontWeight="800" sx={{ opacity: 0.8 }}>{cardNumber.startsWith('4') ? 'VISA' : 'MASTERCARD'}</Typography></Box>
                        <Typography variant="h6" sx={{ letterSpacing: 4, textAlign: 'center', fontFamily: 'monospace' }}>{cardNumber || "•••• •••• •••• ••••"}</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.7 }}>{cardHolder || "NAME SURNAME"}</Typography><Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.7 }}>{cardExpiry || "MM/YY"}</Typography></Box>
                    </Box>
                    <Stack spacing={2}>
                        <TextField fullWidth size="small" label="Номер картки" value={cardNumber} onChange={onCardNumberChange} InputProps={{ startAdornment: <InputAdornment position="start"><CreditCardIcon fontSize="small"/></InputAdornment> }} />
                        <Stack direction="row" spacing={2}><TextField fullWidth size="small" label="ММ/РР" value={cardExpiry} onChange={onCardExpiryChange} /><TextField fullWidth size="small" label="CVV2" type="password" value={cardCvv} onChange={onCardCvvChange} /></Stack>
                        <TextField fullWidth size="small" label="Власник картки" value={cardHolder} InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start"><PersonIcon fontSize="small"/></InputAdornment> }} />
                    </Stack>
                    {paymentError && <Alert severity="error" sx={{ mt: 2, py: 0 }}>{paymentError}</Alert>}
                </DialogContent>
                <Box sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}><Typography variant="body2" color="text.secondary" fontWeight="600">До сплати:</Typography><Typography variant="h5" sx={{ fontWeight: 800 }}>{paymentBooking?.totalPrice.toLocaleString()} ₴</Typography></Box>
                    <Button variant="contained" fullWidth onClick={handleTrySubmitPayment} disabled={processingPayment} sx={{ py: 1.5, bgcolor: '#0f172a' }}>{processingPayment ? <CircularProgress size={24} color="inherit" /> : "Сплатити зараз"}</Button>
                </Box>
            </Dialog>

            <Dialog open={confirmDialog.open} onClose={() => !processingPayment && setConfirmDialog({ open: false, type: null })}>
                <DialogContent sx={{ textAlign: 'center', p: 4 }}>
                    <Box mb={2}>{dialogData.icon}</Box><Typography variant="h6" fontWeight="800" gutterBottom>{dialogData.title}</Typography><Typography color="text.secondary" mb={3}>{dialogData.text}</Typography>
                    <Stack direction="row" spacing={2} justifyContent="center"><Button onClick={() => setConfirmDialog({ open: false, type: null })} color="inherit">Назад</Button><Button variant="contained" color={dialogData.btnColor} onClick={handleConfirmAction}>{dialogData.btnText}</Button></Stack>
                </DialogContent>
            </Dialog>

            <Dialog open={openSuccess} onClose={() => setOpenSuccess(false)} PaperProps={{ sx: { borderRadius: 5, p: 2, maxWidth: 400 } }}>
                <DialogContent sx={{ textAlign: "center", py: 4 }}>
                    <Box sx={{ width: 100, height: 100, bgcolor: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', mb: 3 }}><CheckCircleOutlineIcon sx={{ fontSize: 70, color: "#16a34a" }} /></Box>
                    <Typography variant="h4" fontWeight="900" gutterBottom>Оплачено!</Typography>
                    <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 3, my: 3, textAlign: 'left', border: '1px dashed #cbd5e1' }}><Stack spacing={1}><Box display="flex" justifyContent="space-between"><Typography variant="caption">Тур:</Typography><Typography variant="caption" fontWeight="700">{paymentBooking?.tour.title}</Typography></Box><Box display="flex" justifyContent="space-between"><Typography variant="caption">Сума:</Typography><Typography variant="caption" fontWeight="700">{paymentBooking?.totalPrice.toLocaleString()} ₴</Typography></Box></Stack></Box>
                    <Button variant="contained" fullWidth onClick={() => setOpenSuccess(false)} sx={{ py: 1.8, bgcolor: '#0f172a' }}>Чудово, дякую!</Button>
                </DialogContent>
            </Dialog>
            
            <Snackbar open={!!pdfError} autoHideDuration={6000} onClose={() => setPdfError(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity="error" onClose={() => setPdfError(null)} sx={{ width: '100%' }}>{pdfError}</Alert>
            </Snackbar>
        </Box>
    );
};

export default MyTours;