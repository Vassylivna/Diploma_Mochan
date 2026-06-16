import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack,
    Typography, Divider, Box, Alert, IconButton, InputAdornment, Paper,
    Checkbox, FormControlLabel, Link
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'; 
import PhoneIcon from '@mui/icons-material/Phone';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import StarIcon from '@mui/icons-material/Star';

import { TourDetails } from '../types/tour.types';
import { BookingService } from '../services/BookingService';
import { useBookingForm } from '../hooks/useBookingForm';

interface FormPageProps {
    open: boolean;
    onClose: () => void;
    tour: TourDetails;
}

const fieldStyles = {
    '& .MuiOutlinedInput-root': {
        fontSize: "1rem", color: "#333", borderRadius: "10px", height: "50px", backgroundColor: "rgba(0, 0, 0, 0.04)", 
        '& fieldset': { borderColor: 'rgba(0,0,0,0.1)' },
        '&.Mui-disabled': {
            backgroundColor: "rgba(0, 0, 0, 0.08)",
            '& .MuiInputBase-input': { color: "#555", WebkitTextFillColor: "#555" }
        },
    },
    '& .MuiInputBase-input': { padding: "12px 14px", height: "auto" },
    '& .MuiInputAdornment-root .MuiTypography-root': { color: '#555', fontWeight: 400 }
};

const FormPage: React.FC<FormPageProps> = ({ open, onClose, tour }) => {
    const {
        firstName, setFirstName, lastName, setLastName, middleName, setMiddleName,
        phone, email, passengers,
        errors, isSuccess, orderNumber, bookingResultType,
        dialogs,
        totals, remainingSeats, canAddPassenger, isUserAdult, isSoldOut,
        handleSubmitClick, handleCancelClick, handleConfirmAction, handleAdminWarningConfirm
    } = useBookingForm(open, tour, onClose);

    const { confirmDialog, setConfirmDialog, adminWarningDialog, setAdminWarningDialog } = dialogs;
    const { adults, setAdults, children, setChildren, teens, setTeens } = passengers;

    const [isPolicyAccepted, setIsPolicyAccepted] = useState(false);

    useEffect(() => {
        if (!open) {
            setIsPolicyAccepted(false);
        }
    }, [open]);

    const basePrice = Number(tour.price);
    const discountPercent = 20;

    const formatDate = (date: string | Date) => 
        new Date(date).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });

    return (
        <>
            <Dialog 
                open={open} 
                onClose={(event, reason) => { if (reason !== 'backdropClick') handleCancelClick(); }}
                maxWidth="md" fullWidth scroll="body" PaperProps={{ sx: { borderRadius: 4, p: 0 } }}
            >
                {!isSuccess ? (
                    <>
                        <DialogTitle sx={{ fontWeight: 800, textAlign: 'center', fontSize: '1.5rem', color: 'primary.dark', pt: 3, pb: 1 }}>
                            Оформлення подорожі
                        </DialogTitle>

                        <DialogContent sx={{ px: { xs: 2, md: 4 }, pb: 3, overflowY: 'visible' }}>
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mt: 0 }}>
                                
                                <Box sx={{ flex: '0 0 40%', bgcolor: '#F8F9FA', p: 2.5, borderRadius: 3, border: '1px solid', borderColor: '#EEEEEE', height: 'fit-content' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.2, fontSize: '1.1rem' }}>{tour.title}</Typography>
                                    
                                    <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600, mb: 1.5 }}>
                                        {formatDate(tour.startDate)} — {formatDate(tour.endDate)}
                                    </Typography>
                                    
                                    <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', textAlign: 'justify', fontSize: '0.85rem' }}>{tour.description.length > 150 ? tour.description.substring(0, 150) + '...' : tour.description}</Typography>
                                    <Divider sx={{ my: 1.5 }} />
                                    <Stack spacing={1}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" color="text.secondary">Тип готелю:</Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                {tour.stops && tour.stops.length > 0 && tour.stops[0].hotel ? (
                                                    <>
                                                        <Box sx={{ display: 'flex', ml: 0.5 }}>
                                                            {[...Array(Number(tour.stops[0].hotel.stars || 0))].map((_, index) => (
                                                                <StarIcon key={index} sx={{ color: '#FFB400', fontSize: 16 }} />
                                                            ))}
                                                        </Box>
                                                    </>
                                                ) : (
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Не вказано</Typography>
                                                )}
                                            </Box>
                                        </Box>

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="text.secondary">Основний транспорт:</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{tour.transport?.transportName}</Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="text.secondary">Дорослий (18+):</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{basePrice} грн</Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="text.secondary">Підліток (13-17):</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{totals.teenPrice} грн</Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="success.main">Дитячий (0-12):</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>{totals.childPrice.toFixed(0)} грн</Typography>
                                        </Box>

                                        <Typography variant="caption" sx={{ color: 'text.disabled', mt: 0.5, display: 'block', fontSize: '0.7rem' }}>
                                            * Дитячий квиток зі знижкою {discountPercent}%
                                        </Typography>
                                    </Stack>
                                </Box>

                                <Box sx={{ flex: 1 }}>
                                    <Box sx={{ mb: 2 }}><Typography variant="button" sx={{ fontWeight: 700, color: 'text.disabled', display: 'block', mb: 1 }}>Персональні дані</Typography></Box>
                                    <Stack spacing={2}>
                                        <Stack direction="row" spacing={2}>
                                            <TextField placeholder="Прізвище" fullWidth size="small" disabled={isSoldOut} onChange={(e) => setLastName(e.target.value)} sx={fieldStyles} value={lastName} error={!!errors.lastName} helperText={errors.lastName} />
                                            <TextField placeholder="Ім'я" fullWidth size="small" disabled={isSoldOut} onChange={(e) => setFirstName(e.target.value)} sx={fieldStyles} value={firstName} error={!!errors.firstName} helperText={errors.firstName} />
                                        </Stack>
                                        <Stack direction="row" spacing={2}>
                                            <TextField placeholder="По батькові" fullWidth size="small" disabled={isSoldOut} onChange={(e) => setMiddleName(e.target.value)} sx={fieldStyles} value={middleName} error={!!errors.middleName} helperText={errors.middleName} />
                                            <TextField placeholder="XX-XXX-XX-XX" fullWidth size="small" value={phone} disabled error={!!errors.phone} helperText={errors.phone} sx={{ ...fieldStyles, '& .MuiInputBase-input': { padding: "12px 14px 12px 8px", height: "auto" } }} InputProps={{ startAdornment: (<InputAdornment position="start" sx={{ mr: 0 }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}><Typography sx={{ color: '#555', fontWeight: 400, fontSize: "1rem", lineHeight: "1.4375em" }}>+380</Typography><Box sx={{ width: '1px', height: '18px', backgroundColor: '#ccc', display: 'block' }} /></Box></InputAdornment>), }} />
                                        </Stack>
                                        <TextField placeholder="Email" fullWidth size="small" disabled sx={fieldStyles} value={email} error={!!errors.email} helperText={errors.email} />

                                        <Box sx={{ p: 1.5, border: '1px solid', borderColor: '#E0E0E0', borderRadius: 3, bgcolor: '#fff' }}>
                                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mb: 1, display: 'block' }}>ПАСАЖИРИ (ВІЛЬНО: {Math.max(0, remainingSeats)})</Typography>
                                            <Stack spacing={1}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                    <Typography variant="body2" sx={{fontSize: '0.9rem', fontWeight: 500}}>Дорослі (18+)</Typography>
                                                    <Stack direction="row" alignItems="center" sx={{ bgcolor: '#F5F5F5', borderRadius: 2, height: 32 }}>
                                                        <IconButton size="small" onClick={() => setAdults(Math.max(1, adults - 1))} disabled={isSoldOut || adults <= 1}><RemoveIcon fontSize="small" /></IconButton>
                                                        <Typography sx={{ width: 24, textAlign: 'center', fontWeight: 700, fontSize: '0.9rem' }}>{adults}</Typography>
                                                        <IconButton size="small" onClick={() => setAdults(adults + 1)} disabled={isSoldOut || !canAddPassenger}><AddIcon fontSize="small" /></IconButton>
                                                    </Stack>
                                                </Stack>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                    <Typography variant="body2" sx={{fontSize: '0.9rem', fontWeight: 500}}>Підлітки (13-17 р.)</Typography>
                                                    <Stack direction="row" alignItems="center" sx={{ bgcolor: '#F5F5F5', borderRadius: 2, height: 32 }}>
                                                        <IconButton size="small" onClick={() => setTeens(Math.max(0, teens - 1))} disabled={isSoldOut || teens <= 0}><RemoveIcon fontSize="small" /></IconButton>
                                                        <Typography sx={{ width: 24, textAlign: 'center', fontWeight: 700, fontSize: '0.9rem' }}>{teens}</Typography>
                                                        <IconButton size="small" onClick={() => setTeens(teens + 1)} disabled={isSoldOut || !canAddPassenger}><AddIcon fontSize="small" /></IconButton>
                                                    </Stack>
                                                </Stack>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                    <Typography variant="body2" sx={{fontSize: '0.9rem', fontWeight: 500}}>Діти (0-12 р.)</Typography>
                                                    <Stack direction="row" alignItems="center" sx={{ bgcolor: '#F5F5F5', borderRadius: 2, height: 32 }}>
                                                        <IconButton size="small" onClick={() => setChildren(Math.max(0, children - 1))} disabled={isSoldOut || children <= 0}><RemoveIcon fontSize="small" /></IconButton>
                                                        <Typography sx={{ width: 24, textAlign: 'center', fontWeight: 700, fontSize: '0.9rem' }}>{children}</Typography>
                                                        <IconButton size="small" onClick={() => setChildren(children + 1)} disabled={isSoldOut || !canAddPassenger}><AddIcon fontSize="small" /></IconButton>
                                                    </Stack>
                                                </Stack>
                                            </Stack>
                                        </Box>
                                        
                                        {errors.seats && <Alert severity="error" variant="filled" sx={{py: 0, borderRadius: 2}}>{errors.seats}</Alert>}
                                        <Box sx={{ p: 1.5, bgcolor: '#1976D2', borderRadius: 3, textAlign: 'center', color: 'white', boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)' }}>
                                            <Typography variant="subtitle2" sx={{ opacity: 0.8, fontSize: '0.75rem', letterSpacing: 1 }}>ДО СПЛАТИ</Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 800 }}>{totals.totalPrice.toFixed(0)} грн</Typography>
                                        </Box>
                                    </Stack>
                                </Box>
                            </Box>
                        </DialogContent>

                        <DialogActions sx={{ p: 2, px: 4, bgcolor: '#FAFAFA', borderTop: '1px solid', borderColor: '#F0F0F0', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ flexGrow: 1, maxWidth: '60%' }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox 
                                            checked={isPolicyAccepted}
                                            onChange={(e) => setIsPolicyAccepted(e.target.checked)}
                                            size="small"
                                            sx={{ '&.Mui-checked': { color: 'primary.main' } }}
                                        />
                                    }
                                    label={
                                        <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.2, display: 'block' }}>
                                            Я погоджуюсь з <Link component={RouterLink} to="/policy" target="_blank" underline="hover" sx={{ color: 'primary.main', fontWeight: 600 }}>політикою компанії та правилами повернення коштів</Link>
                                        </Typography>
                                    }
                                    sx={{ mr: 0, alignItems: 'center' }}
                                />
                            </Box>

                            <Stack direction="row" spacing={2}>
                                <Button onClick={handleCancelClick} color="inherit" sx={{ fontWeight: 600, color: 'text.secondary' }}>Скасувати</Button>
                                <Button 
                                    onClick={handleSubmitClick} 
                                    variant="contained" 
                                    disabled={!isPolicyAccepted || isSoldOut || remainingSeats < 0 || !isUserAdult} 
                                    sx={{ px: 4, borderRadius: 3, fontWeight: 700, boxShadow: 'none' }}
                                >
                                    Підтвердити
                                </Button>
                            </Stack>
                        </DialogActions>
                    </>
                ) : (
                    <Box sx={{ py: 6, px: 4, textAlign: 'center', maxWidth: 450, mx: 'auto' }}>
                        {bookingResultType === 'NORMAL' ? (
                            <>
                                <Box sx={{ display: 'inline-flex', p: 2, borderRadius: '50%', bgcolor: '#E8F5E9', mb: 2 }}><CheckCircleOutlineIcon sx={{ fontSize: 60, color: '#2E7D32' }} /></Box>
                                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#1B5E20' }}>Замовлення прийнято!</Typography>
                                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>Дякуємо, <b>{firstName}</b>! Тур успішно заброньовано.<br/>Для перегляду деталей та оплати, будь ласка, перейдіть у розділ <b>"Мої тури"</b>.</Typography>
                                <Paper elevation={0} sx={{ bgcolor: '#F5F5F5', p: 2, borderRadius: 3, mb: 3 }}>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase' }}>Код замовлення</Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976D2', letterSpacing: 1 }}>{orderNumber}</Typography>
                                </Paper>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, bgcolor: '#FFF3E0', color: '#E65100', p: 1.5, borderRadius: 3, mb: 4 }}>
                                    <AccessTimeIcon fontSize="small" /><Typography variant="body2" sx={{ fontWeight: 700 }}>У вас є 2 години на оплату</Typography>
                                </Box>
                            </>
                        ) : (
                            <>
                                <Box sx={{ display: 'inline-flex', p: 2, borderRadius: '50%', bgcolor: '#FFF8E1', mb: 2 }}><HourglassEmptyIcon sx={{ fontSize: 60, color: '#F57C00' }} /></Box>
                                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#E65100' }}>Очікує підтвердження</Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>Ваше замовлення потребує перевірки адміністратором.</Typography>
                                <Paper elevation={0} sx={{ bgcolor: '#FFF3E0', p: 2, borderRadius: 3, mb: 3 }}>
                                    <Typography variant="caption" sx={{ color: '#E65100', textTransform: 'uppercase' }}>Код замовлення</Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#E65100', letterSpacing: 1 }}>{orderNumber}</Typography>
                                </Paper>
                                <Alert severity="warning" variant="outlined" sx={{ mb: 4, textAlign: 'left', borderRadius: 3 }}>
                                    <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Важливо:</Typography>
                                    <Typography variant="body2" sx={{ fontSize: '0.9rem', lineHeight: 1.4 }}>Після того як адміністратор підтвердить замовлення, у Вас буде <b>2 години на оплату</b>. В іншому випадку бронювання буде автоматично скасовано, а місця звільняться. Для повторного придбання необхідно буде створити нове бронювання.</Typography>
                                </Alert>
                            </>
                        )}
                        <Button fullWidth variant="contained" size="large" onClick={onClose} sx={{ borderRadius: 3, fontWeight: 700, py: 1.5 }}>Зрозуміло, дякую</Button>
                    </Box>
                )}
            </Dialog>

            <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ ...confirmDialog, open: false })} PaperProps={{ sx: { borderRadius: 4, p: 2, width: '100%', maxWidth: 400 } }}>
                <Box sx={{ textAlign: 'center', mt: 1 }}>{confirmDialog.type === 'submit' ? <HelpOutlineIcon color="primary" sx={{ fontSize: 60, color: '#1976D2', bgcolor: '#E3F2FD', borderRadius: '50%', p: 1 }} /> : <ErrorOutlineIcon color="error" sx={{ fontSize: 60, color: '#D32F2F', bgcolor: '#FFEBEE', borderRadius: '50%', p: 1 }} />}</Box>
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 800, fontSize: '1.4rem', pt: 2 }}>{confirmDialog.type === 'submit' ? 'Підтвердити замовлення?' : 'Скасувати введення?'}</DialogTitle>
                <DialogContent><Typography textAlign="center" color="text.secondary">{confirmDialog.type === 'submit' ? 'Перевірте параметри подорожі. Ваші персональні дані будуть використані для оформлення.' : 'Всі введені дані будуть втрачені. Ви дійсно хочете закрити форму?'}</Typography></DialogContent>
                <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 2 }}>
                    <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })} color="inherit" variant="text" sx={{ borderRadius: 2, fontWeight: 600, color: 'text.secondary' }}>Ні, повернутись</Button>
                    <Button onClick={handleConfirmAction} variant="contained" color={confirmDialog.type === 'submit' ? 'primary' : 'error'} sx={{ borderRadius: 2, fontWeight: 700, px: 4, boxShadow: 'none' }}>Так, {confirmDialog.type === 'submit' ? 'оформити' : 'скасувати'}</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={adminWarningDialog.open} onClose={() => setAdminWarningDialog({ ...adminWarningDialog, open: false })} PaperProps={{ sx: { borderRadius: 4, p: 2, width: '100%', maxWidth: 450 } }}>
                <Box sx={{ textAlign: 'center', mt: 1 }}><WarningAmberIcon sx={{ fontSize: 60, color: '#ED6C02', bgcolor: '#FFF3E0', borderRadius: '50%', p: 1 }} /></Box>
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 800, fontSize: '1.4rem', pt: 2, color: '#E65100' }}>Потрібне узгодження</DialogTitle>
                <DialogContent>
                    <Typography textAlign="center" color="text.secondary" sx={{ mb: 3 }}>{BookingService.getWarningText(adminWarningDialog.reason)}</Typography>
                    <Typography textAlign="center" fontSize="0.9rem" fontWeight={500} sx={{ mb: 2 }}>Замовлення буде створено зі статусом <Box component="span" sx={{ color: '#E65100', fontWeight: 700 }}>"Очікує підтвердження"</Box>.</Typography>
                    <Paper elevation={0} sx={{ bgcolor: '#F5F5F5', p: 2, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}><Box sx={{ bgcolor: '#fff', p: 1, borderRadius: '50%' }}><PhoneIcon color="action" /></Box><Box><Typography variant="caption" color="text.secondary">Контакт адміністратора</Typography><Typography variant="subtitle1" fontWeight={700}>+380 99 123 45 67</Typography></Box></Paper>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 2 }}>
                    <Button onClick={() => setAdminWarningDialog({ ...adminWarningDialog, open: false })} color="inherit" sx={{ fontWeight: 600 }}>Назад</Button>
                    <Button onClick={handleAdminWarningConfirm} variant="contained" sx={{ fontWeight: 700, bgcolor: '#ED6C02', '&:hover': { bgcolor: '#E65100' }, borderRadius: 2, boxShadow: 'none' }}>Зрозуміло, створити</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default FormPage;