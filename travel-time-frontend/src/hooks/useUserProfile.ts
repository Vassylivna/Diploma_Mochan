import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types/user.types';
import { UserService } from '../services/UserService';

export const useUserProfile = (onLogout?: () => void) => {
    const navigate = useNavigate();
    
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        phone: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [isEditing, setIsEditing] = useState(false);

    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
        open: false, message: "", severity: "success"
    });

    const getCleanPhone = (fullPhone: string) => fullPhone?.replace('+380', '').replace(/\D/g, '') || "";

    useEffect(() => {
        const loadUser = async () => {
            try {
                const currentUser = await UserService.getProfile();
                if (currentUser) {
                    setUser(currentUser);
                    setFormData(prev => ({ ...prev, phone: getCleanPhone(currentUser.phoneNumber) }));
                } else {
                    navigate('/login');
                }
            } catch (e) {
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, [navigate]);

    const handlePhoneChange = (val: string) => {
        setFormData(prev => ({ ...prev, phone: val.replace(/\D/g, '').slice(0, 9) }));
    };

    const handlePasswordChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const hasUnsavedChanges = () => {
        if (!user) return false;
        const isPhoneChanged = formData.phone !== getCleanPhone(user.phoneNumber);
        const isPassChanged = !!formData.currentPassword || !!formData.newPassword;
        return isPhoneChanged || isPassChanged;
    };

    const saveChanges = async () => {
        if (formData.phone.length < 9) {
            setSnackbar({ open: true, message: "Невірний формат телефону", severity: "error" });
            return false;
        }

        const isPasswordChange = !!formData.newPassword;

        if (isPasswordChange) {
            if (!formData.currentPassword || formData.newPassword !== formData.confirmPassword) {
                setSnackbar({ open: true, message: "Перевірте паролі", severity: "error" });
                return false;
            }
        }

        try {
            const fullPhone = `+380${formData.phone}`;
            if (fullPhone !== user?.phoneNumber) {
                const updatedUser = await UserService.updateProfile(fullPhone);
                setUser(updatedUser);
            }

            if (isPasswordChange) {
                await UserService.changePassword({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                });
            }

            setSnackbar({ open: true, message: "Профіль оновлено!", severity: "success" });
            setIsEditing(false);
            setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
            return true;

        } catch (error) {
            return false;
        }
    };

    const cancelChanges = () => {
        if (user) {
            setFormData({
                phone: getCleanPhone(user.phoneNumber),
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
        }
        setIsEditing(false);
    };

    const performLogout = async () => {
        await UserService.logout();
        if (onLogout) onLogout();
        navigate("/login", { replace: true });
    };

    return {
        user, 
        loading, 
        formData, 
        isEditing, 
        snackbar,
        displayPhone: formData.phone,
        
        setIsEditing, 
        setSnackbar, 
        handlePhoneChange, 
        handlePasswordChange,
        hasUnsavedChanges, 
        saveChanges, 
        cancelChanges,
        performLogout
    };
};