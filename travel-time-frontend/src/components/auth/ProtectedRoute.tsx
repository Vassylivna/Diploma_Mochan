import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
    userRole: 'admin' | 'user' | 'guide' | null;
    children: React.ReactElement;
    onlyAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ userRole, children, onlyAdmin = false }) => {
    const location = useLocation();
    
    const effectiveRole = userRole || localStorage.getItem('app_user_role');

    if (!effectiveRole) {
        if (location.pathname === '/login' || location.pathname === '/register') {
            return children;
        }
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (onlyAdmin && effectiveRole !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;