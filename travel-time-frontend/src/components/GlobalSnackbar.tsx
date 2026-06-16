import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

let showSnackbarFn: ((message: string, severity: AlertColor) => void) | null = null;

export const showGlobalSnackbar = (message: string, severity: AlertColor = 'error') => {
    if (showSnackbarFn) {
        showSnackbarFn(message, severity);
    }
};

const GlobalSnackbar: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState<AlertColor>('success');

    useEffect(() => {
        showSnackbarFn = (msg, sev) => {
            setMessage(msg);
            setSeverity(sev);
            setOpen(true);
        };
        return () => { showSnackbarFn = null; };
    }, []);

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') return;
        setOpen(false);
    };

    return (
        <Snackbar 
            open={open} 
            autoHideDuration={4000} 
            onClose={handleClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            sx={{ zIndex: 99999 }} 
        >
            <Alert 
                severity={severity} 
                onClose={handleClose}
                sx={{ 
                    width: '100%', 
                    fontWeight: 600, 
                    borderRadius: 2 
                }}
            >
                {message}
            </Alert>
        </Snackbar>
    );
};

export default GlobalSnackbar;