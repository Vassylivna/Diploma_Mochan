import React, { useState } from 'react';
import { Box, CssBaseline, Toolbar, Typography, Container, Pagination, CircularProgress } from '@mui/material';
import Header from '../components/layout/Header';
import Sidebar from '../components/sidebar/Sidebar';
import TourCardItem from '../components/tours/TourCard';
import SearchOffIcon from '@mui/icons-material/SearchOff';

import { TourCard } from '../types/tour.types';
import { useTourCatalog } from '../hooks/useTourCatalog';

interface HomePageProps {
    userRole: 'admin' | 'user' | 'guide' | null; 
    handleLogout: () => void;
}

const ITEMS_PER_PAGE = 9;

const HomePage: React.FC<HomePageProps> = ({ userRole }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);

    const { tours: allTours, loading, setTours } = useTourCatalog(userRole, searchTerm);

    const totalPages = Math.ceil(allTours.length / ITEMS_PER_PAGE);
    const displayedTours = allTours.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const handleSearch = (query: string) => {
        setSearchTerm(query);
        setPage(1);
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleApplyFilters = (filteredTours: TourCard[]) => {
        setTours(filteredTours);
        setPage(1); 
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />

            <Header 
                onSearch={handleSearch} 
                userRole={userRole} 
            />

            <Sidebar 
                userRole={userRole}
                onApplyFilters={handleApplyFilters} 
            />

            <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Toolbar />
                <Container maxWidth="xl" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h4" sx={{ mb: 4, fontWeight: 900, color: '#1a1a1a' }}>
                        Тури, що надихають
                    </Typography>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10, flexGrow: 1 }}>
                            <CircularProgress />
                        </Box>
                    ) : displayedTours.length > 0 ? (
                        <>
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        sm: 'repeat(2, 1fr)',
                                        md: 'repeat(3, 1fr)',
                                    },
                                    gap: 3,
                                    flexGrow: 1
                                }}
                            >
                                {displayedTours.map((tour) => (
                                    <Box key={tour.tourId}>
                                        <TourCardItem 
                                            tour={tour} 
                                            userRole={userRole} 
                                        />
                                    </Box>
                                ))}
                            </Box>

                            {totalPages > 1 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, mb: 2 }}>
                                    <Pagination 
                                        count={totalPages} 
                                        page={page} 
                                        onChange={handlePageChange} 
                                        color="primary" 
                                        size="large"
                                        shape="rounded"
                                        sx={{
                                            '& .MuiPaginationItem-root': {
                                                fontSize: '1rem',
                                                fontWeight: 600
                                            },
                                            '& .Mui-selected': {
                                                backgroundColor: '#1a1a1a',
                                                color: '#fff',
                                                '&:hover': { backgroundColor: '#333' }
                                            }
                                        }}
                                    />
                                </Box>
                            )}
                        </>
                    ) : (
                        <Box 
                            sx={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                mt: 10,
                                textAlign: 'center',
                                color: '#999',
                                flexGrow: 1
                            }}
                        >
                            <SearchOffIcon sx={{ fontSize: '80px', mb: 2, color: '#eee' }} />
                            <Typography variant="h5" sx={{ fontWeight: 800, color: '#333', mb: 1 }}>
                                Упс! Нічого не знайдено
                            </Typography>
                        </Box>
                    )}
                </Container>
            </Box>
        </Box>
    );
};

export default HomePage;