import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Container, Typography, Box, Button, Chip, Divider, Paper, Stack, Skeleton,
    IconButton, Dialog, useTheme, useMediaQuery, Collapse
} from '@mui/material';
import { 
    CalendarMonth, Hotel, DirectionsBus, 
    Star, Map as MapIcon, ArrowBack, Place, Flight, Train,
    ArrowBackIosNew, ArrowForwardIos, Close, 
    InfoOutlined, ConfirmationNumber, PhotoCamera,
    CheckCircleOutline, HighlightOff, AccessTime,
    EmojiPeople, SupportAgent, VerifiedUser, KeyboardArrowDown,
    Block as BlockIcon 
} from '@mui/icons-material';

import LockIcon from '@mui/icons-material/Lock';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Alert } from '@mui/material';

import { TourService } from '../services/TourService';
import { UserService } from '../services/UserService';
import { BookingService } from '../services/BookingService';
import { TourDetails } from '../types/tour.types';
import { Hotel as HotelType } from '../types/hotel.types'; 
import { User } from '../types/user.types';
import FormPage from './FormPage';

interface HotelDisplayData {
    hotel: HotelType;
    country: string;
}

const TourDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const [tour, setTour] = useState<TourDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [openBooking, setOpenBooking] = useState(false);
    
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const [heroIndex, setHeroIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxImages, setLightboxImages] = useState<string[]>([]);
    const [photoIndex, setPhotoIndex] = useState(0);
    const [showAllHotels, setShowAllHotels] = useState(false);

    const fetchTourData = async () => {
        if (id) {
            try {
                const data = await TourService.getById(Number(id));
                setTour(data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch tour", error);
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await UserService.getProfile();
                setCurrentUser(user);
            } catch (error) {
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        fetchTourData();
    }, [id]);

    const tourImageUrls = useMemo(() => {
        return tour?.images?.map(img => img.imageUrl) || [];
    }, [tour]);

    const getHighQualityUrl = (url: string) => {
        if (!url) return '';
        if (url.includes('images.unsplash.com')) {
            let newUrl = url.replace(/&w=\d+/, '&w=1920').replace(/\?w=\d+/, '?w=1920');
            if (!newUrl.includes('w=')) newUrl += (newUrl.includes('?') ? '&' : '?') + 'w=1920';
            
            newUrl = newUrl.replace(/&q=\d+/, '&q=90').replace(/\?q=\d+/, '?q=90');
            if (!newUrl.includes('q=')) newUrl += '&q=90';
            
            return newUrl;
        }
        return url;
    };

    const handleHeroNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (tourImageUrls.length > 0) setHeroIndex((prev) => (prev + 1) % tourImageUrls.length);
    };

    const handleHeroPrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (tourImageUrls.length > 0) setHeroIndex((prev) => (prev === 0 ? tourImageUrls.length - 1 : prev - 1));
    };

    const openGallery = (images: string[], index: number = 0) => {
        setLightboxImages(images);
        setPhotoIndex(index);
        setLightboxOpen(true);
    };

    const handleLightboxNext = () => setPhotoIndex((prev) => (prev + 1) % lightboxImages.length);
    const handleLightboxPrev = () => setPhotoIndex((prev) => (prev === 0 ? lightboxImages.length - 1 : prev - 1));

    const getTransportIcon = (name: string) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('літак') || lowerName.includes('авіа')) return <Flight sx={{ fontSize: 24, color: '#03a9f4' }} />;
        if (lowerName.includes('поїзд') || lowerName.includes('залізн')) return <Train sx={{ fontSize: 24, color: '#ff9800' }} />;
        return <DirectionsBus sx={{ fontSize: 24, color: '#4caf50' }} />;
    };

    const getDateTimeParts = (dateString: string, offsetMinutes: number = 0) => {
        const date = new Date(dateString);
        date.setMinutes(date.getMinutes() + offsetMinutes);

        const dateStr = date.toLocaleDateString('uk-UA');
        const timeStr = date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
        
        const hour = date.getHours();
        let suffix = 'ночі'; 
        if (hour >= 4 && hour < 12) suffix = 'ранку';
        else if (hour >= 12 && hour < 17) suffix = 'дня';
        else if (hour >= 17) suffix = 'вечора';

        return { date: dateStr, time: timeStr, suffix };
    };

    const uniqueHotels: HotelDisplayData[] = useMemo(() => {
        if (!tour?.stops) return [];
        const map = new Map<number, HotelDisplayData>();
        
        tour.stops.forEach(stop => {
            if (stop.hotel && stop.hotel.hotelId && !map.has(stop.hotel.hotelId)) {
                map.set(stop.hotel.hotelId, {
                    hotel: stop.hotel,
                    country: stop.location?.countryName || 'Країна'
                });
            }
        });
        return Array.from(map.values());
    }, [tour]);

    const visitCities = useMemo(() => {
        if (!tour?.stops) return [];
        const citiesSet = new Set<string>();
        
        if (tour.startLocation?.cityName) {
            citiesSet.add(tour.startLocation.cityName);
        }
        
        tour.stops.forEach(stop => {
            if (stop.location?.cityName) {
                citiesSet.add(stop.location.cityName);
            }
        });
        
        return Array.from(citiesSet);
    }, [tour]);

    const includedList = useMemo(() => tour?.inclusions.filter(i => i.isIncluded).map(i => i.itemDescription) || [], [tour]);
    const excludedList = useMemo(() => tour?.inclusions.filter(i => !i.isIncluded).map(i => i.itemDescription) || [], [tour]);

    const role = currentUser?.role || localStorage.getItem('app_user_role');
    const isAdmin = role === 'ADMIN'; 
    const isGuide = role === 'GUIDE';
    
    const userAge = useMemo(() => {
        return currentUser?.birthDate ? BookingService.calculateAge(currentUser.birthDate) : null;
    }, [currentUser]);
    
    if (loading) return <Container sx={{ mt: 10 }}><Skeleton variant="rectangular" height={500} sx={{ borderRadius: 4 }} /></Container>;
    if (!tour) return <Container sx={{ mt: 10 }}><Typography>Тур не знайдено</Typography></Container>;
  
    const isSoldOut = tour.availableSeats === 0;
    const isHidden = false;
    const isUserAdult = userAge !== null ? userAge >= 18 : true; 
    const canBook = !isSoldOut;
    
    const nowTime = new Date().getTime();
    const startTime = new Date(tour.startDate).getTime();
    const isSalesClosed = (startTime - nowTime) <= (26 * 60 * 60 * 1000);

    const currentHeroImage = tourImageUrls.length > 0 ? tourImageUrls[heroIndex] : "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200";

    const startInfo = getDateTimeParts(tour.startDate);
    const endInfo = getDateTimeParts(tour.endDate);
    const meetingInfo = getDateTimeParts(tour.startDate, -30); 

    const StatusAlerts = ({ isDark = false }: { isDark?: boolean }) => (
        <Stack spacing={2} sx={{ mb: 3, width: '100%' }}>
            {isSoldOut && (
                <Alert severity="warning" variant={isDark ? "filled" : "outlined"} icon={<HourglassEmptyIcon fontSize="large" />} sx={{ py: 1, px: 2, borderRadius: 2, alignItems: 'center', textAlign: 'left', '& .MuiAlert-message': { py: 0.5, fontWeight: 600, fontSize: '1rem', lineHeight: 1.4 } }}>
                    На даний момент місць немає, але можливо через деякий час вони з'являться.
                </Alert>
            )}
            {!isSoldOut && isSalesClosed && (
                 <Alert severity="info" variant={isDark ? "filled" : "outlined"} icon={<AccessTime fontSize="large" />} sx={{ py: 1, px: 2, borderRadius: 2, alignItems: 'center', textAlign: 'left', '& .MuiAlert-message': { py: 0.5, fontWeight: 600, fontSize: '1rem', lineHeight: 1.4 } }}>
                    Продаж квитків на цей тур завершено, оскільки до виїзду залишилося менше 26 годин.
                </Alert>
            )}
            {!isSoldOut && !isSalesClosed && !isUserAdult && userAge !== null && (
                <Alert severity="error" variant={isDark ? "filled" : "outlined"} icon={<ErrorOutlineIcon fontSize="large" />} sx={{ py: 1, px: 2, borderRadius: 2, alignItems: 'center', textAlign: 'left', '& .MuiAlert-message': { py: 0.5, fontWeight: 600, fontSize: '1rem', lineHeight: 1.4 } }}>
                    Бронювання доступне лише особам, які досягли 18 років.
                </Alert>
            )}
        </Stack>
    );
    
    return (
        <Box sx={{ pb: 0, bgcolor: '#fafafa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            
            <Box sx={{ position: 'relative', height: { xs: '50vh', md: '70vh' }, bgcolor: '#000', overflow: 'hidden' }}>
                <Box component="img" src={currentHeroImage} onClick={() => openGallery(tourImageUrls, heroIndex)} sx={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85, transition: 'opacity 0.5s ease-in-out', cursor: 'zoom-in', '&:hover': { opacity: 1 } }} />
                <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)', pointerEvents: 'none' }} />
                {tourImageUrls.length > 1 && (
                    <>
                        <IconButton onClick={handleHeroPrev} sx={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: 'white', bgcolor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(5px)', zIndex: 10, '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}><ArrowBackIosNew /></IconButton>
                        <IconButton onClick={handleHeroNext} sx={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', color: 'white', bgcolor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(5px)', zIndex: 10, '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}><ArrowForwardIos /></IconButton>
                    </>
                )}
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/')} sx={{ position: 'absolute', top: 30, left: 30, color: 'white', bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', px: 3, zIndex: 10 }}>Назад</Button>
                <Chip icon={<PhotoCamera sx={{ color: 'white !important' }} />} label={`Фото ${heroIndex + 1} / ${Math.max(1, tourImageUrls.length)}`} sx={{ position: 'absolute', bottom: 30, right: 30, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', backdropFilter: 'blur(4px)', zIndex: 10 }} />
                <Container maxWidth="xl" sx={{ position: 'absolute', bottom: 40, left: 0, pointerEvents: 'none', zIndex: 5 }}>
                    <Typography variant={isMobile ? "h4" : "h1"} fontWeight={900} sx={{ color: 'white', textShadow: '0 4px 30px rgba(0,0,0,0.7)', maxWidth: '900px', lineHeight: 1.1 }}>{tour.title}</Typography>
                </Container>
            </Box>

            <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #eee', py: 3, position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Container maxWidth="xl">
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr', 
                            sm: '1fr 1fr', 
                            md: 'repeat(4, 1fr)' 
                        },
                        gap: 3 
                    }}>
                        
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box sx={{ p: 1.5, bgcolor: '#e3f2fd', borderRadius: '12px' }}><CalendarMonth color="primary" /></Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 0.5, textTransform: 'uppercase', fontSize: '0.7rem' }}>Дата та час виїзду</Typography>
                                <Typography fontWeight={700} fontSize="1rem" sx={{ lineHeight: 1.2 }}>
                                    {startInfo.date} о {startInfo.time} {startInfo.suffix}
                                </Typography>
                            </Box>
                        </Stack>

                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box sx={{ p: 1.5, bgcolor: '#fff3e0', borderRadius: '12px' }}><CalendarMonth color="warning" /></Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 0.5, textTransform: 'uppercase', fontSize: '0.7rem' }}>Дата та час завершення поїздки</Typography>
                                <Typography fontWeight={700} fontSize="1rem" sx={{ lineHeight: 1.2 }}>
                                    {endInfo.date} о {endInfo.time} {endInfo.suffix}
                                </Typography>
                            </Box>
                        </Stack>

                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box sx={{ p: 1.5, bgcolor: '#e8f5e9', borderRadius: '12px' }}>{getTransportIcon(tour.transport?.transportName || 'Bus')}</Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 0.5, textTransform: 'uppercase', fontSize: '0.7rem' }}>Основний транспорт</Typography>
                                <Typography fontWeight={700} noWrap fontSize="1.1rem" sx={{ lineHeight: 1.2 }}>{tour.transport?.transportName || 'Автобус'}</Typography>
                            </Box>
                        </Stack>

                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box sx={{ p: 1.5, bgcolor: '#ffebee', borderRadius: '12px' }}><Place color="error" /></Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 0.5, textTransform: 'uppercase', fontSize: '0.7rem' }}>Місце збору</Typography>
                                
                                <Typography fontWeight={700} sx={{ lineHeight: 1.2, fontSize: '1rem' }}>
                                    {tour.startLocation.countryName}, {tour.startLocation.cityName}
                                </Typography>
                                
                                <Typography variant="body2" color="text.secondary" noWrap>{tour.startAddress}</Typography>
                            </Box>
                        </Stack>

                    </Box>
                </Container>
            </Box>

            <Container maxWidth="xl" sx={{ mt: 6 }}>
                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={6} alignItems="flex-start">
                    
                    <Box sx={{ flex: 2, width: '100%' }}>
                        <Box sx={{ mb: 6 }}>
                            <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: '#1a1a1a' }}>Про цю подорож</Typography>
                            <Typography sx={{ color: '#444', fontSize: '1.1rem', lineHeight: 1.8, whiteSpace: 'pre-line', mt: 3 }}>{tour.description}</Typography>
                        
                        <Box sx={{ mt: 4, mb: 2 }}>
                            <Typography variant="subtitle2" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', mb: 2, letterSpacing: 1 }}>
                                Міста за маршрутом:
                            </Typography>
                            <Stack direction="row" flexWrap="wrap" gap={1.5}>
                                {visitCities.map((city, idx) => (
                                    <React.Fragment key={idx}>
                                        <Chip 
                                            label={city} 
                                            icon={<Place sx={{ fontSize: '18px !important' }} />}
                                            sx={{ 
                                                bgcolor: '#fff', 
                                                border: '1px solid #e0e0e0',
                                                fontWeight: 700,
                                                px: 1,
                                                py: 2.5,
                                                borderRadius: '12px',
                                                '& .MuiChip-icon': { color: theme.palette.primary.main }
                                            }} 
                                        />
                                        {idx < visitCities.length - 1 && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', color: '#ccc' }}>
                                                <ArrowForwardIos sx={{ fontSize: 14 }} />
                                            </Box>
                                        )}
                                    </React.Fragment>
                                ))}
                            </Stack>
                        </Box>
                        </Box>
                        <Divider sx={{ mb: 6 }} />
                        
                        <Box sx={{ mb: 6 }}>
                            <Typography variant="h5" fontWeight={700} gutterBottom>Що входить у вартість?</Typography>
                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ mt: 2 }}>
                                <Box sx={{ flex: 1 }}>
                                    <Stack spacing={2}>
                                            {includedList.length > 0 ? (includedList.map((item, i) => (<Stack key={i} direction="row" spacing={1.5} alignItems="flex-start"><CheckCircleOutline sx={{ color: '#4caf50', mt: 0.3, flexShrink: 0 }} /><Typography variant="body1">{item}</Typography></Stack>))) : (<Typography variant="body2" color="text.secondary">Інформація уточнюється</Typography>)}
                                    </Stack>
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Stack spacing={2}>
                                            {excludedList.length > 0 ? (excludedList.map((item, i) => (<Stack key={i} direction="row" spacing={1.5} alignItems="flex-start"><HighlightOff sx={{ color: '#f44336', mt: 0.3, flexShrink: 0 }} /><Typography variant="body1" color="text.secondary">{item}</Typography></Stack>))) : (<Typography variant="body2" color="text.secondary">Додаткових витрат не передбачено або інформація уточнюється</Typography>)}
                                    </Stack>
                                </Box>
                            </Stack>
                        </Box>
                        <Divider sx={{ mb: 6 }} />

                        <Box sx={{ mb: 6 }}>
                            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                                <Box sx={{ p: 1, bgcolor: '#e3f2fd', borderRadius: '12px' }}><Hotel color="primary" /></Box>
                                <Typography variant="h4" fontWeight={800}>Де ми зупинимось</Typography>
                            </Stack>
                            {uniqueHotels.length > 0 ? (
                                <>
                                    <Stack spacing={2}> 
                                        {uniqueHotels.slice(0, 1).map((data) => (
                                            <HotelCard key={data.hotel.hotelId} data={data} onImageClick={openGallery} />
                                        ))}

                                        {uniqueHotels.length > 1 && (
                                            <Collapse in={showAllHotels} timeout="auto" unmountOnExit>
                                                <Stack spacing={2} sx={{ mt: 2 }}> 
                                                    {uniqueHotels.slice(1).map((data) => (
                                                        <HotelCard key={data.hotel.hotelId} data={data} onImageClick={openGallery} />
                                                    ))}
                                                </Stack>
                                            </Collapse>
                                        )}
                                    </Stack>

                                    {uniqueHotels.length > 1 && (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                            <Button 
                                                onClick={() => setShowAllHotels(!showAllHotels)}
                                                variant="text"
                                                color="inherit"
                                                endIcon={<Box sx={{ display: 'flex', transition: 'transform 0.3s', transform: showAllHotels ? 'rotate(180deg)' : 'rotate(0deg)' }}><KeyboardArrowDown /></Box>}
                                                sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'none', fontSize: '0.95rem', borderRadius: 8, px: 3, '&:hover': { bgcolor: 'rgba(0,0,0,0.04)', color: 'text.primary' } }}
                                            >
                                                {showAllHotels ? 'Згорнути список готелів' : `Переглянути інші готелі (${uniqueHotels.length - 1})`}
                                            </Button>
                                        </Box>
                                    )}
                                </>
                            ) : (<Typography>Інформація про готелі уточнюється</Typography>)}
                        </Box>

                        <Box sx={{ mb: 6 }}>
                            <Stack direction="row" alignItems="center" spacing={2} mb={4}>
                                <Box sx={{ p: 1, bgcolor: '#ffebee', borderRadius: '12px' }}><MapIcon color="error" /></Box>
                                <Typography variant="h4" fontWeight={800}>Програма туру</Typography>
                            </Stack>
                            <Box sx={{ pl: 2, borderLeft: '2px solid #e0e0e0', ml: 2 }}>
                                {tour.routeSteps?.map((step, index) => (
                                    <Box key={index} sx={{ mb: 5, position: 'relative', pl: 5 }}>
                                            <Box sx={{ position: 'absolute', left: -21, top: 0, width: 40, height: 40, borderRadius: '50%', bgcolor: 'white', border: '3px solid #2563EB', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>{step.dayNumber}</Box>
                                            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, mt: 0.5, color: '#333' }}>День {step.dayNumber}</Typography>
                                            <Stack spacing={2}>
                                                {step.events.map((ev, i) => (
                                                    <Paper key={i} elevation={0} sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 3, display: 'flex', gap: 2, border: '1px solid #f0f0f0' }}>
                                                        <Box sx={{ minWidth: 24, display: 'flex', justifyContent: 'center', mt: 0.3 }}><AccessTime sx={{ fontSize: 18, color: '#9ca3af' }} /></Box>
                                                        <Typography variant="body1" sx={{ color: '#4b5563', lineHeight: 1.6 }}>{ev.description}</Typography>
                                                    </Paper>
                                                ))}
                                            </Stack>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ flex: 1, width: '100%', minWidth: { lg: '380px' } }}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: '#fff', border: '1px solid #e0e0e0', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', mb: 4 }}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                Вартість туру
                            </Typography>
                            
                            <Typography variant="h3" fontWeight={900} color="#1a1a1a" sx={{ mt: 1, mb: 1 }}>
                                {tour.price} <span style={{ fontSize: '1.5rem', color: '#999', fontWeight: 400 }}>₴</span>
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary" mb={4}>
                                ціна за одну особу
                            </Typography>

                            {isSalesClosed ? (
                                <Button 
                                    variant="contained" 
                                    fullWidth 
                                    size="large" 
                                    disableElevation
                                    disabled
                                    sx={{ 
                                        borderRadius: 3, py: 2, fontSize: '1.1rem', fontWeight: 800, 
                                        textTransform: 'none', 
                                        bgcolor: '#e0e0e0', color: '#888',
                                        '&.Mui-disabled': { bgcolor: '#e0e0e0', color: '#888' }
                                    }}
                                >
                                    Продаж закрито
                                </Button>
                            ) : (
                                <Button 
                                    variant="contained" 
                                    fullWidth 
                                    size="large" 
                                    disableElevation 
                                    onClick={() => setOpenBooking(true)} 
                                    disabled={isAdmin || isGuide || !canBook} 
                                    sx={{ 
                                        borderRadius: 3, 
                                        py: 2, 
                                        fontSize: '1.1rem', 
                                        fontWeight: 800, 
                                        textTransform: 'none', 
                                        bgcolor: '#2563EB', 
                                        '&:hover': { bgcolor: '#1d4ed8' }, 
                                        boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.39)' 
                                    }}
                                >
                                    {tour.availableSeats > 0 ? 'Забронювати зараз' : 'Місць немає'}
                                </Button>
                            )}

                            <Stack 
                                direction="row" 
                                justifyContent="center" 
                                alignItems="center" 
                                spacing={1} 
                                mt={2} 
                                mb={(!isAdmin && (isSoldOut || isSalesClosed || (!isUserAdult && userAge !== null))) ? 2 : 0}
                            >
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: tour.availableSeats < 5 ? '#f44336' : '#4caf50' }} />
                                <Typography variant="caption" fontWeight={600} color="text.secondary">
                                    {tour.availableSeats > 0 ? `Залишилось ${tour.availableSeats} місць` : 'Тур розпродано'}
                                </Typography>
                            </Stack>

                            {!isAdmin && (
                                <Box sx={{ mt: 2 }}>
                                    <StatusAlerts />
                                </Box>
                            )}
                        </Paper>
                        
                        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <Typography variant="h6" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}><InfoOutlined color="info" /> Організаційні деталі</Typography>
                            <Stack spacing={3}>
                                <Box>
                                    <Typography variant="subtitle2" fontWeight={700} gutterBottom color="text.secondary">ЗБІР ГРУПИ</Typography>
                                    
                                    <Stack spacing={1.5} sx={{ mt: 1 }}>
                                        <Stack direction="row" spacing={1.5} alignItems="start">
                                            <Place color="error" sx={{ mt: 0.3 }} />
                                            <Box>
                                                <Typography fontWeight={600} fontSize="0.95rem">
                                                    {tour.startLocation.countryName}, {tour.startLocation.cityName}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">{tour.startAddress}</Typography>
                                            </Box>
                                        </Stack>
                                        <Stack direction="row" spacing={1.5} alignItems="start">
                                            <AccessTime sx={{ color: '#555', mt: 0.3 }} />
                                            <Box>
                                                <Typography fontWeight={600} fontSize="0.95rem">Збір групи о {meetingInfo.time} {meetingInfo.suffix}</Typography>
                                                <Typography variant="body2" color="text.secondary">Виїзд о {startInfo.time}</Typography>
                                            </Box>
                                        </Stack>
                                    </Stack>

                                </Box>
                                
                                <Divider />
                                
                                <Box>
                                    <Typography variant="subtitle2" fontWeight={700} gutterBottom color="text.secondary">ТРАНСПОРТ</Typography>
                                    <Stack spacing={2}>
                                            <Box>
                                                <Stack direction="row" spacing={1} mb={0.5} alignItems="center">
                                                    {getTransportIcon(tour.transport?.transportName || 'Bus')}
                                                    <Typography fontWeight={600} variant="body1">{tour.transport?.transportName || 'Автобус'}</Typography>
                                                </Stack>
                                                <Stack direction="row" spacing={1} mb={1}>
                                                    {tour.transport?.transportNumber && (<Chip label={tour.transport.transportNumber} color="primary" size="small" icon={<ConfirmationNumber sx={{fontSize: '14px !important'}} />} sx={{ height: 24, fontSize: '0.75rem' }} />)}
                                                    <Chip label={tour.transport?.transportName} size="small" sx={{ bgcolor: '#eeeeee', color: '#424242', fontWeight: 700, height: 24, fontSize: '0.75rem' }} />
                                                </Stack>
                                                {tour.transport?.description && (<Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem', mt: 0.5, pl: 4 }}>{tour.transport.description}</Typography>)}
                                            </Box>
                                    </Stack>
                                </Box>
                                <Divider />
                                <Box>
                                    <Typography variant="subtitle2" fontWeight={700} gutterBottom color="text.secondary">ВАЖЛИВО ЗНАТИ</Typography>
                                    <Stack spacing={2.5} sx={{ mt: 2 }}>
                                            <Stack direction="row" spacing={1.5} alignItems="start"><AccessTime fontSize="small" sx={{ color: '#2563EB', mt: 0.3 }} /><Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>Для того, щоб наша подорож розпочалася легко та без зайвих хвилювань, просимо вас <b>прибути на місце посадки за 30 хвилин</b> до відправлення. Так ми зможемо спокійно розмістити багаж і вирушити вчасно!</Typography></Stack>
                                            <Stack direction="row" spacing={1.5} alignItems="start"><EmojiPeople fontSize="small" sx={{ color: '#2563EB', mt: 0.3 }} /><Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>Ваш гід — справжній професіонал, який зробить усе, щоб ця мандрівка стала незабутньою. <b>Одразу після бронювання</b> ви отримаєте його контакти, тож завжди будете на зв'язку.</Typography></Stack>
                                            <Stack direction="row" spacing={1.5} alignItems="start"><SupportAgent fontSize="small" sx={{ color: '#4caf50', mt: 0.3 }} /><Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>Не забудьте перевірити наявність необхідних документів! А якщо виникають сумніви чи питання — <b>сміливо телефонуйте нашому адміністратору</b>. Ми завжди раді допомогти та підказати.</Typography></Stack>
                                            <Stack direction="row" spacing={1.5} alignItems="start"><VerifiedUser fontSize="small" sx={{ color: '#ff9800', mt: 0.3 }} /><Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}><b>Бронюйте сміливо!</b> Ми подбали про кожну деталь, щоб вам було зручно та зрозуміло на кожному кроці. Все буде чудово — на вас чекає неймовірний відпочинок!</Typography></Stack>
                                    </Stack>
                                </Box>
                            </Stack>
                        </Paper>
                    </Box>
                </Stack>
            </Container>

            <Box sx={{ mt: 'auto', bgcolor: '#111827', color: 'white', py: 8 }}>
                <Container maxWidth="md" sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" fontWeight={900} gutterBottom>Готові до пригод?</Typography>
                    <Typography variant="h6" sx={{ color: '#9ca3af', mb: 4, maxWidth: '600px', mx: 'auto' }}>
                        Забронюйте місце зараз, поки вони ще є. Подорож вашої мрії починається з одного кліку.
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                        <Typography 
                            variant="body2" 
                            component="span" 
                            sx={{ 
                                color: 'rgba(255,255,255,0.5)', 
                                fontSize: '0.875rem', 
                                cursor: 'pointer', 
                                textDecoration: 'underline', 
                                transition: 'color 0.2s',
                                '&:hover': { color: '#fff' } 
                            }} 
                            onClick={() => window.open('/policy', '_blank')}
                        >
                            Ознайомитися з Політикою компанії та умовами повернення коштів
                        </Typography>
                    </Box>

                    {!canBook && !isAdmin && !isSalesClosed && (
                        <Box sx={{ 
                            mb: 4, 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: 2,
                            px: 3, 
                            py: 1.5, 
                            bgcolor: 'rgba(255, 255, 255, 0.03)', 
                            borderRadius: '16px',
                            border: '1px solid',
                            borderColor: (!isUserAdult && userAge !== null) ? 'rgba(255, 82, 82, 0.2)' : 'rgba(255, 183, 77, 0.2)',
                        }}>
                            <Box sx={{ 
                                display: 'flex', 
                                p: 1, 
                                borderRadius: '50%', 
                                bgcolor: (!isUserAdult && userAge !== null) ? 'rgba(255, 82, 82, 0.1)' : 'rgba(255, 183, 77, 0.1)',
                                color: (!isUserAdult && userAge !== null) ? '#ff5252' : '#ffb74d'
                            }}>
                                {isSoldOut ? <HourglassEmptyIcon fontSize="small" /> : <ErrorOutlineIcon fontSize="small" />}
                            </Box>

                            <Typography variant="body2" sx={{ 
                                fontWeight: 500, 
                                color: '#e5e7eb', 
                                textAlign: 'left', 
                                maxWidth: '550px',
                                lineHeight: 1.5 
                            }}>
                                {isSoldOut 
                                    ? "На даний момент місць немає, але можливо через деякий час вони з'являться." 
                                    : (!isUserAdult && userAge !== null)
                                    ? "Бронювання доступне лише особам, які досягли 18 років."
                                    : "Бронювання тимчасово недоступне."
                                }
                            </Typography>
                        </Box>
                    )}

                    <Box sx={{ display: 'block' }}>
                        <Paper sx={{ 
                            p: 1, 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            borderRadius: 10, 
                            bgcolor: 'rgba(255,255,255,0.1)', 
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <Box sx={{ px: 4, py: 1, textAlign: 'left' }}>
                                <Typography variant="caption" display="block" color="#9ca3af" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                                    Вільних місць
                                </Typography>
                                <Typography variant="h5" fontWeight={800}>{tour.availableSeats}</Typography>
                            </Box>
                            
                            {isSalesClosed ? (
                                <Button 
                                    variant="contained" 
                                    size="large" 
                                    disabled 
                                    sx={{ 
                                        borderRadius: 10, px: 6, py: 2, fontSize: '1.2rem', fontWeight: 800, 
                                        bgcolor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.3)',
                                        '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.3)' }
                                    }}
                                >
                                    Продаж закрито
                                </Button>
                            ) : (
                                <Button 
                                    variant="contained" 
                                    size="large" 
                                    onClick={() => setOpenBooking(true)} 
                                    disabled={isAdmin || isGuide || !canBook} 
                                    sx={{ 
                                        borderRadius: 10, px: 6, py: 2, fontSize: '1.2rem', fontWeight: 800, 
                                        bgcolor: '#2563EB', 
                                        '&:hover': { bgcolor: '#1d4ed8', transform: 'scale(1.02)' }, 
                                        transition: 'all 0.2s',
                                        '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.3)' }
                                    }}
                                >
                                    {isSoldOut ? 'РОЗПРОДАНО' : 'ЗАБРОНЮВАТИ'}
                                </Button>
                            )}
                        </Paper>
                    </Box>
                </Container>
            </Box>

            <Dialog open={lightboxOpen} onClose={() => setLightboxOpen(false)} maxWidth={false} fullScreen PaperProps={{ sx: { bgcolor: 'rgba(0,0,0,0.95)', boxShadow: 'none' } }}>
                <IconButton onClick={() => setLightboxOpen(false)} sx={{ position: 'absolute', top: 30, right: 30, color: 'white', zIndex: 10 }}><Close sx={{ fontSize: 40 }} /></IconButton>
                <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <Box 
                        component="img" 
                        src={getHighQualityUrl(lightboxImages[photoIndex])} 
                        sx={{ 
                            maxHeight: '90vh', 
                            maxWidth: '90vw', 
                            objectFit: 'contain', 
                            borderRadius: 2, 
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                            imageRendering: '-webkit-optimize-contrast' 
                        }} 
                    />
                    {lightboxImages.length > 1 && (
                        <>
                            <IconButton onClick={handleLightboxPrev} sx={{ position: 'absolute', left: 40, color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}><ArrowBackIosNew sx={{ fontSize: 30 }} /></IconButton>
                            <IconButton onClick={handleLightboxNext} sx={{ position: 'absolute', right: 40, color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}><ArrowForwardIos sx={{ fontSize: 30 }} /></IconButton>
                        </>
                    )}
                    <Typography sx={{ position: 'absolute', bottom: 30, color: 'white', bgcolor: 'rgba(0,0,0,0.5)', px: 3, py: 1, borderRadius: 20 }}>{photoIndex + 1} / {lightboxImages.length}</Typography>
                </Box>
            </Dialog>

            <FormPage 
                open={openBooking} 
                onClose={() => {
                    setOpenBooking(false);
                    fetchTourData(); 
                }} 
                tour={tour} 
            />
        </Box>
    );
};

const HotelCard: React.FC<{ data: HotelDisplayData, onImageClick: (imgs: string[], idx: number) => void }> = ({ data, onImageClick }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const { clientWidth } = scrollContainerRef.current;
            const scrollAmount = direction === 'left' ? -clientWidth : clientWidth;
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const hotelImageUrls = useMemo(() => {
        // camelCase: imageUrl
        return data.hotel.images?.map(img => img.imageUrl) || [];
    }, [data.hotel]);

    const hasImages = hotelImageUrls.length > 0;
    const showArrows = hasImages && hotelImageUrls.length > 3;

    return (
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: '#fff', border: '1px solid #e0e0e0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', mb: 3 }}>
            <Typography variant="overline" color="primary" fontWeight={700} sx={{ letterSpacing: 1.2 }}>{data.country}</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="baseline" mb={2}>
                <Typography variant="h5" fontWeight={700}>{data.hotel.name}</Typography>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ bgcolor: '#fff8e1', px: 1.5, py: 0.5, borderRadius: 2 }}><Typography fontWeight={700} color="#ffc107">{data.hotel.stars}</Typography><Star sx={{ color: '#ffc107', fontSize: 20 }} /></Stack>
            </Stack>
            <Typography variant="body1" paragraph sx={{ color: '#555', mb: 3 }}>{data.hotel.description}</Typography>
            {hasImages && (
                <>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>Фото готелю</Typography>
                    <Box sx={{ position: 'relative' }}>
                        {showArrows && (<IconButton onClick={() => scroll('left')} sx={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', zIndex: 2, bgcolor: 'rgba(255,255,255,0.7)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', '&:hover': { bgcolor: 'white' } }}><ArrowBackIosNew fontSize="small" /></IconButton>)}
                        <Box ref={scrollContainerRef} sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1.5, scrollSnapType: 'x mandatory', '::-webkit-scrollbar': { height: 6 }, '::-webkit-scrollbar-thumb': { bgcolor: '#e0e0e0', borderRadius: 4 }, '::-webkit-scrollbar-track': { bgcolor: 'transparent' } }}>
                            {hotelImageUrls.map((imgUrl, i) => (
                                <Box key={i} component="img" src={imgUrl} onClick={() => onImageClick(hotelImageUrls, i)} sx={{ minWidth: { xs: '85%', sm: '45%', md: 'calc(33.33% - 11px)' }, maxWidth: { xs: '85%', sm: '45%', md: 'calc(33.33% - 11px)' }, height: 180, borderRadius: 3, objectFit: 'cover', flexShrink: 0, cursor: 'zoom-in', transition: 'all 0.3s ease', scrollSnapAlign: 'start', '&:hover': { filter: 'brightness(0.9)', transform: 'scale(1.02)' } }} />
                            ))}
                        </Box>
                        {showArrows && (<IconButton onClick={() => scroll('right')} sx={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', zIndex: 2, bgcolor: 'rgba(255,255,255,0.7)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', '&:hover': { bgcolor: 'white' } }}><ArrowForwardIos fontSize="small" /></IconButton>)}
                    </Box>
                </>
            )}
        </Paper>
    );
};

export default TourDetailsPage;