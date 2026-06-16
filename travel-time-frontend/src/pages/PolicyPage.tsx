import React, { useEffect } from 'react';
import { 
    Container, Typography, Box, Paper, Divider, Link, Stack
} from '@mui/material';

const PolicyPage: React.FC = () => {

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <Box sx={{ bgcolor: '#eef0f2', minHeight: '100vh', py: 5 }}>
            <Container maxWidth="md">
                
                <Paper 
                    elevation={1} 
                    sx={{ 
                        p: { xs: 4, md: 8 }, 
                        borderRadius: 2, 
                        bgcolor: '#ffffff',
                        border: '1px solid #e0e0e0'
                    }}
                >
                    
                    <Box sx={{ mb: 6, borderBottom: '2px solid #000', pb: 3 }}>
                        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 800, color: '#000', textTransform: 'uppercase', letterSpacing: 1 }}>
                            Правила надання туристичних послуг
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Діє від {new Date().toLocaleDateString('uk-UA')} року
                        </Typography>
                    </Box>

                    {/* ЗМІСТ */}
                    <Box sx={{ mb: 6, p: 3, bgcolor: '#f9f9f9', borderRadius: 1, border: '1px solid #eee' }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>Зміст документа:</Typography>
                        <Stack spacing={1}>
                            <Link component="button" variant="body1" onClick={() => scrollToSection('section-1')} sx={{ textAlign: 'left', color: '#1976d2', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                                1. Основні положення
                            </Link>
                            <Link component="button" variant="body1" onClick={() => scrollToSection('section-2')} sx={{ textAlign: 'left', color: '#1976d2', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                                2. Бронювання та вікові обмеження
                            </Link>
                            <Link component="button" variant="body1" onClick={() => scrollToSection('section-3')} sx={{ textAlign: 'left', color: '#1976d2', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                                3. Оплата та умови повернення коштів
                            </Link>
                            <Link component="button" variant="body1" onClick={() => scrollToSection('section-4')} sx={{ textAlign: 'left', color: '#1976d2', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                                4. Права та обов'язки
                            </Link>
                            <Link component="button" variant="body1" onClick={() => scrollToSection('section-5')} sx={{ textAlign: 'left', color: '#1976d2', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                                5. Відповідальність сторін
                            </Link>
                        </Stack>
                    </Box>

                    <Stack spacing={5}>

                        <Box id="section-1">
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#222' }}>
                                1. Основні положення
                            </Typography>
                            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, textAlign: 'justify' }}>
                                1.1. Цей документ є офіційною пропозицією Туристичного оператора укласти договір на надання послуг. Коли ви бронюєте місце в турі або вносите оплату, ви автоматично погоджуєтеся з умовами цієї угоди.
                            </Typography>
                            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, textAlign: 'justify' }}>
                                1.2. Оплачуючи послуги, ви підтверджуєте, що ознайомилися з програмою подорожі та правилами перетину кордону.
                            </Typography>
                            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, textAlign: 'justify' }}>
                                1.3. Адміністратор гарантує, що має всі необхідні права та можливості для організації поїздки згідно із заявленою програмою.
                            </Typography>
                        </Box>

                        <Divider />

                        <Box id="section-2">
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#222' }}>
                                2. Бронювання та вікові обмеження
                            </Typography>
                            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, textAlign: 'justify' }}>
                                2.1. Для безпеки та комфорту всіх учасників ми встановили певні вікові правила:
                            </Typography>
                            
                            <Box sx={{ pl: 2, borderLeft: '4px solid #333', ml: 1, mb: 3 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2 }}>
                                    2.2. Дорослі від 18 років
                                </Typography>
                                <Typography variant="body2" paragraph sx={{ color: '#444' }}>
                                    Мають право самостійно бронювати місця та несуть повну відповідальність за дотримання правил поїздки.
                                </Typography>

                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                    2.3. Підлітки від 13 до 17 років
                                </Typography>
                                <Typography variant="body2" paragraph sx={{ color: '#444' }}>
                                    Можуть подорожувати лише з дорослим супровідником. Бронювання можливе тільки після підтвердження від нашого адміністратора.
                                </Typography>

                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                    2.4. Діти до 12 років
                                </Typography>
                                <Typography variant="body2" paragraph sx={{ color: '#444' }}>
                                    Подорож з дітьми вимагає індивідуального узгодження. Ми маємо переконатися, що маршрут не буде занадто складним для дитини, а в автобусі та готелі будуть належні умови безпеки.
                                </Typography>
                            </Box>
                        </Box>

                        <Divider />

                        <Box id="section-3">
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#222' }}>
                                3. Оплата та умови повернення коштів
                            </Typography>
                            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, textAlign: 'justify' }}>
                                3.1. Вартість подорожі фіксується в момент підтвердження замовлення. Оплата здійснюється у гривнях.
                            </Typography>
                            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, textAlign: 'justify' }}>
                                3.2. Якщо ви вирішили скасувати бронювання, сума повернення залежить від дати повідомлення про скасування. Це пов'язано з тим, що ми заздалегідь оплачуємо готелі та транспорт.
                            </Typography>

                            <Box sx={{ my: 3, border: '1px solid #000' }}>
                                <Stack direction="row" sx={{ borderBottom: '1px solid #000', bgcolor: '#f0f0f0' }}>
                                    <Box sx={{ width: '60%', p: 2, borderRight: '1px solid #000' }}>
                                        <Typography fontWeight={700}>Коли ви повідомляєте про скасування</Typography>
                                    </Box>
                                    <Box sx={{ width: '40%', p: 2 }}>
                                        <Typography fontWeight={700}>Скільки коштів ми повертаємо</Typography>
                                    </Box>
                                </Stack>
                                
                                <Stack direction="row" sx={{ borderBottom: '1px solid #ccc' }}>
                                    <Box sx={{ width: '60%', p: 2, borderRight: '1px solid #ccc' }}>
                                        <Typography>
                                            <b>За 14 днів і більше до виїзду</b>
                                        </Typography>
                                    </Box>
                                    <Box sx={{ width: '40%', p: 2 }}>
                                        <Typography fontWeight={700}>100% суми</Typography>
                                    </Box>
                                </Stack>

                                <Stack direction="row" sx={{ bgcolor: '#fff0f0' }}>
                                    <Box sx={{ width: '60%', p: 2, borderRight: '1px solid #ccc' }}>
                                        <Typography>
                                            <b>Менше ніж за 14 днів до виїзду</b>
                                        </Typography>
                                    </Box>
                                    <Box sx={{ width: '40%', p: 2 }}>
                                        <Typography fontWeight={700} color="error">Кошти не повертаються</Typography>
                                    </Box>
                                </Stack>
                            </Box>

                            <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#555', mt: 2, textAlign: 'justify' }}>
                                Пояснення: За два тижні до початку подорожі ми перераховуємо кошти перевізникам та готелям для забезпечення вашого проживання та проїзду. Ці платежі є остаточними, і партнери їх нам не повертають, тому ми не можемо повернути їх вам у разі пізнього скасування.
                            </Typography>
                        </Box>

                        <Divider />

                        <Box id="section-4">
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#222' }}>
                                4. Права та обов'язки
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2 }}>
                                4.1. Ви зобов'язані:
                            </Typography>
                            <Box component="ul" sx={{ pl: 4, mt: 1, typography: 'body1', lineHeight: 1.8 }}>
                                <li>Прибути на місце збору вчасно. Ми радимо бути на місці за 30 хвилин до відправлення.</li>
                                <li>Мати при собі дійсні документи. Відповідальність за правильність оформлення паспортів та віз лежить на вас.</li>
                                <li>Дотримуватися законів країн, які ми відвідуємо, та правил поведінки.</li>
                                <li>Відшкодувати збитки, якщо ви випадково пошкодите майно в автобусі чи готелі.</li>
                            </Box>

                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2 }}>
                                4.2. Ми зобов'язані:
                            </Typography>
                            <Box component="ul" sx={{ pl: 4, mt: 1, typography: 'body1', lineHeight: 1.8 }}>
                                <li>Надати всі послуги, зазначені в програмі подорожі.</li>
                                <li>Надати вам інформацію про час виїзду, контакти гіда групи та деталі проживання.</li>
                            </Box>
                        </Box>

                        <Divider />

                        <Box id="section-5">
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#222' }}>
                                5. Відповідальність сторін
                            </Typography>
                            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, textAlign: 'justify' }}>
                                5.1. Ми не несемо відповідальності за дії прикордонників або митників. Якщо вас затримають на кордоні або відмовлять у в'їзді, вартість подорожі не повертається, оскільки ми свої зобов'язання виконали.
                            </Typography>
                            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, textAlign: 'justify' }}>
                                5.2. Ми можемо змінювати порядок екскурсій або замінювати готель на рівноцінний чи кращий, якщо це необхідно для збереження якості поїздки.
                            </Typography>
                            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, textAlign: 'justify' }}>
                                5.3. Ніхто не несе відповідальності за непередбачувані обставини. Це можуть бути стихійні лиха, страйки або раптові зміни в законах, які роблять поїздку неможливою.
                            </Typography>
                        </Box>

                    </Stack>

                    <Box sx={{ mt: 8, pt: 4, borderTop: '2px solid #000', textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Цей документ є офіційним. Бронювання місця означає вашу повну згоду з цими правилами.
                        </Typography>
                    </Box>

                </Paper>
            </Container>
        </Box>
    );
};

export default PolicyPage;