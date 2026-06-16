import React, { useState, useEffect } from 'react';
import { 
    Box, Container, Typography, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Chip, IconButton, Button, 
    Stack, Card, Alert, CircularProgress, Divider, TablePagination
} from '@mui/material';
import { 
    ArrowBack as ArrowBackIcon, Phone as PhoneIcon, 
    Hotel as HotelIcon, 
    Place as PlaceIcon,
    AccessTime as TimeIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/layout/Header';

import { TourService } from '../../services/TourService';
import { GuideTourView, GuidePassenger } from '../../types/tour.types'; // [FIX] Імпортуємо нові типи

const UI_STYLE = {
    bg: '#F8FAFC',
    primary: '#2563EB',
    textMain: '#0F172A',
};

interface PassengerRow {
    id: number;
    name: string;
    phone: string;
    seats: number;
    status: string;
}

const GuideTourDetailsPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [tourData, setTourData] = useState<GuideTourView | null>(null);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        const loadDetails = async () => {
            if (!id) return;
            try {
                setLoading(true);
                
                const data = await TourService.getGuideView(Number(id));
                
                const now = new Date();
                const startDate = new Date(data.startDate);
                
                const hoursDiff = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);
                
                const isActiveOrPast = now >= startDate; 
                const isComingSoon = hoursDiff <= 24;

                if (!isActiveOrPast && !isComingSoon) {
                    setError("Деталі туру стануть доступні за 24 години до виїзду.");
                    setLoading(false);
                    return; 
                }

                setTourData(data);

            } catch (err: any) {
                console.error(err);
                setError(err.message || "Помилка завантаження даних");
            } finally {
                setLoading(false);
            }
        };
        loadDetails();
    }, [id]);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const formatFullDate = (dateStr: string) => {
        const date = new Date(dateStr);
        if (date.getHours() === 0) date.setHours(8, 0); 
        return date.toLocaleDateString('uk-UA', { 
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit' 
        });
    };

    const getStatusChip = (status: string) => {
        if (status === 'PAID') return <Chip label="Оплачено" color="success" size="small" sx={{fontWeight: 700}} />;
        return <Chip label={status} color="default" size="small" />;
    };

    if (loading) return <Box sx={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}><CircularProgress /></Box>;
    
    if (error || !tourData) return (
        <Box sx={{ minHeight: '100vh', bgcolor: UI_STYLE.bg }}>
            <Header onSearch={() => {}} userRole="guide" />
            <Container sx={{ pt: 15 }}>
                <Alert severity="warning" sx={{ mb: 2, fontSize: '1.1rem', alignItems: 'center' }} icon={<TimeIcon fontSize="inherit" />}>
                    {error || "Тур не знайдено"}
                </Alert>
                <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={() => navigate('/guide/dashboard')}>
                    Повернутися в меню
                </Button>
            </Container>
        </Box>
    );

    const cities = [tourData.startCity].filter(Boolean); 
    
    const hotelsList = tourData.hotels || [];
    
    const allPassengers = tourData.passengers || [];
    
    const passengerRows: PassengerRow[] = allPassengers.map(p => ({
        id: p.bookingId,
        name: `${p.lastName} ${p.firstName} ${p.middleName || ''}`.trim(),
        phone: p.phoneNumber,
        seats: p.totalSeats,
        status: p.status
    }));

    const paginatedPassengers = passengerRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: UI_STYLE.bg }}>
            <Header onSearch={() => {}} userRole="guide" />

            <Container maxWidth="xl" sx={{ pt: 12, pb: 5 }}>
                
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                    <IconButton onClick={() => navigate('/guide/dashboard')} sx={{ bgcolor: 'white', boxShadow: 1 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Box>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: UI_STYLE.textMain }}>
                                {tourData.title}
                            </Typography>
                        </Stack>
                        <Typography variant="body1" color="text.secondary" mt={0.5}>
                            ID Туру: #{tourData.tourId}
                        </Typography>
                    </Box>
                </Stack>

                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} sx={{ mb: 4 }} alignItems="stretch">
                    
                    <Box sx={{ flex: 1 }}>
                        <Card sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%' }}>
                            <Stack direction="row" alignItems="center" gap={1} mb={3}>
                                <Typography variant="h6" fontWeight={700}>Логістика та Маршрут</Typography>
                            </Stack>
                            
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                                <Box sx={{ flex: '1 1 300px', p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                                    <Chip label="Початок" size="small" color="primary" sx={{ mb: 1, fontWeight: 700 }} />
                                    <Stack direction="row" gap={1} alignItems="center" mb={1}>
                                        <TimeIcon fontSize="small" color="action" />
                                        <Typography fontWeight={600} variant="body1">{formatFullDate(tourData.startDate)}</Typography>
                                    </Stack>
                                    <Divider sx={{ my: 1 }} />
                                    <Stack direction="row" gap={1}>
                                        <PlaceIcon fontSize="small" color="error" />
                                        <Box>
                                            <Typography variant="body2" fontWeight={700}>
                                                {tourData.startCountry}, {tourData.startCity}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {tourData.startAddress}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Box>

                                <Box sx={{ flex: '1 1 300px', p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                                    <Chip label="Завершення" size="small" color="default" sx={{ mb: 1, fontWeight: 700 }} />
                                    <Stack direction="row" gap={1} alignItems="center" mb={1}>
                                        <TimeIcon fontSize="small" color="action" />
                                        <Typography fontWeight={600} variant="body1">{formatFullDate(tourData.endDate)}</Typography>
                                    </Stack>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="body2" color="text.secondary">
                                        Повернення у {tourData.startCity} (орієнтовно)
                                    </Typography>
                                </Box>

                                <Box sx={{ width: '100%' }}><Divider /></Box>

                                <Box sx={{ flex: '1 1 250px' }}>
                                    <Typography variant="subtitle2" color="text.secondary" fontWeight={700} gutterBottom>
                                         МІСТА ВІДВІДУВАННЯ:
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {cities.map((city, idx) => (
                                            <Chip key={idx} label={city} variant="outlined" sx={{ fontWeight: 500 }} />
                                        ))}
                                    </Box>
                                </Box>

                                <Box sx={{ flex: '1 1 250px' }}>
                                    <Typography variant="subtitle2" color="text.secondary" fontWeight={700} gutterBottom>
                                        <HotelIcon fontSize="inherit" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                                        ПРОЖИВАННЯ:
                                    </Typography>
                                    {hotelsList.length > 0 ? (
                                        <Stack direction="row" flexWrap="wrap" gap={2}>
                                            {hotelsList.map((h, idx) => (
                                                <Box key={idx} sx={{ bgcolor: '#FFF7ED', color: '#9A3412', px: 1.5, py: 0.5, borderRadius: 1, fontSize: '0.875rem', fontWeight: 600, border: '1px solid #FFEDD5' }}>
                                                    {h.name} ({h.stars}★)
                                                </Box>
                                            ))}
                                        </Stack>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">Без ночівлі в готелях</Typography>
                                    )}
                                </Box>
                            </Box>
                        </Card>
                    </Box>

                    <Box sx={{ width: { xs: '100%', lg: 380 } }}>
                        <Card sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Typography variant="h6" fontWeight={700} mb={3}>Статистика Групи</Typography>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="body2" color="text.secondary" mb={0.5}>Зайняті місця (Оплачено)</Typography>
                                <Typography variant="h3" fontWeight={800} color="primary">
                                    {tourData.bookedSeats} <span style={{ fontSize: '1.25rem', color: '#94A3B8' }}>/ {tourData.totalSeats}</span>
                                </Typography>
                                <Box sx={{ width: '100%', bgcolor: '#E2E8F0', borderRadius: 4, height: 8, mt: 1, overflow: 'hidden' }}>
                                    <Box sx={{ 
                                        width: `${tourData.totalSeats > 0 ? (tourData.bookedSeats / tourData.totalSeats) * 100 : 0}%`, 
                                        bgcolor: UI_STYLE.primary, 
                                        height: '100%' 
                                    }} />
                                </Box>
                            </Box>
                            <Box>
                                <Typography variant="body2" color="#636665ff" fontWeight={600}>Кількість оплачених заявок: {allPassengers.length}</Typography>
                            </Box>
                        </Card>
                    </Box>
                </Stack>

                <Paper sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <Box sx={{ p: 3, bgcolor: 'white', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" fontWeight={800}>Список Пасажирів</Typography>
                        <Chip label={`Всього: ${allPassengers.length}`} color="success" size="small" />
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700 }}>ПІБ</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Контакти</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Місця</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Статус</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedPassengers.map((p) => (
                                    <TableRow key={p.id} hover>
                                        <TableCell>
                                            <Typography fontWeight={600}>{p.name}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" alignItems="center" gap={1}>
                                                <PhoneIcon sx={{ fontSize: 16, color: UI_STYLE.primary }} /> 
                                                <a href={`tel:${p.phone}`} style={{ textDecoration: 'none', color: 'inherit', fontWeight: 500 }}>{p.phone}</a>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={p.seats} size="small" sx={{ bgcolor: '#DBEAFE', color: UI_STYLE.primary, fontWeight: 800, minWidth: 30 }} />
                                        </TableCell>
                                        <TableCell>{getStatusChip(p.status)}</TableCell>
                                    </TableRow>
                                ))}
                                {paginatedPassengers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                            Список пасажирів порожній
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={allPassengers.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Рядків на сторінці:"
                    />
                </Paper>

            </Container>
        </Box>
    );
};

export default GuideTourDetailsPage;