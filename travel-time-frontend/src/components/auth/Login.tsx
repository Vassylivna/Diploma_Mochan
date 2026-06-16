import React from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { Button, TextField, Box, Typography } from "@mui/material";
import { useLogin } from "../../hooks/useAuth";

interface ILoginProps {
  setAuthRole: (role: 'admin' | 'user' | 'guide') => void;
}

const Login: React.FC<ILoginProps> = ({ setAuthRole }) => {
  const { initialValues, validationSchema, handleLoginSubmit } = useLogin(setAuthRole);

  const errorStyle = { 
    color: "#530000ff", 
    fontWeight: 700, 
    fontSize: "1rem", 
    mt: 0.5, 
    ml: 1, 
    letterSpacing: "0.5px", 
    display: "block" 
  };

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      fontSize: "1.1rem", color: "white", borderRadius: "14px", height: "56px", backgroundColor: "rgba(255, 255, 255, 0.08)",
      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)', transition: '0.3s' },
      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.7)' },
      '&.Mui-focused fieldset': { borderColor: '#4facfe', borderWidth: '2px' },
    },
    '& .MuiInputBase-input': { '&:-webkit-autofill': { transition: 'background-color 5000s ease-in-out 0s', WebkitTextFillColor: 'white !important', caretColor: 'white' } },
    '& .MuiInputBase-input::placeholder': { color: 'rgba(255, 255, 255, 0.5)' },
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleLoginSubmit}>
        {({ isSubmitting }) => (
          <Form>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Field as={TextField} name="email" placeholder="Email" variant="outlined" fullWidth sx={inputStyle} />
                <ErrorMessage name="email" render={msg => <Typography sx={errorStyle}>{msg}</Typography>} />
              </Box>

              <Box>
                <Field as={TextField} name="password" placeholder="Пароль" type="password" variant="outlined" fullWidth sx={inputStyle} />
                <ErrorMessage name="password" render={msg => <Typography sx={errorStyle}>{msg}</Typography>} />
              </Box>

              <Button
                type="submit" variant="contained" disabled={isSubmitting}
                sx={{ 
                  py: 1.8, fontSize: "1.1rem", fontWeight: 700, borderRadius: "14px", 
                  background: "linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)", textTransform: "none", 
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)", transition: "all 0.3s ease",
                  '&:hover': { transform: "translateY(-2px)", filter: "brightness(1.1)", boxShadow: "0 12px 25px rgba(79, 172, 254, 0.4)" }
                }}
              >
                {isSubmitting ? "Перевірка..." : "Увійти"}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
      
    </Box>
  );
};

export default Login;