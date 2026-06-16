import React, { useState } from "react";
import {
    Box, Typography, Paper, Stack, TextField, Button, Avatar,
    InputAdornment, Snackbar, Alert, Dialog, DialogTitle,
    DialogContent, DialogContentText, DialogActions, CircularProgress
} from "@mui/material";
import {
    Logout as LogoutIcon, ArrowBack as ArrowBackIcon, Person as PersonIcon,
    Key as KeyIcon, Email as EmailIcon, Edit as EditIcon,
    Save as SaveIcon, Close as CloseIcon, LocalPhone as PhoneIcon, Cake as CakeIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "../hooks/useUserProfile";

interface UserProfileProps {
    handleLogout: () => void;
}

const fieldStyles = {
    '& .MuiOutlinedInput-root': {
        fontSize: "0.9rem", color: "white", borderRadius: "10px", height: "40px",
        backgroundColor: "rgba(255, 255, 255, 0.07)",
        '& fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.8)' },
        '&.Mui-focused fieldset': { borderColor: '#4facfe', borderWidth: '2px' },
        '&.Mui-disabled': {
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
        }
    },
    '& .MuiInputBase-input': {
        padding: "8px 12px 8px 0px", height: "auto",
        '&.Mui-disabled': { WebkitTextFillColor: "#FFFFFF !important", opacity: 1 }
    },
    '& .MuiInputAdornment-root .MuiSvgIcon-root': { color: 'rgba(255, 255, 255, 0.7)' }
};

const labelStyle = { color: "rgba(255,255,255,0.85)", fontWeight: 600, fontSize: "0.8rem", ml: 1, mb: 0.2 };

const UserProfile: React.FC<UserProfileProps> = ({ handleLogout }) => {
    const navigate = useNavigate();
    
    const {
        user, loading, formData, isEditing, snackbar, displayPhone,
        setIsEditing, setSnackbar, handlePhoneChange, handlePasswordChange,
        hasUnsavedChanges, saveChanges, cancelChanges, performLogout
    } = useUserProfile(handleLogout);

    const [dialogType, setDialogType] = useState<'save' | 'cancel' | 'logout' | 'back' | null>(null);

    const getBackPath = () => {
        if (user?.role === 'GUIDE') return "/guide/dashboard";
        return "/";
    };

    const onSaveClick = () => {
        if (!hasUnsavedChanges()) {
            setSnackbar({ open: true, message: "Немає змін для збереження", severity: "error" });
            return;
        }
        setDialogType('save');
    };

    const onCancelClick = () => {
        if (hasUnsavedChanges()) setDialogType('cancel');
        else setIsEditing(false);
    };

    const onBackClick = () => {
        if (hasUnsavedChanges()) {
            setDialogType('back');
        } else {
            navigate(getBackPath());
        }
    };

    const handleConfirmDialog = async () => {
        if (dialogType === 'logout') {
            await performLogout();
        } 
        else if (dialogType === 'save') {
            await saveChanges();
        } 
        else if (dialogType === 'cancel') {
            cancelChanges();
        } 
        else if (dialogType === 'back') {
            navigate(getBackPath());
        }
        setDialogType(null);
    };

    if (loading || !user) {
        return (
            <Box sx={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", bgcolor: "#1a1a1a" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{
            height: "100vh", width: "100vw",
            backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url("/assets/prof.jpg")`,
            backgroundSize: "cover", backgroundPosition: "center",
            display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden"
        }}>
            <Paper elevation={0} sx={{
                width: { xs: "95%", sm: 440 }, background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.3)",
                p: 3, borderRadius: 5, boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
                display: "flex", flexDirection: "column", alignItems: "center", maxHeight: "98vh", overflowY: 'auto'
            }}>
                <Avatar sx={{
                    width: 70, height: 70, bgcolor: "primary.main", mb: 1.5,
                    boxShadow: "0 0 25px rgba(11, 136, 245, 0.7)", border: "3px solid #fff"
                }}>
                    <PersonIcon sx={{ fontSize: 45 }} />
                </Avatar>

                <Typography variant="h5" sx={{
                    mb: 0.2, fontWeight: 800, fontSize: "1.15rem", color: "#FFFFFF",
                    textShadow: "0 3px 12px rgba(0,0,0,0.5)", textAlign: "center"
                }}>
                    {user.lastName} {user.firstName} {user.middleName || ""}
                </Typography>
                
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mb: 2 }}>
                    {user.role === 'ADMIN' ? 'Адміністратор' : user.role === 'GUIDE' ? 'Гід' : 'Користувач'}
                </Typography>
                
                <Stack spacing={1.5} width="100%" mb={2}>
                    <Box>
                        <Typography sx={labelStyle}>Email адреса</Typography>
                        <TextField
                            value={user.email} fullWidth disabled={true} variant="outlined" sx={fieldStyles}
                            InputProps={{
                                startAdornment: (<InputAdornment position="start" sx={{ mr: 1 }}><EmailIcon fontSize="small" /></InputAdornment>),
                            }}
                        />
                    </Box>
                    
                    <Box>
                        <Typography sx={labelStyle}>Номер телефону</Typography>
                        <TextField
                            value={displayPhone}
                            fullWidth disabled={!isEditing}
                            onChange={(e) => handlePhoneChange(e.target.value)}
                            variant="outlined" sx={fieldStyles}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start" sx={{ mr: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <PhoneIcon fontSize="small" sx={{ color: "#FFFFFF !important" }} />
                                            <Typography sx={{ color: '#FFFFFF', fontWeight: 400, fontSize: '0.9rem' }}>+380</Typography>
                                            <Box sx={{ width: '1px', height: '16px', backgroundColor: 'rgba(255,255,255,0.5)' }} />
                                        </Box>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>

                    <Box>
                        <Typography sx={labelStyle}>Дата народження</Typography>
                        <TextField
                            value={user.birthDate || "Не вказано"} fullWidth disabled={true} variant="outlined" sx={fieldStyles}
                            InputProps={{
                                startAdornment: (<InputAdornment position="start" sx={{ mr: 1 }}><CakeIcon fontSize="small" /></InputAdornment>),
                            }}
                        />
                    </Box>

                    {isEditing && (
                        <>
                            <Box>
                                <Typography sx={labelStyle}>Поточний пароль</Typography>
                                <TextField
                                    placeholder="Введіть поточний пароль"
                                    value={formData.currentPassword}
                                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                                    fullWidth type="password" variant="outlined" sx={fieldStyles}
                                    InputProps={{
                                        startAdornment: (<InputAdornment position="start" sx={{ mr: 1 }}><KeyIcon fontSize="small" /></InputAdornment>),
                                    }}
                                />
                            </Box>
                            
                            <Stack direction="row" spacing={1.5}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={labelStyle}>Новий пароль</Typography>
                                    <TextField
                                        placeholder="******"
                                        value={formData.newPassword}
                                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                                        fullWidth type="password" variant="outlined"
                                        sx={{ ...fieldStyles, '& .MuiInputBase-input': { padding: "8px 12px 8px 15px !important" } }}
                                    />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={labelStyle}>Підтвердження</Typography>
                                    <TextField
                                        placeholder="******"
                                        value={formData.confirmPassword}
                                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                                        fullWidth type="password" variant="outlined"
                                        sx={{ ...fieldStyles, '& .MuiInputBase-input': { padding: "8px 12px 8px 15px !important" } }}
                                    />
                                </Box>
                            </Stack>
                        </>
                    )}
                </Stack>
                
                <Box mb={1.5} width="100%">
                    {!isEditing ? (
                        <Button
                            variant="contained" fullWidth startIcon={<EditIcon />} onClick={() => setIsEditing(true)}
                            sx={{
                                py: 1.2, fontSize: "0.95rem", fontWeight: 700, borderRadius: "10px",
                                background: "linear-gradient(45deg, #1976D2, #2196F3)", boxShadow: "0 4px 15px rgba(79, 172, 254, 0.4)",
                                textTransform: "none", "&:hover": { background: "linear-gradient(45deg, #1565C0, #1976D2)" },
                            }}
                        >
                            Редагувати профіль
                        </Button>
                    ) : (
                        <Stack direction="row" spacing={1.5}>
                            <Button
                                variant="contained" startIcon={<SaveIcon />} onClick={onSaveClick}
                                sx={{ 
                                    flex: 1, py: 1.2, fontSize: "0.95rem", fontWeight: 700, borderRadius: "10px", 
                                    background: "#4CAF50", textTransform: "none", "&:hover": { background: "#388E3C" } 
                                }}
                            >
                                Зберегти
                            </Button>
                            <Button
                                variant="outlined" startIcon={<CloseIcon />} onClick={onCancelClick}
                                sx={{ 
                                    flex: 1, py: 1.2, fontSize: "0.95rem", fontWeight: 700, borderRadius: "10px", 
                                    color: "#FFFFFF", borderColor: "rgba(255,255,255,0.5)", textTransform: "none",
                                    "&:hover": { borderColor: "#FFFFFF", bgcolor: "rgba(255,255,255,0.1)" },
                                }}
                            >
                                Скасувати
                            </Button>
                        </Stack>
                    )}
                </Box>

                <Stack width="100%" spacing={1} mt="auto">
                    {!isEditing && (
                        <Button
                            variant="contained" fullWidth startIcon={<LogoutIcon />} onClick={() => setDialogType('logout')}
                            sx={{
                                py: 1.2, fontSize: "0.95rem", fontWeight: 700, borderRadius: "12px",
                                background: "linear-gradient(45deg, #FF3D00, #F44336)", textTransform: "none",
                                boxShadow: "0 4px 15px rgba(255, 61, 0, 0.3)", "&:hover": { background: "linear-gradient(45deg, #d32f2f, #FF3D00)" },
                            }}
                        >
                            Вийти з акаунту
                        </Button>
                    )}

                    <Button
                        variant="text" 
                        startIcon={<ArrowBackIcon />} 
                        onClick={isEditing ? onCancelClick : onBackClick}
                        sx={{
                            py: 0.5, color: "rgba(255,255,255,0.8)", fontWeight: 600, fontSize: "0.85rem",
                            textTransform: "none", "&:hover": { color: "#fff" },
                        }}
                    >
                        {isEditing 
                            ? "Назад у профіль" 
                            : user.role === 'GUIDE' 
                                ? "Повернутися до панелі гіда" 
                                : "Повернутися до турів"
                        }
                    </Button>
                </Stack>
            </Paper>

            <Dialog
                open={!!dialogType} onClose={() => setDialogType(null)}
                PaperProps={{
                    style: {
                        backgroundColor: "rgba(25, 30, 40, 0.9)", backdropFilter: "blur(10px)",
                        borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)", color: "white", minWidth: "300px"
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 700, fontSize: "1.2rem", pb: 1 }}>
                    {dialogType === 'save' ? "Збереження змін" : 
                     dialogType === 'logout' ? "Вихід з акаунту" : 
                     "Скасування змін"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: "rgba(255,255,255,0.8)" }}>
                        {dialogType === 'save' ? "Ви дійсно бажаєте зберегти нові дані?" : 
                         dialogType === 'logout' ? "Ви впевнені, що хочете вийти з системи?" : 
                         "У вас є незбережені зміни. Ви впевнені, що хочете їх скасувати?"}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2, justifyContent: "center", gap: 1 }}>
                    <Button 
                        onClick={() => setDialogType(null)} variant="outlined"
                        sx={{ 
                            color: "white", borderColor: "rgba(255,255,255,0.3)", borderRadius: "10px",
                            textTransform: "none", "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" }
                        }}
                    >
                        Ні, повернутись
                    </Button>
                    <Button 
                        onClick={handleConfirmDialog} variant="contained" autoFocus
                        sx={{ 
                            bgcolor: dialogType === 'save' ? "#4CAF50" : "#FF3D00", borderRadius: "10px",
                            textTransform: "none", fontWeight: 700,
                            "&:hover": { bgcolor: dialogType === 'save' ? "#388E3C" : "#d32f2f" }
                        }}
                    >
                        {dialogType === 'save' ? "Так, зберегти" : 
                         dialogType === 'logout' ? "Так, вийти" : "Так, скасувати"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar 
                open={snackbar.open} autoHideDuration={4000} 
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled"
                    sx={{ width: '100%', borderRadius: "10px", fontWeight: 600 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default UserProfile;