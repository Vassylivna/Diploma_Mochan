import React, { useState, useMemo, useEffect } from 'react';
import {
    Box, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, IconButton,
    TextField, Stack, Dialog, DialogTitle, DialogContent,
    DialogActions, InputAdornment, useMediaQuery, useTheme,
    CircularProgress, Snackbar, Alert, Pagination, Tooltip,
    Rating, Card, CardMedia, Avatar, Autocomplete, FormControl
} from '@mui/material';
import {
    Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon,
    ArrowBack as ArrowBackIcon, Search as SearchIcon,
    WarningAmberRounded as WarningIcon, CheckCircle as SuccessIcon,
    ErrorOutline as UnsavedIcon,
    Apartment as HotelIcon,
    CloudUpload as CloudUploadIcon,
    Link as LinkIcon,
    AddPhotoAlternate as AddPhotoIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { useHotelControl } from '../../hooks/useHotelControl';

const ManageHotelsPage: React.FC = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    const {
        hotels, locationsList, loading, page, totalPages, searchTerm,
        isFormOpen, formData, editingId, selectedLocationId,
        confirmDialog, snackbar, uploadingImage, currentImageUrl, fileInputRef,
        
        setIsFormOpen, 

        setPage, setFormData, setConfirmDialog, setSnackbar, setCurrentImageUrl,
        handleSearchChange, handleOpenForm, handleRequestSave, 
        handleRequestDelete, handleConfirmAction, handleRequestCancel,
        handleAddImageUrl, handleFileSelect, handleRemoveImage, handleLocationChange
    } = useHotelControl();

    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

    const uniqueRegions = useMemo(() => {
        const regions = locationsList.map(l => l.regionName).filter(Boolean);
        return Array.from(new Set(regions)).sort();
    }, [locationsList]);

    const filteredCountries = useMemo(() => {
        if (!selectedRegion) return [];
        const countries = locationsList
            .filter(l => l.regionName === selectedRegion)
            .map(l => l.countryName);
        return Array.from(new Set(countries)).sort();
    }, [locationsList, selectedRegion]);

    // 3. Міста для вибраної країни та регіону (camelCase)
    const filteredCities = useMemo(() => {
        if (!selectedRegion || !selectedCountry) return [];
        return locationsList.filter(l => 
            l.regionName === selectedRegion && 
            l.countryName === selectedCountry
        );
    }, [locationsList, selectedRegion, selectedCountry]);

    // 4. Знаходимо повний об'єкт локації для Autocomplete міста
    const currentLocationObject = useMemo(() => {
        return locationsList.find(l => l.locationId === selectedLocationId) || null;
    }, [locationsList, selectedLocationId]);

    // 5. Синхронізація при відкритті форми
    useEffect(() => {
        if (isFormOpen) {
            // camelCase: locationId
            if (selectedLocationId && selectedLocationId !== 0) {
                const loc = locationsList.find(l => l.locationId === selectedLocationId);
                if (loc) {
                    // camelCase: region, countryName
                    setSelectedRegion(loc.regionName);
                    setSelectedCountry(loc.countryName);
                }
            } else {
                // Якщо це створення нового -> очищаємо
                setSelectedRegion(null);
                setSelectedCountry(null);
            }
        }
    }, [isFormOpen]);

    // --- ВАЛІДАЦІЯ ---
    const handleValidateAndSave = () => {
        if (!formData.name.trim() || !formData.description.trim() || !selectedLocationId) {
            setSnackbar({
                open: true,
                message: 'Будь ласка, заповніть назву, опис, оберіть повну локацію та додайте щонайменше одне фото',
                severity: 'error'
            });
            return;
        }

        if (formData.images.length === 0) {
            setSnackbar({
                open: true,
                message: 'Будь ласка, додайте хоча б одне фото.',
                severity: 'error'
            });
            return;
        }

        handleRequestSave();
    };

    // --- STYLES ---
    const UI_STYLE = {
        bg: '#F8FAFC',
        textMain: '#0F172A',
        textSub: '#64748B',
        primary: '#2563EB',
        primaryHover: '#1D4ED8',
        danger: '#EF4444',
        success: '#10B981',
        warning: '#F59E0B',
        shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
        sectionTitle: { fontWeight: 700, fontSize: '1rem', color: '#334155', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 5 }, bgcolor: UI_STYLE.bg, minHeight: '100vh' }}>
            
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 5 }}>
                <Box display="flex" alignItems="center" gap={1}> 
                    <IconButton
                        onClick={() => navigate('/management/tours')} 
                        sx={{ p: 0, mr: 2, color: UI_STYLE.textMain, '&:hover': { bgcolor: 'transparent', opacity: 0.7 } }}
                        disableRipple
                    >
                        <ArrowBackIcon sx={{ fontSize: 32 }} />
                    </IconButton>
                    
                    <Box>
                        <Typography variant="h3" sx={{ fontWeight: 950, color: UI_STYLE.textMain, letterSpacing: '-1.5px' }}>
                            Готелі
                        </Typography>
                        <Typography sx={{ color: UI_STYLE.textSub, fontWeight: 600 }}>
                            Керування базою готелів та їх рейтингом
                        </Typography>
                    </Box>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenForm()}
                    sx={{ 
                        bgcolor: UI_STYLE.primary,
                        borderRadius: '14px', px: 4, py: 1.5, 
                        fontWeight: 800, textTransform: 'uppercase',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                        '&:hover': { bgcolor: UI_STYLE.primaryHover, transform: 'translateY(-1px)' }
                    }}
                >
                    Додати готель
                </Button>
            </Stack>

            {/* Search */}
            <Paper elevation={0} sx={{ p: 2, mb: 4, borderRadius: '16px', bgcolor: '#fff', border: '1px solid #E2E8F0', boxShadow: UI_STYLE.shadow }}>
                <TextField
                    fullWidth
                    variant="standard"
                    placeholder="Пошук готелю за назвою або описом"
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    InputProps={{
                        disableUnderline: true,
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ ml: 1, color: UI_STYLE.primary }} />
                            </InputAdornment>
                        ),
                        sx: { fontWeight: 600, fontSize: '1.1rem' }
                    }}
                />
            </Paper>

            {/* Table */}
            <TableContainer component={Paper} sx={{ borderRadius: '24px', boxShadow: UI_STYLE.shadow, border: 'none', overflow: 'hidden' }}>
                <Table sx={{ minWidth: 900 }}>
                    <TableHead sx={{ bgcolor: '#F1F5F9' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800, color: UI_STYLE.textSub, pl: 4, py: 2, width: '30%' }}>НАЗВА ГОТЕЛЮ</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: UI_STYLE.textSub, width: '20%' }}>ЛОКАЦІЯ</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: UI_STYLE.textSub, width: '15%' }}>ЗІРКИ</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: UI_STYLE.textSub, width: '20%' }}>ОПИС</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800, color: UI_STYLE.textSub, pr: 4, width: '15%' }}>ДІЇ</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody sx={{ bgcolor: '#fff' }}>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : hotels.length > 0 ? (
                            hotels.map((item) => (
                                // camelCase: hotelId
                                <TableRow key={item.hotelId} hover sx={{ '&:hover': { bgcolor: '#F8FAFC !important' } }}>
                                    <TableCell sx={{ pl: 4, py: 2.5 }}>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            {item.images.length > 0 ? (
                                                <Avatar 
                                                    // camelCase: imageUrl
                                                    src={item.images[0].imageUrl} 
                                                    variant="rounded" 
                                                    sx={{ width: 45, height: 45, borderRadius: '10px', border: '1px solid #E2E8F0' }} 
                                                />
                                            ) : (
                                                <Avatar sx={{ bgcolor: '#E0F2FE', color: UI_STYLE.primary, borderRadius: '10px', width: 45, height: 45 }}>
                                                    <HotelIcon fontSize="small" />
                                                </Avatar>
                                            )}
                                            <Typography sx={{ fontWeight: 800, color: UI_STYLE.textMain, fontSize: '1rem' }}>
                                                {item.name}
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={600}>
                                            {/* camelCase: cityName, countryName */}
                                            {item.location?.cityName || 'Не вказано'}, {item.location?.countryName}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Rating value={item.stars} readOnly size="small" />
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title={item.description} placement="top-start" arrow>
                                            <Typography sx={{ 
                                                fontWeight: 500, color: UI_STYLE.textSub, lineHeight: 1.5,
                                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '400px'
                                            }}>
                                                {item.description}
                                            </Typography>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell align="right" sx={{ pr: 4 }}>
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Tooltip title="Редагувати">
                                                <IconButton
                                                    onClick={() => handleOpenForm(item)}
                                                    sx={{ color: UI_STYLE.primary, bgcolor: '#EFF6FF', '&:hover': { bgcolor: '#DBEAFE' } }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Видалити">
                                                <IconButton
                                                    // camelCase: hotelId
                                                    onClick={() => handleRequestDelete(item.hotelId)}
                                                    sx={{ color: UI_STYLE.danger, bgcolor: '#FEF2F2', '&:hover': { bgcolor: '#FEE2E2' } }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                    <Typography color="text.secondary">Готелів не знайдено</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                <Pagination count={totalPages} page={page} onChange={(e, v) => setPage(v)} shape="rounded" color="primary" size="large" />
            </Box>

            {/* --- FORM DIALOG --- */}
            <Dialog 
                open={isFormOpen} 
                onClose={() => handleRequestCancel()}
                fullWidth 
                maxWidth="md"
                PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', pb: 1 }}>
                    {editingId ? 'Редагування готелю' : 'Новий готель'}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        
                        {/* 1. Основна інформація */}
                        <Box>
                            <Typography sx={UI_STYLE.sectionTitle}>Основна інформація</Typography>
                            
                            <Stack spacing={2}>
                                {/* РЯДОК 1: Назва + Зірки */}
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="stretch">
                                    <TextField
                                        label="Назва готелю"
                                        required
                                        fullWidth
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        variant="outlined"
                                        InputProps={{ sx: { borderRadius: 3 } }}
                                    />

                                    {/* ЗІРКИ */}
                                    <Box sx={{ 
                                        display: 'flex', alignItems: 'center', 
                                        border: '1px solid #C4C4C4', borderRadius: 3, 
                                        px: 2, flexShrink: 0, height: '56px'
                                    }}>
                                        <Typography variant="body2" sx={{ mr: 1, color: 'text.secondary', whiteSpace: 'nowrap' }}>Клас:</Typography>
                                        <Rating 
                                            name="hotel-stars"
                                            value={Number(formData.stars)} 
                                            onChange={(event, newValue) => {
                                                if (newValue) setFormData({ ...formData, stars: newValue });
                                            }}
                                            size="medium"
                                        />
                                    </Box>
                                </Stack>
                                
                                {/* РЯДОК 2: ЛОКАЦІЯ */}
                                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                                    
                                    {/* 1. РЕГІОН */}
                                    <Box flex={1}>
                                        <FormControl fullWidth>
                                            <Autocomplete
                                                options={uniqueRegions}
                                                value={selectedRegion}
                                                onChange={(_, newValue) => {
                                                    setSelectedRegion(newValue);
                                                    setSelectedCountry(null); 
                                                    handleLocationChange(0); 
                                                }}
                                                renderInput={(params) => <TextField {...params} label="1. Регіон" placeholder="Оберіть регіон" />}
                                            />
                                        </FormControl>
                                    </Box>

                                    {/* 2. КРАЇНА */}
                                    <Box flex={1}>
                                        <FormControl fullWidth>
                                            <Autocomplete
                                                options={filteredCountries}
                                                value={selectedCountry}
                                                disabled={!selectedRegion}
                                                onChange={(_, newValue) => {
                                                    setSelectedCountry(newValue);
                                                    handleLocationChange(0);
                                                }}
                                                renderInput={(params) => (
                                                    <TextField 
                                                        {...params} 
                                                        label="2. Країна" 
                                                        placeholder="Оберіть країну"
                                                        helperText={!selectedRegion ? "Спочатку оберіть регіон" : ""}
                                                    />
                                                )}
                                            />
                                        </FormControl>
                                    </Box>

                                    {/* 3. МІСТО */}
                                    <Box flex={1}>
                                        <FormControl fullWidth>
                                            <Autocomplete
                                                options={filteredCities}
                                                // camelCase: cityName
                                                getOptionLabel={(option) => option.cityName}
                                                isOptionEqualToValue={(option, value) => option.locationId === value.locationId}
                                                value={currentLocationObject} 
                                                disabled={!selectedCountry}
                                                onChange={(_, newValue) => {
                                                    if (newValue) {
                                                        // camelCase: locationId
                                                        handleLocationChange(newValue.locationId);
                                                    } else {
                                                        handleLocationChange(0);
                                                    }
                                                }}
                                                renderInput={(params) => (
                                                    <TextField 
                                                        {...params} 
                                                        label="3. Місто" 
                                                        required 
                                                        placeholder="Оберіть місто"
                                                        helperText={!selectedCountry ? "Спочатку оберіть країну" : ""}
                                                    />
                                                )}
                                            />
                                        </FormControl>
                                    </Box>
                                </Stack>
                            </Stack>
                        </Box>

                        <TextField
                            label="Опис готелю (зручності, розташування)"
                            required
                            fullWidth
                            multiline
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            variant="outlined"
                            InputProps={{ sx: { borderRadius: 3 } }}
                        />

                        {/* 2. Блок Фотогалереї */}
                        <Box>
                            <Typography sx={UI_STYLE.sectionTitle}>
                                <AddPhotoIcon fontSize="small" sx={{ color: UI_STYLE.primary }} />
                                Фото готелю                                    </Typography>
                            
                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-start">
                                <TextField 
                                    fullWidth
                                    placeholder="Вставте посилання або оберіть файл"
                                    hiddenLabel
                                    variant="outlined"
                                    value={currentImageUrl}
                                    onChange={(e) => setCurrentImageUrl(e.target.value)}
                                    InputProps={{
                                        sx: { borderRadius: 3 },
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LinkIcon color="action" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <input 
                                                    type="file" 
                                                    accept="image/*" 
                                                    hidden 
                                                    ref={fileInputRef} 
                                                    onChange={handleFileSelect} 
                                                />
                                                <Button 
                                                    variant="contained" 
                                                    component="span" 
                                                    size="small" 
                                                    disabled={uploadingImage}
                                                    onClick={() => fileInputRef.current?.click()} 
                                                    startIcon={uploadingImage ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />} 
                                                    sx={{ textTransform: 'none', borderRadius: 2, boxShadow: 'none' }}
                                                >
                                                    {uploadingImage ? 'Завант...' : 'Файл'}
                                                </Button>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                                <Button 
                                    variant="outlined" 
                                    onClick={handleAddImageUrl}
                                    disabled={!currentImageUrl.trim()}
                                    sx={{ height: '56px', borderRadius: 3, px: 3, fontWeight: 700 }}
                                >
                                    Додати
                                </Button>
                            </Stack>

                            {formData.images.length > 0 && (
                                <Box sx={{ mt: 2, p: 2, bgcolor: '#F1F5F9', borderRadius: 3 }}>
                                    <Box sx={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
                                        gap: 2 
                                    }}>
                                        {formData.images.map((imgObj, index) => (
                                            <Card key={index} sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                                <CardMedia
                                                    component="img"
                                                    height="120"
                                                    // В formData images - це масив рядків
                                                    image={typeof imgObj === 'string' ? imgObj : (imgObj as any).image_url}
                                                    alt={`Hotel img ${index}`}
                                                    sx={{ objectFit: 'cover' }}
                                                />
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => handleRemoveImage(index)}
                                                    sx={{ 
                                                        position: 'absolute', top: 5, right: 5, 
                                                        bgcolor: 'rgba(255,255,255,0.9)', 
                                                        '&:hover': { bgcolor: '#fff', color: UI_STYLE.danger } 
                                                    }}
                                                >
                                                    <CloseIcon fontSize="small" />
                                                </IconButton>
                                            </Card>
                                        ))}
                                    </Box>
                                </Box>
                            )}
                            
                            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary', fontWeight: 500 }}>
                                Завантажте фото або додайте посилання на нього
                            </Typography>
                        </Box>

                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => handleRequestCancel()} color="inherit" sx={{ fontWeight: 600, borderRadius: 2 }}>
                        Скасувати
                    </Button>
                    <Button 
                        onClick={handleValidateAndSave} 
                        variant="contained" 
                        disabled={uploadingImage}
                        sx={{ fontWeight: 700, borderRadius: 2, px: 4, py: 1, boxShadow: 'none', bgcolor: UI_STYLE.primary }}
                    >
                        Зберегти
                    </Button>
                </DialogActions>
            </Dialog>

            {/* CONFIRM DIALOG */}
            <Dialog 
                open={confirmDialog.open} 
                onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
                PaperProps={{ sx: { borderRadius: 4, p: 1, maxWidth: 400 } }}
            >
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                    {confirmDialog.type === 'DELETE' && <WarningIcon sx={{ fontSize: 60, color: UI_STYLE.danger, bgcolor: '#FEE2E2', borderRadius: '50%', p: 1 }} />}
                    {confirmDialog.type === 'SAVE' && <SuccessIcon sx={{ fontSize: 60, color: UI_STYLE.success, bgcolor: '#DCFCE7', borderRadius: '50%', p: 1 }} />}
                    {confirmDialog.type === 'CANCEL' && <UnsavedIcon sx={{ fontSize: 60, color: UI_STYLE.warning, bgcolor: '#FEF3C7', borderRadius: '50%', p: 1 }} />}
                </Box>
                
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 800 }}>
                    {confirmDialog.type === 'DELETE' && 'Видалити готель?'}
                    {confirmDialog.type === 'SAVE' && 'Зберегти зміни?'}
                    {confirmDialog.type === 'CANCEL' && 'Скасувати зміни?'}
                </DialogTitle>
                
                <DialogContent>
                    <Typography textAlign="center" color="text.secondary">
                        {confirmDialog.type === 'DELETE' && 'Це безповоротно видалить готель з бази.'}
                        {confirmDialog.type === 'SAVE' && 'Ви перевірили всі дані?'}
                        {confirmDialog.type === 'CANCEL' && 'Незбережені дані будуть втрачені.'}
                    </Typography>
                </DialogContent>
                
                <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
                    <Button 
                        onClick={() => {
                            setConfirmDialog({ ...confirmDialog, open: false });
                            if (confirmDialog.type === 'SAVE') setIsFormOpen(true);
                        }} 
                        color="inherit" 
                        sx={{ fontWeight: 600 }}
                    >
                        Ні, повернутись
                    </Button>
                    <Button 
                        onClick={handleConfirmAction} 
                        variant="contained" 
                        color={confirmDialog.type === 'DELETE' || confirmDialog.type === 'CANCEL' ? 'error' : 'success'}
                        sx={{ borderRadius: 2, fontWeight: 700, px: 3, boxShadow: 'none' }}
                    >
                        {confirmDialog.type === 'DELETE' && 'Видалити'}
                        {confirmDialog.type === 'SAVE' && 'Так, зберегти'}
                        {confirmDialog.type === 'CANCEL' && 'Так, скасувати'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={4000} 
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%', fontWeight: 600, borderRadius: 2 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

        </Box>
    );
};

export default ManageHotelsPage;