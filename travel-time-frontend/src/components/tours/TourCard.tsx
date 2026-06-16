import React, { useState } from 'react';
import { 
    Card, CardContent, Typography, Box, CardMedia, Stack, Divider, Chip, IconButton 
} from '@mui/material';
import { 
    HotelOutlined, DirectionsBusOutlined, FlightTakeoffOutlined, TrainOutlined,
    CreditCardOutlined, CalendarMonthOutlined, PeopleAltOutlined, LocationOnOutlined,
    ArrowBackIos, ArrowForwardIos, Star 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { TourCard as TourCardType } from '../../types/tour.types';

interface TourCardProps {
    tour: TourCardType;
    userRole: 'admin' | 'user' | 'guide' | null;
}

const TourCard: React.FC<TourCardProps> = ({ tour, userRole }) => {
    const navigate = useNavigate();
    
    const [currentImgIndex, setCurrentImgIndex] = useState(0);

    if (tour.isArchived && userRole !== 'admin') return null;
    if (tour.isHidden && userRole !== 'admin') return null;

    const handleCardClick = () => {
        navigate(`/tour/${tour.tourId}`);
    };

    const hasMultipleImages = tour.images && tour.images.length > 1;

    const handleNextImg = (e: React.MouseEvent) => {
        e.stopPropagation(); 
        if (tour.images && tour.images.length > 1) {
            const length = tour.images.length;
            setCurrentImgIndex((prev) => (prev + 1) % length);
        }
    };

    const handlePrevImg = (e: React.MouseEvent) => {
        e.stopPropagation(); 
        if (tour.images && tour.images.length > 1) {
            const length = tour.images.length;
            setCurrentImgIndex((prev) => (prev === 0 ? length - 1 : prev - 1));
        }
    };

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('uk-UA');

    const getTransportIcon = (name: string) => {
        const lowerName = name?.toLowerCase() || '';
        if (lowerName.includes('літак') || lowerName.includes('flight')) return <FlightTakeoffOutlined sx={{ fontSize: 20, mr: 1, color: '#03a9f4' }} />;
        if (lowerName.includes('поїзд') || lowerName.includes('train')) return <TrainOutlined sx={{ fontSize: 20, mr: 1, color: '#ff9800' }} />;
        return <DirectionsBusOutlined sx={{ fontSize: 20, mr: 1, color: '#4caf50' }} />;
    };


    const displayImage = (tour.images && tour.images.length > 0 && tour.images[currentImgIndex]) 
        ? tour.images[currentImgIndex].imageUrl 
        : 'https://via.placeholder.com/400x300?text=No+Image';

    const locationDisplay = tour.tourCountries && tour.tourCountries.length > 0 
        ? tour.tourCountries.join(', ') 
        : 'Локація не вказана';

    const hotelStars = tour.stars || 0; 

    const transportNameDisplay = tour.transport?.transportName || 'Транспорт';

    const seatsDisplay = tour.availableSeats !== undefined ? tour.availableSeats : 0;

    return (
        <Card 
            onClick={handleCardClick}
            sx={{
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                border: 'none', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)', 
                borderRadius: 4, 
                overflow: 'hidden', 
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': { 
                    transform: 'translateY(-8px)', 
                    boxShadow: '0 15px 30px rgba(0,0,0,0.15)', 
                    '& .MuiCardMedia-root': { transform: 'scale(1.05)' } 
                },
                position: 'relative'
            }}
        >
             {(tour.isArchived || tour.isHidden) && (
                <Box sx={{ position: 'absolute', top: 10, left: 10, zIndex: 2, display: 'flex', gap: 0.5 }}>
                    {tour.isArchived && <Chip label="Архівований" color="default" size="small" />}
                    {tour.isHidden && <Chip label="Прихований" color="warning" size="small" />}
                </Box>
            )}

            <Box sx={{ position: 'relative', overflow: 'hidden', height: 220, bgcolor: '#f0f0f0' }}>
                <CardMedia 
                    component="img" 
                    height="220" 
                    image={displayImage} 
                    alt={tour.title} 
                    sx={{ objectFit: 'cover', transition: 'transform 0.5s ease' }} 
                />
                
                {hasMultipleImages && (
                    <>
                        <IconButton 
                            size="small" 
                            onClick={handlePrevImg} 
                            sx={{ 
                                position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', 
                                bgcolor: 'rgba(255,255,255,0.7)', color: 'black',
                                '&:hover': { bgcolor: 'white' } 
                            }}
                        >
                            <ArrowBackIos sx={{ fontSize: 14, ml: 0.5 }} />
                        </IconButton>
                        <IconButton 
                            size="small" 
                            onClick={handleNextImg} 
                            sx={{ 
                                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', 
                                bgcolor: 'rgba(255,255,255,0.7)', color: 'black',
                                '&:hover': { bgcolor: 'white' } 
                            }}
                        >
                            <ArrowForwardIos sx={{ fontSize: 14 }} />
                        </IconButton>
                        
                        <Box sx={{ position: 'absolute', bottom: 8, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                            {tour.images?.map((_, idx) => (
                                <Box 
                                    key={idx} 
                                    sx={{ 
                                        width: 6, height: 6, borderRadius: '50%', 
                                        bgcolor: idx === currentImgIndex ? 'white' : 'rgba(255,255,255,0.5)',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
                                    }} 
                                />
                            ))}
                        </Box>
                    </>
                )}

                <Chip 
                    icon={<PeopleAltOutlined sx={{ fontSize: '16px !important' }} />} 
                    label={seatsDisplay > 0 ? `${seatsDisplay} місць` : 'Місць немає'} 
                    sx={{ position: 'absolute', top: 12, right: 12, bgcolor: 'rgba(255,255,255,0.95)', fontWeight: 800 }} 
                />
            </Box>

            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', pb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, mb: 1 }}>{tour.title}</Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: 'text.secondary', fontSize: '0.9rem' }}>
                    <CalendarMonthOutlined sx={{ mr: 0.5, fontSize: 18, color: '#1976d2' }} />
                    {formatDate(tour.startDate)} — {formatDate(tour.endDate)}
                </Box>

                <Typography sx={{ mb: 2, color: '#555', fontSize: '0.875rem' }}>
                    {tour.description.length > 90 ? tour.description.substring(0, 90) + '...' : tour.description}
                </Typography>
                
                <Stack spacing={0.5} mb={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
                        <LocationOnOutlined sx={{ mr: 1, fontSize: 18, color: '#f44336' }} /> 
                        <b>{locationDisplay}</b>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
                        <HotelOutlined sx={{ mr: 1, fontSize: 18, color: '#ff9800' }} /> 
                        Готель:                         
                        {hotelStars > 0 ? (
                            <Box sx={{ display: 'flex', ml: 0.5 }}>
                                {[...Array(hotelStars)].map((_, index) => (
                                    <Star key={index} sx={{ fontSize: 16, color: '#fbc02d' }} />
                                ))}
                            </Box>
                        ) : (
                            <span style={{ marginLeft: 4 }}>Без готелю</span>
                        )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
                        {getTransportIcon(transportNameDisplay)} 
                        Транспорт:&nbsp;<b>{transportNameDisplay}</b>
                    </Box>
                </Stack>
                
                <Divider sx={{ my: 1 }} />
                
                <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: '#2e7d32' }}>
                        <CreditCardOutlined sx={{ mr: 1 }} />
                        <Typography variant="h6" fontWeight={900}>{tour.price} ₴</Typography>
                    </Box>
                    <Typography 
                        variant="button" 
                        color="primary" 
                        fontWeight={700} 
                        sx={{ fontSize: '0.8rem', textTransform: 'uppercase' }}
                    >
                        Детальніше
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default TourCard;