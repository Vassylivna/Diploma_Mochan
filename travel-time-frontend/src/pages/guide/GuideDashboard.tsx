import React, { useState, useEffect, useCallback } from 'react';
import { 
    Box, Container, Typography, Card, CardContent, 
    Chip, LinearProgress, Button, Stack, Tabs, Tab, 
    CircularProgress, Alert, IconButton, Paper, Pagination,
    Tooltip 
} from '@mui/material';
import { 
    LocationOn as LocationIcon, 
    EventNote as EventIcon,
    History as HistoryIcon,
    ArrowForward as ArrowIcon,
    NotificationImportant as AlertIcon,
    Schedule as FutureIcon,
    CalendarMonth as CalendarIcon,
    ChevronLeft, ChevronRight
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import Header from '../../components/layout/Header'; 
import { TourService } from '../../services/TourService';
import { TourCard as TourCardType } from '../../types/tour.types';

const UI_STYLE = {
    bg: '#F3F6F9',
    primary: '#2563EB',
    textMain: '#1E293B',
    textSub: '#64748B',
    cardShadow: '0 4px 20px rgba(0,0,0,0.05)',
    activeCardBorder: '2px solid #2563EB',
    activeCardShadow: '0 10px 30px rgba(37, 99, 235, 0.15)'
};

const ITEMS_PER_PAGE = 5;

// --- КАЛЕНДАР ---
const GuideCalendar = () => {
    const navigate = useNavigate(); 
    const [currentDate, setCurrentDate] = useState(new Date());
    const [tours, setTours] = useState<TourCardType[]>([]); 
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCalendarData = async () => {
            setLoading(true);
            try {
                const response = await TourService.getAll(
                    { showActive: true, showArchived: true }, 
                    1, 
                    100
                ); 
                
                setTours(response.content);
            } catch (e) {
                console.error("Calendar data fetch error", e);
            } finally {
                setLoading(false);
            }
        };
        fetchCalendarData();
    }, []);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); 
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalSlots = Math.ceil((daysInMonth + startOffset) / 7) * 7;
    
    const days = Array.from({ length: totalSlots }, (_, i) => {
        const dayNum = i - startOffset + 1;
        if (dayNum < 1 || dayNum > daysInMonth) return null;
        return dayNum;
    });

    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    
    const getToursForDay = (day: number) => {
        const checkDate = new Date(year, month, day);
        checkDate.setHours(12,0,0,0); 
        return tours.filter(t => {
            const s = new Date(t.startDate); s.setHours(0,0,0,0);
            const e = new Date(t.endDate); e.setHours(23,59,59,999);
            return checkDate >= s && checkDate <= e;
        });
    };

    if (loading) return <Box sx={{ p: 5, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;

    return (
        <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight={700} textTransform="capitalize">
                    {currentDate.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' })}
                </Typography>
                <Box>
                    <IconButton onClick={prevMonth}><ChevronLeft /></IconButton>
                    <IconButton onClick={nextMonth}><ChevronRight /></IconButton>
                </Box>
            </Stack>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 1, textAlign: 'center' }}>
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].map(d => (
                    <Typography key={d} fontWeight={600} color="text.secondary">{d}</Typography>
                ))}
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
                {days.map((day, idx) => {
                    if (!day) return <Box key={idx} sx={{ height: 100, bgcolor: '#FAFAFA', borderRadius: 2 }} />;
                    const dayTours = getToursForDay(day);
                    const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                    return (
                        <Box key={idx} sx={{ 
                            height: 100, border: '1px solid #E2E8F0', borderRadius: 2, p: 1,
                            position: 'relative', bgcolor: isToday ? '#EFF6FF' : 'white', overflow: 'hidden'
                        }}>
                            <Typography variant="body2" fontWeight={isToday ? 800 : 500} color={isToday ? 'primary' : 'text.primary'}>
                                {day}
                            </Typography>
                            <Stack spacing={0.5} mt={0.5}>
                                {dayTours.map(t => (
                                    <Tooltip key={t.tourId} title={t.title} arrow placement="top">
                                        <Box 
                                            onClick={() => navigate(`/guide/tour/${t.tourId}`)} 
                                            sx={{ 
                                                bgcolor: '#DBEAFE', color: '#1E40AF', fontSize: '0.65rem', p: 0.5, borderRadius: 1,
                                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600, cursor: 'pointer'
                                            }}
                                        >
                                            {t.title}
                                        </Box>
                                    </Tooltip>
                                ))}
                            </Stack>
                        </Box>
                    );
                })}
            </Box>
        </Paper>
    );
};

const GuideDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0); 
    const [error, setError] = useState<string | null>(null);

    const [listTours, setListTours] = useState<TourCardType[]>([]);
    const [activeTour, setActiveTour] = useState<TourCardType | null>(null);
    
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [listLoading, setListLoading] = useState(false);

    useEffect(() => {
        const fetchActive = async () => {
            try {
                const activeTour = await TourService.getActiveForGuide();
                setActiveTour(activeTour);
            } catch (e) {
                console.error("Failed to load active tour", e);
            }
        };
        fetchActive();
    }, []);

    const fetchListData = useCallback(async () => {
        if (tabValue === 3) return;

        setListLoading(true);
        try {
            let criteria: any = {};
            
            if (tabValue === 0) {
                criteria = { isComingSoon: true }; 
            } 
            else if (tabValue === 1) {
                criteria = { isArchived: false, isComingSoon: false };
            } 
            else if (tabValue === 2) {
                criteria = { isArchived: true };
            }
            
            const response = await TourService.getAll(criteria, page, ITEMS_PER_PAGE);

            setListTours(response.content);
            setTotalPages(response.totalPages);
        } catch (err: any) {
            console.error(err);
            setError("Не вдалося завантажити список турів");
        } finally {
            setListLoading(false);
        }
    }, [tabValue, page]);

    useEffect(() => {
        fetchListData();
    }, [fetchListData]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        setPage(1); 
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        window.scrollTo({ top: 400, behavior: 'smooth' });
    };

    const formatDateRange = (startStr: string, endStr: string) => {
        const s = new Date(startStr);
        const e = new Date(endStr);
        const startFmt = s.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' });
        const endFmt = e.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' });
        return `${startFmt} — ${endFmt}`;
    };

    const TourCard = ({ tour }: { tour: TourCardType }) => {
        const now = new Date();
        const start = new Date(tour.startDate);
        const isDetailsAvailable = (start.getTime() - now.getTime()) < (24 * 60 * 60 * 1000) || now >= start;
        
        const available = tour.availableSeats ?? 0;
        const booked = tour.totalSeats - available;

        return (
            <Card sx={{ 
                mb: 3, borderRadius: 4, boxShadow: UI_STYLE.cardShadow,
                transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' }
            }}>
                <CardContent sx={{ p: 3 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                        <Box sx={{ flex: 2, width: '100%' }}>
                            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                <Chip label={isDetailsAvailable ? "Відкрито" : "Заплановано"} variant="outlined" size="small" />
                                <Typography variant="caption" sx={{ color: UI_STYLE.textSub, display: 'flex', alignItems: 'center', ml: 1, fontWeight: 600 }}>
                                    <EventIcon sx={{ fontSize: 16, mr: 0.5 }} /> {formatDateRange(tour.startDate, tour.endDate)}
                                </Typography>
                            </Stack>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: UI_STYLE.textMain, mb: 1 }}>
                                {tour.title}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', color: UI_STYLE.textSub }}>
                                <LocationIcon sx={{ fontSize: 20, color: UI_STYLE.primary, mr: 0.5 }} />
                                <Typography fontWeight={500}>{tour.tourCountries?.join(', ') || 'Локація'}</Typography>
                            </Box>
                        </Box>
                        <Box sx={{ flex: 1, width: '100%', minWidth: { md: 300 } }}>
                            <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: 3, border: '1px solid #E2E8F0' }}>
                                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                                    <Typography variant="body2" fontWeight={600} color="text.secondary">Заповненість:</Typography>
                                    <Typography variant="body2" fontWeight={800} color="primary">{booked} / {tour.totalSeats}</Typography>
                                </Stack>
                                <LinearProgress variant="determinate" value={tour.totalSeats > 0 ? (booked / tour.totalSeats) * 100 : 0} sx={{ height: 8, borderRadius: 4, mb: 2 }} />
                                
                                {isDetailsAvailable ? (
                                    <Button 
                                        fullWidth 
                                        variant="contained" 
                                        endIcon={<ArrowIcon />} 
                                        onClick={() => navigate(`/guide/tour/${tour.tourId}`)} 
                                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                                    >
                                        Деталі та список
                                    </Button>
                                ) : (
                                    <Button 
                                        fullWidth 
                                        disabled
                                        variant="outlined" 
                                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                                    >
                                        Деталі будуть за 24 год до початку
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
        );
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: UI_STYLE.bg }}>
            <Header onSearch={() => {}} userRole="guide" />
            
            <Container maxWidth="lg" sx={{ pt: 12, pb: 5 }}>
                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                {activeTour && (
                    <Box sx={{ mb: 6 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: UI_STYLE.textSub, mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
                            Тур який зараз триває
                        </Typography>
                        <Card sx={{ 
                            borderRadius: 4, 
                            border: UI_STYLE.activeCardBorder, 
                            boxShadow: UI_STYLE.activeCardShadow,
                            position: 'relative', overflow: 'visible'
                        }}>
                            <Box sx={{ position: 'absolute', top: -12, right: 24 }}>
                                <Chip label="Активний" color="error" sx={{ fontWeight: 800, boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)' }} />
                            </Box>
                            <CardContent sx={{ p: 4 }}>
                                <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
                                    <Box sx={{ width: '100%' }}>
                                        <Typography variant="h3" sx={{ fontWeight: 900, color: UI_STYLE.textMain, mb: 1 }}>
                                            {activeTour.title}
                                        </Typography>
                                        <Typography sx={{ color: UI_STYLE.textSub, mb: 3, fontSize: '1.1rem' }}>
                                            {activeTour.tourCountries?.join(', ')} • Група {(activeTour.totalSeats || 0) - (activeTour.availableSeats || 0)} осіб
                                        </Typography>
                                        <Button 
                                            variant="contained" size="large" 
                                            onClick={() => navigate(`/guide/tour/${activeTour.tourId}`)}
                                            sx={{ borderRadius: 3, px: 4, py: 1.5, fontWeight: 700, fontSize: '1rem' }}
                                        >
                                            Керувати поїздкою
                                        </Button>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Box>
                )}

                {/* 2. ТАБИ */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                    <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                        <Tab 
                            label="Виїзд скоро(24 год.)"
                            icon={<AlertIcon />} iconPosition="start" 
                            sx={{ fontWeight: 700, textTransform: 'none', minHeight: 60 }} 
                        />
                        <Tab label="Майбутні поїздки" icon={<FutureIcon />} iconPosition="start" sx={{ fontWeight: 700, textTransform: 'none', minHeight: 60 }} />
                        <Tab label="Архів" icon={<HistoryIcon />} iconPosition="start" sx={{ fontWeight: 700, textTransform: 'none', minHeight: 60 }} />
                        <Tab label="Календар" icon={<CalendarIcon />} iconPosition="start" sx={{ fontWeight: 700, textTransform: 'none', minHeight: 60 }} />
                    </Tabs>
                </Box>

                {tabValue === 3 ? (
                    <GuideCalendar />
                ) : (
                    <Box>
                        {listLoading ? (
                            <Box sx={{ py: 5, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
                        ) : listTours.length > 0 ? (
                            <>
                                {listTours.map(t => <TourCard key={t.tourId} tour={t} />)}
                                
                                {totalPages > 1 && (
                                    <Box display="flex" justifyContent="center" mt={4}>
                                        <Pagination 
                                            count={totalPages} 
                                            page={page} 
                                            onChange={handlePageChange} 
                                            color="primary" 
                                            size="large"
                                        />
                                    </Box>
                                )}
                            </>
                        ) : (
                            <Typography textAlign="center" color="text.secondary" py={5}>Список порожній.</Typography>
                        )}
                    </Box>
                )}

            </Container>
        </Box>
    );
};

export default GuideDashboard;