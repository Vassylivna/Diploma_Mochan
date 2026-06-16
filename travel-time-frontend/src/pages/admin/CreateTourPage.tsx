import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box, Button, Paper, Typography, TextField, Stack,
    InputAdornment, IconButton,
    Dialog, DialogTitle, DialogActions,
    CircularProgress, Snackbar, Alert, Stepper, Step, StepLabel,
    Chip, Divider, Avatar, Autocomplete, Card, CardMedia
} from "@mui/material";
import {
    ArrowBack as ArrowBackIcon,
    Save as SaveIcon,
    Add as AddIcon,
    DeleteOutline as DeleteIcon,
    CloudUpload as CloudUploadIcon,
    NavigateNext as NextIcon,
    NavigateBefore as BackIcon,
    Map as MapIcon,
    Star as StarIcon,
    Link as LinkIcon,
    Person as PersonIcon,
    Place as PlaceIcon,
    DirectionsBus as BusIcon
} from "@mui/icons-material";

import { useCreateTour } from "../../hooks/useCreateTour";

const STEPS = ['Загальне', 'Логістика', 'Програма', 'Деталі', 'Медіа'];

const getDaysString = (count: number) => {
    if (count % 10 === 1 && count % 100 !== 11) return "день";
    if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return "дні";
    return "днів";
};

const noAutofillStyle = {
    '& .MuiInputBase-input:-webkit-autofill': {
        '-webkit-box-shadow': '0 0 0 100px #fff inset',
        '-webkit-text-fill-color': '#000',
    }
};

const checkIsGuideBusy = (guideId: number, newStartStr: string, newEndStr: string, existingTours: any[]): boolean => {
    if (!newStartStr || !newEndStr || !existingTours) return false;
    const newStart = new Date(newStartStr).getTime();
    const newEnd = new Date(newEndStr).getTime();

    return existingTours.some(tour => {
        const tourGuideId = tour.guide ? tour.guide.userId : null;
        if (String(tourGuideId) !== String(guideId)) return false;
        
        const tourStart = new Date(tour.startDate).getTime();
        const tourEnd = new Date(tour.endDate).getTime();
        return (newStart <= tourEnd && newEnd >= tourStart);
    });
};

const CreateTourPage: React.FC = () => {
    const navigate = useNavigate();
    const {
        locations, transports, hotels, guides, existingTours,
        formData, setFormData, 
        routeSteps, activeStep,
        isLoading, isSaving, isDirty, errors, setErrors, 
        snackbar,
        handleChange, handleListChange, addListItem, removeListItem,
        addStop, removeStop, updateStop,
        
        mainImageUrl, handleMainUrlChange, handleMainFileSelect, getMainPreview,
        galleryItems, handleGallerySelect, handleAddGalleryUrl, removeGalleryItem,
        galleryUrlInput, setGalleryUrlInput,

        handleEventChange, addEvent, removeEvent,
        handleNext, handleBack, preventInvalidNumberInput,
        confirmSaveOpen, setConfirmSaveOpen, handleConfirmSave,
        setConfirmExitOpen, confirmExitOpen, setSnackbar,
        currentDateTime, isUpdate, handlePreSaveCheck
    } = useCreateTour();

    const [stopsMeta, setStopsMeta] = useState<{ [key: number]: { region: string | null, country: string | null } }>({});
    const [startLocationMeta, setStartLocationMeta] = useState<{ region: string | null, country: string | null }>({ region: null, country: null });
    const [validationAttempted, setValidationAttempted] = useState(false);

    const clearError = (fieldName: string) => {
        if (errors[fieldName]) {
            setErrors((prev: any) => ({ ...prev, [fieldName]: null }));
        }
    };

    useEffect(() => {
        setValidationAttempted(false);
    }, [activeStep]);

    useEffect(() => {
        if (formData.startLocation) {
            setStartLocationMeta(prev => {
                if (prev.region !== formData.startLocation!.regionName || prev.country !== formData.startLocation!.countryName) {
                    return { region: formData.startLocation!.regionName, country: formData.startLocation!.countryName };
                }
                return prev;
            });
        }

        const newStopsMeta = { ...stopsMeta };
        let hasChanges = false;

        formData.stops.forEach((stop, index) => {
            if (stop.location) {
                const currentMeta = newStopsMeta[index];
                if (!currentMeta || currentMeta.region !== stop.location.regionName || currentMeta.country !== stop.location.countryName) {
                    newStopsMeta[index] = {
                        region: stop.location.regionName,
                        country: stop.location.countryName
                    };
                    hasChanges = true;
                }
            }
        });

        if (hasChanges) setStopsMeta(newStopsMeta);
    }, [formData.stops, formData.startLocation]);

    const guidesWithStatus = useMemo(() => {
        if (!guides) return [];
        const uniqueGuides = guides.filter((g, index, self) => 
            index === self.findIndex((t) => t.userId === g.userId)
        );
        const processed = uniqueGuides.map(guide => ({
            ...guide,
            is_busy: checkIsGuideBusy(Number(guide.userId), formData.startDate, formData.endDate, existingTours)
        }));
        return processed.filter(g => !g.is_busy || String(g.userId) === String(formData.guideId));
    }, [guides, formData.startDate, formData.endDate, existingTours, formData.guideId]);

    const uniqueRegions = useMemo(() => {
        const regions = locations.map(l => l.regionName).filter(Boolean);
        return Array.from(new Set(regions)).sort();
    }, [locations]);

    const getCountriesByRegion = (regionName: string | null) => {
        if (!regionName) return [];
        const countries = locations.filter(l => l.regionName === regionName).map(l => l.countryName);
        return Array.from(new Set(countries)).sort();
    };

    const getCitiesByRegionAndCountry = (region: string | null, country: string | null) => {
        let filtered = locations;
        if (region) filtered = filtered.filter(l => l.regionName === region);
        if (country) filtered = filtered.filter(l => l.countryName === country);
        return filtered;
    };

    const hasAtLeastOneHotel = useMemo(() => {
        return formData.stops.some(s => s.hotel !== null);
    }, [formData.stops]);

    const handleRemoveStopSafe = (indexToRemove: number) => {
        setStopsMeta(prev => {
            const newMeta: any = {};
            Object.keys(prev).forEach(key => {
                const keyNum = Number(key);
                if (keyNum < indexToRemove) { newMeta[keyNum] = prev[keyNum]; } 
                else if (keyNum > indexToRemove) { newMeta[keyNum - 1] = prev[keyNum]; }
            });
            return newMeta;
        });
        removeStop(indexToRemove);
    };

    const handleNextWithValidation = () => {
        setValidationAttempted(true);
        handleNext();
    };

    const handleSaveWithValidation = () => {
        setValidationAttempted(true);
        handlePreSaveCheck();
    };

    const onFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        handleChange(e);
        clearError(e.target.name);
    };

    if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Stack spacing={3}>
                        <TextField required label="Назва туру" name="title" value={formData.title} onChange={onFieldChange} fullWidth error={!!errors.title} helperText={errors.title} />
                        <TextField required multiline rows={3} label="Короткий опис" name="description" value={formData.description} onChange={onFieldChange} fullWidth error={!!errors.description} />
                        
                        <Divider textAlign="left"><Chip label="Дати та Гід" /></Divider>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                            <Box flex={1}>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary" gutterBottom display="block">ДАТА ТА ЧАС ВИЇЗДУ</Typography>
                                <TextField name="startDate" type="datetime-local" value={formData.startDate} onChange={onFieldChange} fullWidth error={!!errors.startDate} helperText={errors.startDate} inputProps={{ min: currentDateTime }} variant="outlined" sx={{ bgcolor: '#fff' }} />
                            </Box>
                            <Box flex={1}>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary" gutterBottom display="block">ДАТА ТА ЧАС ПОВЕРНЕННЯ</Typography>
                                <TextField name="endDate" type="datetime-local" value={formData.endDate} onChange={onFieldChange} fullWidth error={!!errors.endDate} helperText={errors.endDate} disabled={!formData.startDate} inputProps={{ min: formData.startDate || currentDateTime }} variant="outlined" sx={{ bgcolor: '#fff' }} />
                            </Box>
                        </Stack>

                        <Box>
                            <Typography variant="caption" fontWeight="bold" color="text.secondary" gutterBottom display="block">ОБЕРІТЬ ГІДА</Typography>
                            <Autocomplete
                                options={guidesWithStatus}
                                getOptionLabel={(option) => `${option.lastName} ${option.firstName} ${option.middleName || ''}`.trim()}
                                value={guidesWithStatus.find((g) => String(g.userId) === String(formData.guideId)) || null}
                                onChange={(_, newValue) => {
                                    handleChange({ target: { name: 'guideId', value: newValue ? newValue.userId : '' } } as any);
                                    clearError('guideId');
                                }}
                                isOptionEqualToValue={(option, value) => String(option.userId) === String(value.userId)}
                                disabled={!formData.startDate || !formData.endDate}
                                noOptionsText={(!formData.startDate || !formData.endDate) ? "Спочатку оберіть дати" : "Немає вільних гідів"}
                                renderInput={(params) => (
                                    <TextField {...params} required label={formData.startDate && formData.endDate ? "Гід (тільки вільні)" : "Спочатку оберіть дати туру"} error={!!errors.guideId} helperText={errors.guideId} InputProps={{ ...params.InputProps, startAdornment: (<><InputAdornment position="start"><PersonIcon color="action" /></InputAdornment>{params.InputProps.startAdornment}</>) }} />
                                )}
                                renderOption={(props, option) => (
                                    <li {...props} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                            <Stack direction="row" alignItems="center" spacing={2} width="100%" py={0.5}>
                                                <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.light', fontSize: 14 }}>{option.firstName[0]}{option.lastName[0]}</Avatar>
                                                <Box flex={1}>
                                                    <Typography variant="body1" fontWeight={600} lineHeight={1.2}>{option.lastName} {option.firstName} {option.middleName || ''}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{option.phoneNumber || "Телефон не вказано"}</Typography>
                                                </Box>
                                            </Stack>
                                    </li>
                                )}
                            />
                        </Box>

                        <Divider textAlign="left"><Chip label="Ціна та Місця" /></Divider>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                            <Box flex={1}>
                                <TextField required label="Ціна" name="price" type="number" value={formData.price} onChange={onFieldChange} onKeyDown={preventInvalidNumberInput} fullWidth InputProps={{ startAdornment: <InputAdornment position="start">₴</InputAdornment>, inputProps: { min: 1 } }} error={!!errors.price} helperText={errors.price} />
                            </Box>
                            <Box flex={1}>
                                <TextField required label="Місць" name="totalSeats" type="number" value={formData.totalSeats} onChange={onFieldChange} onKeyDown={preventInvalidNumberInput} fullWidth InputProps={{ inputProps: { min: 1 } }} error={!!errors.totalSeats} helperText={errors.totalSeats} />
                            </Box>
                        </Stack>
                    </Stack>
                );

            case 1:
                const startRegion = formData.startLocation?.regionName || startLocationMeta.region || null;
                const startCountry = formData.startLocation?.countryName || startLocationMeta.country || null;
                const startCities = getCitiesByRegionAndCountry(startRegion, startCountry);
                const isStartLocationError = !!errors.startLocation;

                return (
                    <Stack spacing={4}>
                        <Box>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><BusIcon color="primary"/> Транспорт та Початок</Typography>
                            <Box sx={{ maxWidth: '500px', mb: 3 }}>
                                <Autocomplete
                                    options={transports}
                                    getOptionLabel={(option) => `${option.transportName} (${option.transportNumber})`}
                                    value={transports.find(t => String(t.transportId) === String(formData.transportId)) || null}
                                    onChange={(_, newValue) => {
                                        handleChange({ target: { name: 'transportId', value: newValue ? String(newValue.transportId) : '' } } as any);
                                        clearError('transportId');
                                    }}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Основний транспорт" required error={!!errors.transportId} helperText={errors.transportId} />
                                    )}
                                />
                            </Box>
                            
                            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 2, border: isStartLocationError ? '1px solid #d32f2f' : '1px solid #e0e0e0' }}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom color={isStartLocationError ? "error" : "textPrimary"}>Місце збору</Typography>
                                <Stack spacing={2}>
                                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                                            <Box flex={1}>
                                                <Autocomplete
                                                    options={uniqueRegions}
                                                    value={startRegion}
                                                    onChange={(_, v) => {
                                                        setStartLocationMeta({ region: v, country: null });
                                                        if(formData.startLocation && formData.startLocation.regionName !== v) setFormData(p => ({...p, startLocation: null}));
                                                    }}
                                                    renderInput={(p) => <TextField {...p} label="Регіон" size="small" error={isStartLocationError && !startRegion} />}
                                                />
                                            </Box>
                                            <Box flex={1}>
                                                <Autocomplete
                                                    options={getCountriesByRegion(startRegion)}
                                                    value={startCountry}
                                                    disabled={!startRegion && !formData.startLocation}
                                                    onChange={(_, v) => {
                                                        setStartLocationMeta(prev => ({ ...prev, country: v }));
                                                        if(formData.startLocation && formData.startLocation.countryName !== v) setFormData(p => ({...p, startLocation: null}));
                                                    }}
                                                    renderInput={(p) => <TextField {...p} label="Країна" size="small" error={isStartLocationError && !startCountry} helperText={!startRegion ? "Спочатку оберіть регіон" : ""} />}
                                                />
                                            </Box>
                                    </Stack>
                                    <Autocomplete
                                        options={startCities}
                                        getOptionLabel={(o) => o.cityName}
                                        isOptionEqualToValue={(o, v) => o.locationId === v.locationId}
                                        value={formData.startLocation}
                                        disabled={!startCountry && !formData.startLocation}
                                        onChange={(_, v) => {
                                            setFormData(p => ({ ...p, startLocation: v, startLocationId: v?.locationId || 0 }));
                                            if (v) setStartLocationMeta({ region: v.regionName, country: v.countryName });
                                            clearError('startLocation');
                                        }}
                                        renderInput={(p) => <TextField {...p} label="Місто збору" required error={!!errors.startLocation} helperText={errors.startLocation || (!startCountry ? "Спочатку оберіть країну" : "")} />}
                                    />
                                    <TextField label="Точна адреса посадки" name="startAddress" value={formData.startAddress} onChange={onFieldChange} fullWidth required error={!!errors.startAddress} />
                                </Stack>
                            </Paper>
                        </Box>
                        
                        <Divider />
                        
                        <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                <Box>
                                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><PlaceIcon color="error"/> Маршрут та Проживання</Typography>
                                </Box>
                                <Button startIcon={<AddIcon />} onClick={addStop} variant="contained" size="small" sx={{ borderRadius: 2 }}>Додати локацію</Button>
                            </Stack>
                            
                            {errors.stops ? (
                                <Alert severity="error" sx={{ mb: 2 }}>{errors.stops}</Alert>
                            ) : !hasAtLeastOneHotel && (
                                <Alert severity="warning" sx={{ mb: 2 }}>Увага: Необхідно обрати хоча б один готель для всього туру!</Alert>
                            )}
                            
                            <Stack spacing={3}>
                                {formData.stops.map((stop, index) => {
                                    const savedLocation = stop.location;
                                    const savedHotel = stop.hotel;
                                    const meta = stopsMeta[index] || { region: null, country: null };
                                    const currentRegion = savedLocation?.regionName || meta.region || null;
                                    const currentCountry = savedLocation?.countryName || meta.country || null;
                                    
                                    const availableCountries = getCountriesByRegion(currentRegion);
                                    const availableCities = getCitiesByRegionAndCountry(currentRegion, currentCountry);
                                    const hotelsForCity = hotels.filter(h => savedLocation && h.location && h.location.locationId === savedLocation.locationId);
                                    
                                    const locationError = !!errors[`stop_loc_${index}`];

                                    return (
                                        <Paper key={index} elevation={2} sx={{ p: 3, bgcolor: '#fff', position: 'relative', borderRadius: 3, borderLeft: '6px solid #1976d2', border: locationError ? '1px solid #d32f2f' : undefined }}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                                <Typography variant="subtitle1" fontWeight={800} color={locationError ? "error" : "primary"}>Локація #{index + 1}</Typography>
                                                <IconButton size="small" onClick={() => handleRemoveStopSafe(index)} color="error" sx={{ bgcolor: '#ffebee' }}><DeleteIcon /></IconButton>
                                            </Stack>
                                            <Stack spacing={2}>
                                                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                                                    <Box flex={1}>
                                                        <Autocomplete 
                                                            options={uniqueRegions} 
                                                            value={currentRegion} 
                                                            onChange={(_, newValue) => { 
                                                                setStopsMeta(prev => ({ ...prev, [index]: { region: newValue, country: null } })); 
                                                                if (savedLocation && savedLocation.regionName !== newValue) { updateStop(index, 'location', null); } 
                                                            }} 
                                                            renderInput={(params) => <TextField {...params} label="1. Регіон" placeholder="Оберіть регіон" error={locationError && !currentRegion} />} 
                                                        />
                                                    </Box>
                                                    <Box flex={1}>
                                                        <Autocomplete 
                                                            options={availableCountries} 
                                                            value={currentCountry} 
                                                            disabled={!currentRegion && !savedLocation} 
                                                            onChange={(_, newValue) => { 
                                                                setStopsMeta(prev => ({ ...prev, [index]: { ...prev[index], country: newValue } })); 
                                                                if (savedLocation && savedLocation.countryName !== newValue) { updateStop(index, 'location', null); } 
                                                            }} 
                                                            renderInput={(params) => <TextField {...params} label="2. Країна" placeholder="Оберіть країну" error={locationError && !currentCountry} helperText={!currentRegion ? "Спочатку оберіть регіон" : ""} />} 
                                                        />
                                                    </Box>
                                                </Stack>
                                                <Autocomplete 
                                                    options={availableCities} 
                                                    getOptionLabel={(o) => o.cityName || ""} 
                                                    isOptionEqualToValue={(o, v) => o.locationId === v.locationId} 
                                                    value={savedLocation} 
                                                    disabled={!currentCountry && !savedLocation} 
                                                    onChange={(_, newValue) => { 
                                                        updateStop(index, 'location', newValue); 
                                                        if (newValue) { 
                                                            setStopsMeta(prev => ({ ...prev, [index]: { region: newValue.regionName, country: newValue.countryName } })); 
                                                        }
                                                        clearError(`stop_loc_${index}`);
                                                        clearError('stops');
                                                    }} 
                                                    renderInput={(params) => (<TextField {...params} required label="3. Місто (Локація)" error={!!errors[`stop_loc_${index}`]} helperText={!!errors[`stop_loc_${index}`] ? errors[`stop_loc_${index}`] : (!currentCountry ? "Спочатку оберіть країну" : "")} />)} 
                                                />
                                                <Divider sx={{ my: 1 }}><Chip label="Проживання (опціонально)" size="small" /></Divider>
                                                <Autocomplete options={hotelsForCity} getOptionLabel={(o) => o.name} isOptionEqualToValue={(o, v) => o.hotelId === v.hotelId} value={savedHotel} disabled={!savedLocation} onChange={(_, newValue) => updateStop(index, 'hotel', newValue)} noOptionsText={savedLocation ? (hotelsForCity.length === 0 ? "У цьому місті немає готелів" : "Не знайдено") : "Спочатку оберіть місто"} renderOption={(props, option) => (<li {...props}><Box><Typography variant="body2" fontWeight={600}>{option.name}</Typography><Stack direction="row" alignItems="center" spacing={0.5}><StarIcon sx={{ fontSize: 14, color: "#F59E0B" }} /><Typography variant="caption" color="text.secondary">{option.stars} зірок</Typography></Stack></Box></li>)} renderInput={(p) => (<TextField {...p} label={savedLocation ? `Готелі (${hotelsForCity.length})` : "Спочатку оберіть місто"} placeholder="Не обрано (без готелю)" helperText="Не обов'язково для кожного міста, але мінімум 1 на тур" />)} />
                                            </Stack>
                                        </Paper>
                                    );
                                })}
                                {formData.stops.length === 0 && (
                                    <Box sx={{ p: 4, textAlign: 'center', border: '2px dashed #ccc', borderRadius: 2 }}><Typography color="text.secondary">Маршрут порожній. Додайте першу локацію.</Typography></Box>
                                )}
                            </Stack>
                        </Box>
                    </Stack>
                );

            case 2:
                return (
                    <Stack spacing={3}>
                        <Alert severity="info" icon={<MapIcon />}>Створіть програму вашої подорожі: <b>{routeSteps.length} {getDaysString(routeSteps.length)}</b></Alert>
                        {routeSteps.map((step, dIdx) => (
                            <Paper key={dIdx} sx={{ p: 2, border: '1px solid #E2E8F0', borderLeft: (validationAttempted && step.events.length === 0) ? '4px solid red' : '1px solid #E2E8F0' }}>
                                <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ color: 'primary.main' }}>День {step.dayNumber}</Typography>
                                {step.events.map((ev, eIdx) => (
                                    <Stack key={eIdx} direction="row" spacing={1} mb={1}>
                                            <TextField 
                                                fullWidth 
                                                size="small" 
                                                placeholder="Опишіть подію" 
                                                value={ev} 
                                                onChange={(e) => handleEventChange(dIdx, eIdx, e.target.value)} 
                                                multiline 
                                                error={validationAttempted && !ev.trim()} 
                                            />
                                            <IconButton onClick={() => removeEvent(dIdx, eIdx)} color="error" disabled={step.events.length <= 1}><DeleteIcon /></IconButton>
                                    </Stack>
                                ))}
                                <Button startIcon={<AddIcon />} size="small" onClick={() => addEvent(dIdx)}>Додати подію</Button>
                                {step.events.length === 0 && validationAttempted && <Typography color="error" variant="caption">Додайте мінімум одну подію</Typography>}
                            </Paper>
                        ))}
                    </Stack>
                );
            case 3: // Details
                return (
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                        <Box flex={1}>
                            <Typography variant="h6" color="success.main" gutterBottom>Включено у вартість</Typography>
                            {errors.included && <Typography color="error" variant="caption">{errors.included}</Typography>}
                            <Stack spacing={1}>
                                {formData.included.map((item, idx) => (
                                    <Stack key={idx} direction="row" spacing={1}>
                                            <TextField fullWidth size="small" value={item} onChange={(e) => { handleListChange('included', idx, e.target.value); clearError('included'); }} placeholder="Введіть пункт..." />
                                            <IconButton onClick={() => removeListItem('included', idx)} color="error"><DeleteIcon /></IconButton>
                                    </Stack>
                                ))}
                                <Button startIcon={<AddIcon />} onClick={() => { addListItem('included'); clearError('included'); }}>Додати пункт</Button>
                            </Stack>
                        </Box>
                        <Box flex={1}>
                            <Typography variant="h6" color="error.main" gutterBottom>Не включено</Typography>
                            {errors.excluded && <Typography color="error" variant="caption">{errors.excluded}</Typography>}
                            <Stack spacing={1}>
                                {formData.excluded.map((item, idx) => (
                                    <Stack key={idx} direction="row" spacing={1}>
                                            <TextField fullWidth size="small" value={item} onChange={(e) => { handleListChange('excluded', idx, e.target.value); clearError('excluded'); }} placeholder="Введіть пункт..." />
                                            <IconButton onClick={() => removeListItem('excluded', idx)} color="error"><DeleteIcon /></IconButton>
                                    </Stack>
                                ))}
                                <Button startIcon={<AddIcon />} onClick={() => { addListItem('excluded'); clearError('excluded'); }}>Додати пункт</Button>
                            </Stack>
                        </Box>
                    </Stack>
                );
            case 4:
                const mainPreview = getMainPreview();

                return (
                    <Stack spacing={4}>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700} gutterBottom>Головне фото * (Перше в списку)</Typography>
                            <Stack direction="row" spacing={2} alignItems="flex-start">
                                {/* URL Input */}
                                <TextField 
                                    fullWidth 
                                    placeholder="Вставте посилання на фото" 
                                    value={mainImageUrl} 
                                    onChange={(e) => handleMainUrlChange(e.target.value)} 
                                    error={!!errors.imageUrl} 
                                    helperText={errors.imageUrl || "Завантажте фото або вставте URL"} 
                                    InputProps={{ startAdornment: <InputAdornment position="start"><LinkIcon color="action" /></InputAdornment> }} 
                                    sx={{ '& .MuiOutlinedInput-root': { height: '56px' }, ...noAutofillStyle }} 
                                />
                                {/* File Upload */}
                                <Button variant="contained" component="label" startIcon={<CloudUploadIcon />} sx={{ flexShrink: 0, px: 3, fontWeight: 'bold', height: '56px' }}>
                                    Завантажити <input hidden accept="image/*" type="file" onChange={(e) => { handleMainFileSelect(e); clearError('imageUrl'); }} />
                                </Button>
                            </Stack>
                            
                            {mainPreview && (
                                <Box mt={2} sx={{ width: '100%', height: 250, bgcolor: '#f0f0f0', borderRadius: 2, overflow: 'hidden', border: '1px solid #ddd', position: 'relative' }}>
                                    <Chip label="ГОЛОВНЕ ФОТО" color="primary" size="small" sx={{ position: 'absolute', top: 10, left: 10, fontWeight: 'bold' }} />
                                    <img src={mainPreview} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </Box>
                            )}
                        </Box>
                        
                        <Divider />
                        
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700} gutterBottom>Додаткові фото (Галерея)</Typography>
                            <Stack direction="row" spacing={2} alignItems="flex-start" mb={3}>
                                <TextField 
                                    fullWidth 
                                    placeholder="Вставте посилання на фото для галереї" 
                                    value={galleryUrlInput} 
                                    onChange={(e) => setGalleryUrlInput(e.target.value)} 
                                    helperText="Завантажте фото або додайте посилання на нього" 
                                    InputProps={{ endAdornment: (<InputAdornment position="end"><Button size="small" onClick={handleAddGalleryUrl} disabled={!galleryUrlInput.trim()}>Додати URL</Button></InputAdornment>) }} 
                                    sx={{ '& .MuiOutlinedInput-root': { height: '56px' }, ...noAutofillStyle }} 
                                />
                                <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} sx={{ flexShrink: 0, px: 3, fontWeight: 'bold', height: '56px' }}>
                                    Завантажити <input hidden accept="image/*" type="file" multiple onChange={handleGallerySelect} />
                                </Button>
                            </Stack>
                            
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 2 }}>
                                {galleryItems.map((item, idx) => {
                                    const src = item instanceof File ? URL.createObjectURL(item) : item;
                                    return (
                                        <Card key={idx} sx={{ position: 'relative' }}>
                                            <CardMedia component="img" height="120" image={src} sx={{ objectFit: 'cover' }} />
                                            <IconButton size="small" onClick={() => removeGalleryItem(idx)} sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(255,255,255,0.8)' }}><DeleteIcon color="error" /></IconButton>
                                            <Chip label={item instanceof File ? "Файл" : "URL"} size="small" color={item instanceof File ? "success" : "default"} sx={{ position: 'absolute', bottom: 5, left: 5, fontSize: '0.6rem', height: 20 }} />
                                        </Card>
                                    );
                                })}
                            </Box>
                        </Box>
                    </Stack>
                );
            default: return null;
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 5 }, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
            <Stack direction="row" alignItems="center" sx={{ mb: 4 }}>
                <IconButton onClick={() => isDirty ? setConfirmExitOpen(true) : navigate(-1)} sx={{ mr: 2 }}><ArrowBackIcon /></IconButton>
                <Typography variant="h4" fontWeight={900}>{isUpdate ? "Редагування туру" : "Новий тур"}</Typography>
            </Stack>

            <Paper sx={{ p: 4, borderRadius: 4, maxWidth: 1000, mx: 'auto' }}>
                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>{STEPS.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}</Stepper>
                <Box sx={{ minHeight: 400 }}>{renderStepContent(activeStep)}</Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6, pt: 2, borderTop: '1px solid #eee' }}>
                    <Button disabled={activeStep === 0} onClick={handleBack} startIcon={<BackIcon />}>Назад</Button>
                    {activeStep === STEPS.length - 1 ? (
                        <Button variant="contained" size="large" onClick={() => handleSaveWithValidation()} startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}>Зберегти тур</Button>
                    ) : (
                        <Button variant="contained" onClick={handleNextWithValidation} endIcon={<NextIcon />}>Далі</Button>
                    )}
                </Box>
            </Paper>

            <Dialog open={confirmSaveOpen} onClose={() => setConfirmSaveOpen(false)}>
                <DialogTitle>Зберегти зміни?</DialogTitle>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setConfirmSaveOpen(false)}>Ні</Button>
                    <Button variant="contained" onClick={handleConfirmSave}>Так, зберегти</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={confirmExitOpen} onClose={() => setConfirmExitOpen(false)}>
                <DialogTitle>Вийти без збереження?</DialogTitle>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setConfirmExitOpen(false)}>Продовжити редагування</Button>
                    <Button color="error" onClick={() => navigate(-1)}>Вийти</Button>
                </DialogActions>
            </Dialog>
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}><Alert severity={snackbar.severity}>{snackbar.message}</Alert></Snackbar>
        </Box>
    );
};

export default CreateTourPage;