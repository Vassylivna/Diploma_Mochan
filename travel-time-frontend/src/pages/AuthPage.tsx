import React from "react";
import { Box, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";
import travelBackground from '../new_logo.jpg';

interface IAuthPageProps {
    setAuthRole: (role: 'admin' | 'user' | 'guide' ) => void;
}

const AuthPage: React.FC<IAuthPageProps> = ({ setAuthRole }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const isLoginPage = location.pathname === "/login";

    return (
        <Box
            sx={{
                minHeight: "100vh",
                width: "100vw",
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${travelBackground})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: "center",
                justifyContent: "flex-start",
                px: { xs: 2, md: 12 },
                py: { xs: 4, md: 0 },
                gap: { xs: 4, md: 8 },
            }}
        >
            {/* Ліва частина: Заголовок */}
            <Box sx={{ flex: 1, textAlign: { xs: "center", md: "left" } }}>
                <Typography
                    variant="h1"
                    sx={{
                        color: "#ffffff",
                        fontWeight: 900,
                        fontFamily: "'Poppins', sans-serif",
                        fontStyle: "italic",
                        lineHeight: 1,
                        letterSpacing: "-1px",
                        textShadow: "4px 4px 15px rgba(0,0,0,0.6)",
                        fontSize: { xs: "3rem", sm: "4rem", md: "4rem", lg: "6rem" },
                        mb: 2,
                    }}
                >
                    Ласкаво просимо
                    <br />
                    <Box component="span" sx={{ color: "#4facfe" }}>до TravelTime</Box>
                </Typography>
                <Typography
                    sx={{
                        color: "rgba(255,255,255,0.8)",
                        fontSize: { xs: "1rem", sm: "1.2rem", md: "1.5rem" },
                        fontWeight: 500,
                        textShadow: "1px 1px 5px rgba(0,0,0,0.5)"
                    }}
                >
                    Ваша подорож починається тут
                </Typography>
            </Box>

            <Box
                sx={{
                    width: { xs: "100%", sm: 400, md: 450 },
                    background: "rgba(255, 255, 255, 0.12)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    borderRadius: "24px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
                    p: { xs: 3, sm: 4 },
                    display: "flex",
                    flexDirection: "column",
                    marginLeft: { md: "auto" },
                }}
            >
                <Typography
                    variant="h4"
                    sx={{
                        textAlign: "center",
                        mb: 3,
                        fontWeight: 800,
                        color: "#fff",
                        textTransform: "uppercase",
                        letterSpacing: "1px"
                    }}
                >
                    {isLoginPage ? "Авторизація" : "Реєстрація"}
                </Typography>

                <Box sx={{ "& .MuiTextField-root": { mb: 2 }, "& label": { color: "rgba(255,255,255,0.8) !important" } }}>
                    {isLoginPage ? (
                        <Login setAuthRole={setAuthRole} />
                    ) : (
                        <Register setAuthRole={setAuthRole} />
                    )}
                </Box>

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography sx={{ color: "#fff", fontSize: "1rem", fontWeight: 600 }}>
                        {isLoginPage ? "Немає акаунта?" : "Вже є акаунт?"}
                        <Box
                            component="span"
                            onClick={() => navigate(isLoginPage ? "/register" : "/login")}
                            sx={{
                                ml: 1,
                                color: "#4facfe",
                                cursor: "pointer",
                                textDecoration: "underline",
                                fontWeight: 800,
                                "&:hover": { color: "#00f2fe" }
                            }}
                        >
                            {isLoginPage ? "Створити" : "Увійти"}
                        </Box>
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default AuthPage;
