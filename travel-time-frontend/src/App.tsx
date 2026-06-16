import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import './App.css';

// 1. ІМПОРТУЄМО НАШ НОВИЙ КОМПОНЕНТ
// Переконайся, що ти створив файл за цим шляхом (як ми обговорювали раніше)
import GlobalSnackbar from './components/GlobalSnackbar';

import ScrollToTop from './components/utils/ScrollToTop'; 
import ProtectedRoute from './components/auth/ProtectedRoute'; 

// Сторінки
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import UserProfile from './pages/UserProfile';
import MyTours from './pages/MyToursPage';
import AboutPage from './pages/AboutPage';

// Адмінські сторінки
import ToursControlPage from './pages/admin/ToursControlPage';
import AdminUsersPage from './pages/admin/AdminUsersPage'; 
import CreateTourPage from './pages/admin/CreateTourPage';
import ManagePlacesPage from './pages/admin/ManagePlacesPage';
import TransportControlPage from './pages/admin/TransportControlPage';
import ManageHotelsPage from './pages/admin/ManageHotelsPage';

import BookingPage from './pages/admin/BookingPage';
import StatisticsPage from './pages/admin/StatisticsPage';
import TourDetailsPage from './pages/TourDetailsPage';
import PolicyPage from './pages/PolicyPage';

import GuideDashboard from './pages/guide/GuideDashboard';
import GuideTourDetailsPage from './pages/guide/GuideTourDetailsPage';

const theme = createTheme({
    palette: {
        primary: { main: '#2563EB' },
        background: { default: '#F8FAFC' }
    }
});

const App: React.FC = () => {
    const [userRole, setUserRole] = useState<'admin' | 'user' | "guide" |null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
    // Тільки цей ключ!
    const storedRole = localStorage.getItem('app_user_role') as 'admin' | 'user' | "guide" | null;
    if (storedRole) setUserRole(storedRole);
    setIsLoading(false);
    }, []);

    const handleAuth = (role: 'admin' | 'user' | "guide") => {
        setUserRole(role);
        // НЕ ПИШИ ТУТ localStorage.setItem, бо UserService вже це зробив!
        // Або якщо пишеш, то під правильним ключем:
        localStorage.setItem('app_user_role', role); 
    };

    const handleLogout = () => {
        setUserRole(null);
        localStorage.removeItem('app_current_user_id');
        localStorage.removeItem('app_user_role');   
    };

    if (isLoading) return <div style={{ textAlign: 'center', marginTop: '20%' }}>Завантаження...</div>;

    // --- ЛОГІКА РЕДІРЕКТУ ---
    const getRedirectPath = () => {
        if (userRole === 'guide') return "/guide/dashboard";
        return "/"; // Для admin та user
    };

    
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <GlobalSnackbar />

            <BrowserRouter>
                <ScrollToTop /> 
                <Routes>
                    <Route 
                        path="/login" 
                        element={userRole ? <Navigate to={getRedirectPath()} replace /> : <AuthPage setAuthRole={handleAuth} />} 
                    />
                    <Route 
                        path="/register" 
                        element={userRole ? <Navigate to={getRedirectPath()} replace /> : <AuthPage setAuthRole={handleAuth} />} 
                    />

                    <Route path="/" element={<ProtectedRoute userRole={userRole}><HomePage userRole={userRole} handleLogout={handleLogout} /></ProtectedRoute>} />
                    <Route path="/about" element={<ProtectedRoute userRole={userRole}><AboutPage /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute userRole={userRole}><UserProfile handleLogout={handleLogout} /></ProtectedRoute>} />
                    <Route path="/my-tours" element={<ProtectedRoute userRole={userRole}><MyTours /></ProtectedRoute>} />
                    <Route path="/tour/:id" element={<ProtectedRoute userRole={userRole}><TourDetailsPage /></ProtectedRoute>} />
                    <Route path="/policy" element={<PolicyPage />} />
                    
                    <Route path="/admin/users" element={<ProtectedRoute userRole={userRole} onlyAdmin><AdminUsersPage /></ProtectedRoute>} />
                    <Route path="/management/tours" element={<ProtectedRoute userRole={userRole} onlyAdmin><ToursControlPage /></ProtectedRoute>} />
                    <Route path="/management/create-tour" element={<ProtectedRoute userRole={userRole} onlyAdmin><CreateTourPage /></ProtectedRoute>} />
                    <Route path="/management/edit-tour/:tourId" element={<ProtectedRoute userRole={userRole} onlyAdmin><CreateTourPage /></ProtectedRoute>} />
                    <Route path="/management/locations" element={<ProtectedRoute userRole={userRole} onlyAdmin><ManagePlacesPage /></ProtectedRoute>} />
                    <Route path="/management/transports" element={<ProtectedRoute userRole={userRole} onlyAdmin><TransportControlPage /></ProtectedRoute>} />
                    <Route path="/management/hotels" element={<ProtectedRoute userRole={userRole} onlyAdmin><ManageHotelsPage /></ProtectedRoute>} />
                    <Route path="/admin/bookings" element={<ProtectedRoute userRole={userRole} onlyAdmin><BookingPage /></ProtectedRoute>} />
                    <Route path="/admin/statistics" element={<ProtectedRoute userRole={userRole} onlyAdmin><StatisticsPage /></ProtectedRoute>} />

                    <Route path="/guide/dashboard" element={<ProtectedRoute userRole={userRole}><GuideDashboard /></ProtectedRoute>} />
                    <Route path="/guide/tour/:id" element={<ProtectedRoute userRole={userRole}><GuideTourDetailsPage /></ProtectedRoute>} />
                    
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
};

export default App;