import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Box, Button, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate, useLocation } from 'react-router-dom';

// Ключ для збереження пошуку в localStorage
export const SEARCH_STORAGE_KEY = 'user_global_search_term';

interface HeaderProps {
    onSearch: (query: string) => void;
    userRole: 'admin' | 'user' | 'guide' | null;
}

const buttonStyle = {
    textTransform: 'none',
    fontSize: '1rem',
    fontWeight: 500,
    color: 'white',
    px: 2,
    py: 1,
    borderRadius: 2,
    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)' },
} as const;

const Header: React.FC<HeaderProps> = ({ onSearch, userRole }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [searchText, setSearchText] = useState(() => {
        return localStorage.getItem(SEARCH_STORAGE_KEY) || '';
    });

    useEffect(() => {
        const saved = localStorage.getItem(SEARCH_STORAGE_KEY);
        
        setSearchText(saved || '');

        if (saved && location.pathname === '/') {
            onSearch(saved);
        }
        
    }, [location.pathname]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    };

    const handleSearchSubmit = () => {
        const trimmed = searchText.trim();
        
        // 3. Зберігаємо в пам'ять
        if (trimmed) {
            localStorage.setItem(SEARCH_STORAGE_KEY, trimmed);
        } else {
            localStorage.removeItem(SEARCH_STORAGE_KEY);
        }

        onSearch(trimmed);
        
        if (location.pathname !== '/') {
            navigate('/');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSearchSubmit();
    };

    const showSearch = userRole !== 'guide';

    return (
        <AppBar
            position="fixed"
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                backgroundImage: `url("/assets/header.jpg")`, 
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <Toolbar sx={{ justifyContent: 'space-between', minHeight: 70 }}>
                <Box 
                    sx={{ 
                        display: 'flex', alignItems: 'center', ml: { xs: 2, sm: 8, md: 20 }, gap: 1,
                        cursor: 'pointer', transition: 'opacity 0.2s', '&:hover': { opacity: 0.8 }
                    }}
                    onClick={() => navigate('/')}
                >
                    <img src="/assets/map.png" alt="Logo" style={{ width: 40, height: 40 }} />
                    <Typography variant="h6" noWrap sx={{ fontWeight: 'bold', fontSize: { xs: '1.2rem', sm: '1.3rem', md: '1.4rem' }, color: 'white', ml: 1 }}>
                        Travel Time
                    </Typography>
                </Box>

                {showSearch ? (
                    <Box sx={{ flexGrow: 1, maxWidth: 600, mx: 4, position: 'relative', display: { xs: 'none', md: 'flex' }, flexDirection: 'column' }}>
                        <input
                            type="text"
                            placeholder="Пошук турів..."
                            value={searchText}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            style={{
                                width: '100%', padding: '12px 50px 12px 20px', borderRadius: '12px',
                                border: 'none', fontSize: '1.1rem', outline: 'none',
                                backgroundColor: 'rgba(255, 255, 255, 0.95)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                            }}
                        />
                        <IconButton 
                            size="large" color="primary" onClick={handleSearchSubmit} 
                            sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
                        >
                            <SearchIcon />
                        </IconButton>
                    </Box>
                ) : (
                    <Box sx={{ flexGrow: 1 }} />
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: { xs: 2, sm: 4, md: 6 } }}>
                    {userRole === 'admin' && (
                        <>
                            <Button onClick={() => navigate('/admin/users')} sx={buttonStyle}>Користувачі</Button>
                            <Button onClick={() => navigate('/management/tours')} sx={buttonStyle}>Тури</Button>
                            <Button onClick={() => navigate('/admin/bookings')} sx={buttonStyle}>Бронювання</Button>
                            <Button onClick={() => navigate('/admin/statistics')} sx={buttonStyle}>Аналітика</Button>
                        </>
                    )}
                    {userRole === 'user' && (
                        <Button onClick={() => navigate('/my-tours')} sx={buttonStyle}>Мої тури</Button>
                    )}

                    <Button onClick={() => navigate('/profile')} sx={buttonStyle}>Профіль</Button>
                    <Button onClick={() => navigate('/about')} sx={buttonStyle}>Про компанію</Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;