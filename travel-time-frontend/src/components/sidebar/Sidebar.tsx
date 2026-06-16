import React from 'react';
import {
    Box, Typography, Button, Drawer, Toolbar, TextField, MenuItem, Select,
    FormControl, Stack, Divider, Autocomplete, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PlaceIcon from '@mui/icons-material/Place';
import { useSidebarFilters } from '../../hooks/useSidebarFilters';
import { TourCard } from '../../types/tour.types';

const drawerWidth = 340;

interface SidebarProps {
    userRole: 'admin' | 'user' | 'guide' | null;
    onApplyFilters: (tours: TourCard[]) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onApplyFilters }) => {
    const {
        transport, priceFrom, priceTo, country, startLocation, hotelType, dateFrom, dateTo,
        transportList, errors, today,
        setTransport, setPriceFrom, setPriceTo, setCountry, setStartLocation, setHotelType, setDateTo,
        handleDateFromChange, handleApply, handleClear
    } = useSidebarFilters(onApplyFilters);

    const commonInputStyle = (hasError: boolean = false) => ({
        '& .MuiOutlinedInput-root': {
            borderRadius: '14px', fontSize: '0.95rem', backgroundColor: '#ffffff', transition: 'all 0.2s',
            '& fieldset': { borderColor: hasError ? '#d32f2f' : '#e0e0e0', borderWidth: '1px' },
            '&:hover fieldset': { borderColor: hasError ? '#d32f2f' : '#bbb' },
            '&.Mui-focused fieldset': { borderColor: hasError ? '#d32f2f' : '#00D4FF', borderWidth: '2px' },
        },
        '& .MuiAutocomplete-inputRoot': { padding: '2px 9px !important' }
    });

    const labelStyle = { fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#555', mb: 0.8, letterSpacing: '0.5px' };

    return (
        <Drawer
            variant="permanent"
            sx={{ width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: '1px solid rgba(0,0,0,0.08)', boxShadow: '5px 0 20px rgba(0,0,0,0.03)', backgroundColor: '#fff' } }}
        >
            <Toolbar sx={{ minHeight: '64px !important' }} />

            <Box sx={{ px: 3, pt: 3, pb: 1 }}>
                <Typography sx={{ fontSize: '1.8rem', fontWeight: 900, color: '#000', letterSpacing: '-1px', lineHeight: 1 }}>
                    Знайди свій<span style={{ color: '#005566ff' }}> ідеальний вайб</span>
                </Typography>
            </Box>

            <Box sx={{ px: 3, display: 'flex', flexDirection: 'column', gap: 1, flexGrow: 1, justifyContent: 'space-evenly', overflowY: 'auto' }}>
                
                <Box>
                    <Typography sx={labelStyle}>Напрямок</Typography>
                    <TextField
                        placeholder="Введіть країну" value={country} onChange={(e) => setCountry(e.target.value)} fullWidth sx={commonInputStyle()}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#ccc', fontSize: 22 }} /></InputAdornment>, sx: { '& input': { py: '10px' } } }}
                    />
                </Box>

                <Box>
                    <Typography sx={labelStyle}>Місто збору</Typography>
                    <TextField
                        placeholder="Введіть місто збору" value={startLocation} onChange={(e) => setStartLocation(e.target.value)} fullWidth sx={commonInputStyle()}
                        InputProps={{ startAdornment: <InputAdornment position="start"><PlaceIcon sx={{ color: '#ccc', fontSize: 22 }} /></InputAdornment>, sx: { '& input': { py: '10px' } } }}
                    />
                </Box>

                <Box>
                    <Typography sx={labelStyle}>Бюджет</Typography>
                    <Stack direction="row" spacing={1.5}>
                        <TextField placeholder="Від" value={priceFrom} onChange={(e) => setPriceFrom(e.target.value.replace(/\D/g, ''))} fullWidth sx={commonInputStyle()} InputProps={{ sx: { '& input': { py: '10px' } } }} />
                        <TextField placeholder="До" value={priceTo} onChange={(e) => setPriceTo(e.target.value.replace(/\D/g, ''))} fullWidth sx={commonInputStyle()} InputProps={{ sx: { '& input': { py: '10px' } } }} />
                    </Stack>
                </Box>

                <Box>
                    <Typography sx={labelStyle}>Дати подорожі</Typography>
                    <Stack direction="row" spacing={1.5}>
                        <TextField 
                            type="date" 
                            error={errors.dateFrom} 
                            value={dateFrom} 
                            onChange={(e) => handleDateFromChange(e.target.value)} 
                            fullWidth 
                            sx={commonInputStyle(errors.dateFrom)} 
                            inputProps={{ min: today, style: { padding: '10px' } }} 
                        />
                        <TextField 
                            type="date" 
                            error={errors.dateTo} 
                            value={dateTo} 
                            onChange={(e) => setDateTo(e.target.value)} 
                            fullWidth 
                            sx={commonInputStyle(errors.dateTo)} 
                            inputProps={{ min: dateFrom || today, style: { padding: '10px' } }} 
                        />
                    </Stack>
                </Box>
                
                <Divider sx={{ borderStyle: 'dashed', borderColor: '#eee' }} />

                <Box>
                    <Typography sx={labelStyle}>Деталі туру</Typography>
                    <Stack spacing={1.5}>
                        <FormControl fullWidth sx={commonInputStyle()}>
                            <Select
                                value={hotelType} 
                                displayEmpty 
                                onChange={(e) => setHotelType(e.target.value as any)} 
                                sx={{ backgroundColor: '#ffffff', borderRadius: '14px', '& .MuiSelect-select': { py: '10px !important', fontSize: '0.95rem', color: hotelType === "" ? "#aaa" : "inherit" } }}
                            >
                                <MenuItem value="" disabled>Клас готелю</MenuItem>
                                <MenuItem value={1}>1 зірка</MenuItem>
                                <MenuItem value={2}>2 зірки</MenuItem>
                                <MenuItem value={3}>3 зірки</MenuItem>
                                <MenuItem value={4}>4 зірки</MenuItem>
                                <MenuItem value={5}>5 зірок</MenuItem>
                            </Select>
                        </FormControl>

                        <Autocomplete
                            options={Array.from(new Set(transportList.map((t) => t.transportName)))}
                            value={transport} 
                            onChange={(_, newValue) => setTransport(newValue)}
                            sx={commonInputStyle()}
                            renderInput={(params) => (
                                <TextField {...params} placeholder="Вид транспорту" sx={{ '& .MuiInputBase-root': { backgroundColor: '#ffffff', borderRadius: '14px' }, '& .MuiInputBase-input': { py: '10px !important' } }} />
                            )}
                            renderOption={(props, option) => <li {...props} key={option} style={{ fontSize: '0.9rem' }}>{option}</li>}
                            noOptionsText="Не знайдено"
                        />
                    </Stack>
                </Box>
            </Box>

            <Box sx={{ px: 3, pb: 3, pt: 2 }}>
                <Button variant="contained" fullWidth onClick={handleApply} sx={{ py: 1.5, bgcolor: '#1a1a1a', borderRadius: '14px', fontWeight: 800, textTransform: 'none', '&:hover': { bgcolor: '#00D4FF' } }}>
                    Знайти
                </Button>
                <Button onClick={handleClear} sx={{ mt: 1.5, color: '#888', fontSize: '0.8rem', width: '100%', fontWeight: 600, textTransform: 'none', borderRadius: '12px', '&:hover': { color: '#000', bgcolor: 'rgba(0,0,0,0.04)' } }}>
                    Скинути фільтри
                </Button>
            </Box>
        </Drawer>
    );
};

export default Sidebar;