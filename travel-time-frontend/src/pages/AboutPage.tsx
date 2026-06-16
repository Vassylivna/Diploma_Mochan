import React from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Stack,
    Button,
    Avatar,
    Divider,
    IconButton,
} from '@mui/material';
import {
    ArrowBack,
    Phone,
    Email,
    LocationOn,
    Telegram,
    Instagram,
    Facebook,
    VerifiedUser,
    SupportAgent,
    LocalOffer,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AboutPage: React.FC = () => {
    const navigate = useNavigate();

    const handleGoBack = () => {
        const userRole = localStorage.getItem('app_user_role'); 

        if (userRole === 'guide') {
            navigate('/guide/dashboard');
        } else {
            navigate('/'); 
        }

    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                width: '100%',
                backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url("https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                py: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <Container maxWidth="lg">
                <Paper
                    elevation={24}
                    sx={{
                        p: { xs: 3, md: 6 },
                        borderRadius: 6,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                    }}
                >
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} mb={2}>
                            <Box
                                component="img"
                                src="/assets/map.png"
                                alt="Travel Map"
                                sx={{
                                    width: 60,
                                    height: 'auto',
                                    filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.2))'
                                }}
                            />
                            <Typography variant="h3" component="h1" sx={{ fontWeight: 900, color: '#1a1a1a', letterSpacing: '-1px' }}>
                                Travel Time
                            </Typography>
                        </Stack>
                        <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 500, maxWidth: '600px', mx: 'auto' }}>
                            Ваш надійний сервіс для пошуку та бронювання подорожей.
                        </Typography>
                        <Divider sx={{ width: '80px', height: '6px', bgcolor: '#ff9800', mx: 'auto', mt: 3, borderRadius: 3 }} />
                    </Box>

                    <Box sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: { xs: '1fr', md: '1.5fr 1fr' }, 
                        gap: 6 
                    }}>
                        
                        <Box>
                            <Box sx={{ mb: 5 }}>
                                <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, color: '#333' }}>
                                    Про нас
                                </Typography>
                                <Typography paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#555', textAlign: 'justify' }}>
                                    <b>Travel Time</b> — це сучасна онлайн-платформа, що об'єднує пропозиції від провідних туроператорів. Ми створили цей сервіс, щоб спростити процес планування відпустки, зробивши його швидким, зручним та безпечним.
                                </Typography>
                                <Typography paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#555', textAlign: 'justify' }}>
                                    Ми пропонуємо зручні інструменти для пошуку турів, які відповідають вашим критеріям. Наша мета — надати вам повну інформацію та впевненість у кожному етапі бронювання.
                                </Typography>
                            </Box>

                            <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, color: '#333' }}>
                                Наші переваги
                            </Typography>

                            <Stack spacing={2}>
                                {[
                                    { 
                                        icon: <VerifiedUser />, 
                                        color: '#1976d2', 
                                        bg: '#e3f2fd', 
                                        title: 'Надійні партнери', 
                                        text: 'Ми співпрацюємо виключно з перевіреними туроператорами.' 
                                    },
                                    { 
                                        icon: <SupportAgent />, 
                                        color: '#ff9800', 
                                        bg: '#fff3e0', 
                                        title: 'Інформаційна підтримка', 
                                        text: 'Наша служба підтримки завжди готова надати необхідну інформацію.' 
                                    },
                                    { 
                                        icon: <LocalOffer />, 
                                        color: '#4caf50', 
                                        bg: '#e8f5e9', 
                                        title: 'Прозорі умови', 
                                        text: 'Всі ціни та умови бронювання є відкритими та зрозумілими.' 
                                    }
                                ].map((item, index) => (
                                    <Paper 
                                        key={index} 
                                        elevation={0} 
                                        sx={{ 
                                            p: 2.5, 
                                            bgcolor: item.bg, 
                                            borderRadius: 4, 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 3,
                                            transition: 'transform 0.3s',
                                            '&:hover': { transform: 'translateX(10px)' }
                                        }}
                                    >
                                        <Avatar sx={{ bgcolor: item.color, width: 50, height: 50 }}>{item.icon}</Avatar>
                                        <Box>
                                            <Typography variant="h6" fontWeight={700} sx={{ color: '#333', fontSize: '1.1rem' }}>{item.title}</Typography>
                                            <Typography variant="body2" sx={{ color: '#555' }}>{item.text}</Typography>
                                        </Box>
                                    </Paper>
                                ))}
                            </Stack>
                        </Box>

                        <Box>
                            <Paper 
                                elevation={12} 
                                sx={{ 
                                    p: 5, 
                                    borderRadius: 5, 
                                    bgcolor: '#1a1a1a', 
                                    color: 'white', 
                                    height: '100%',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <Box sx={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, borderRadius: '50%', bgcolor: 'rgba(255,152,0,0.2)' }} />

                                <Typography variant="h4" sx={{ fontWeight: 800, mb: 5, color: '#ff9800' }}>
                                    Контакти
                                </Typography>

                                <Stack spacing={4}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#ff9800' }}><Phone /></Avatar>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: 'grey.500', textTransform: 'uppercase' }}>Контакт-центр</Typography>
                                            <Typography variant="h6" fontWeight={700}>+380 99 123 45 67</Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#ff9800' }}><Email /></Avatar>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: 'grey.500', textTransform: 'uppercase' }}>Email</Typography>
                                            <Typography variant="h6" fontWeight={700}>traveltime@gmail.com</Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#ff9800' }}><LocationOn /></Avatar>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: 'grey.500', textTransform: 'uppercase' }}>Офіс</Typography>
                                            <Typography variant="body1" fontWeight={700}>м. Львів, пл. Ринок 1</Typography>
                                        </Box>
                                    </Box>
                                </Stack>

                                <Divider sx={{ my: 5, bgcolor: 'rgba(255,255,255,0.1)' }} />

                                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>
                                    Ми в соцмережах:
                                </Typography>
                                <Stack direction="row" spacing={2} justifyContent="center">
                                    <IconButton sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: '#0088cc' } }}>
                                        <Telegram />
                                    </IconButton>
                                    <IconButton sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: '#E1306C' } }}>
                                        <Instagram />
                                    </IconButton>
                                    <IconButton sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: '#1877F2' } }}>
                                        <Facebook />
                                    </IconButton>
                                </Stack>
                            </Paper>
                        </Box>
                    </Box>

                    <Box sx={{ mt: 8 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, color: '#333', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <LocationOn sx={{ color: '#ff9800' }} /> Як нас знайти?
                        </Typography>
                        <Paper 
                            elevation={6}
                            sx={{ 
                                width: '100%', 
                                height: '400px', 
                                borderRadius: 4, 
                                overflow: 'hidden',
                                border: '4px solid white'
                            }}
                        >
                            <iframe 
                                title="Lviv Location"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2573.0704461533425!2d24.029198676885374!3d49.84112033099957!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x473add6d94f99539%3A0x6b499e90089f8d50!2z0L_Qu9C-0YnQsCDQoNC40L3QvtC6LCAxLCDQm9GM0LLRltCyLCDQm9GM0LLRltCy0YHRjNC60LAg0L7QsdC70LDRgdGC0YwsIDc5MDAw!5e0!3m2!1suk!2sua!4v1703250000000!5m2!1suk!2sua" 
                                width="100%" 
                                height="100%" 
                                style={{ border: 0 }} 
                                allowFullScreen={true} 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </Paper>
                    </Box>

                    <Box sx={{ mt: 8, textAlign: 'center' }}>
                        <Button 
                            variant="outlined" 
                            size="large" 
                            startIcon={<ArrowBack />} 
                            onClick={handleGoBack}
                            sx={{ 
                                borderRadius: 3, 
                                px: 5, 
                                py: 1.5,
                                fontWeight: 800,
                                textTransform: 'none',
                                borderWidth: 2,
                                borderColor: '#1976d2',
                                color: '#1976d2',
                                '&:hover': { borderWidth: 2, bgcolor: 'rgba(25, 118, 210, 0.05)' }
                            }}
                        >
                            Назад
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default AboutPage;