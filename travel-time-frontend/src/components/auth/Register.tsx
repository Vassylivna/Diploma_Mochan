import React from "react";
import { ErrorMessage, Form, Formik } from "formik";
import { Button, TextField, Box, Typography, InputAdornment } from "@mui/material";
import { useRegister } from "../../hooks/useAuth";
import { RegisterRequest } from "../../types/user.types";

interface IRegisterProps {
  setAuthRole: (role: 'admin' | 'user' | 'guide') => void;
}

const Register: React.FC<IRegisterProps> = ({ setAuthRole }) => {
  const { 
    initialValues, validationSchema, formatPhoneNumber, handleRegisterSubmit 
  } = useRegister(setAuthRole);

  const errorStyle = { color: "#800000", fontWeight: 900, fontSize: "0.78rem", mt: 0.35, ml: 1, lineHeight: 1 };
  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      fontSize: "0.93rem", color: "white", borderRadius: "10.5px", backgroundColor: "rgba(255, 255, 255, 0.07)",
      '& fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.8)' },
      '&.Mui-focused fieldset': { borderColor: '#4facfe', borderWidth: '2px' },
    },
    '& .MuiInputBase-input': {
      padding: "8.5px 12.5px", height: "auto",
      '&.MuiInputBase-inputAdornedStart': { paddingLeft: "0px" },
      '&::-webkit-calendar-picker-indicator': { filter: 'invert(1)', cursor: 'pointer' },
      '&:-webkit-autofill': { transition: 'background-color 5000s ease-in-out 0s', WebkitTextFillColor: 'white !important', caretColor: 'white' }
    },
    '& .MuiInputBase-input::placeholder': { color: 'rgba(255, 255, 255, 0.6)', opacity: 1 },
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleRegisterSubmit}>
        {({ isSubmitting, setFieldValue, handleBlur, values }) => {
          
          const handleLetterInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, fieldName: keyof RegisterRequest) => {
             let val = e.target.value.replace(/[^a-zA-Zа-яА-ЯіІїЇєЄґҐ'\-]/g, '').replace(/^['-]+/g, '').replace(/''/g, "'").replace(/--/g, "-").replace(/-'/g, "-").replace(/'-/g, "'");
             setFieldValue(fieldName, val);
          };

          return (
            <Form>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.7 }}>
                <Box>
                  <TextField name="lastName" placeholder="Прізвище" fullWidth sx={inputStyle} value={values.lastName} onBlur={handleBlur} inputProps={{ maxLength: 150 }} onChange={(e) => handleLetterInput(e, "lastName")} />
                  <ErrorMessage name="lastName" render={msg => <Typography sx={errorStyle}>{msg}</Typography>} />
                </Box>
                <Box>
                  <TextField name="firstName" placeholder="Ім'я" fullWidth sx={inputStyle} value={values.firstName} onBlur={handleBlur} inputProps={{ maxLength: 150 }} onChange={(e) => handleLetterInput(e, "firstName")} />
                  <ErrorMessage name="firstName" render={msg => <Typography sx={errorStyle}>{msg}</Typography>} />
                </Box>
                <Box>
                  <TextField name="middleName" placeholder="По батькові" fullWidth sx={inputStyle} value={values.middleName} onBlur={handleBlur} inputProps={{ maxLength: 150 }} onChange={(e) => handleLetterInput(e, "middleName")} />
                  <ErrorMessage name="middleName" render={msg => <Typography sx={errorStyle}>{msg}</Typography>} />
                </Box>

                <Box sx={{ display: 'flex', gap: 1.1 }}>
                  <Box sx={{ flex: 1.2 }}> 
                    <TextField name="phoneNumber" placeholder="68-000-00-00" fullWidth value={values.phoneNumber} onBlur={handleBlur}
                      onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value);
                        setFieldValue("phoneNumber", formatted);
                      }}
                      sx={inputStyle}
                      InputProps={{
                        startAdornment: (<InputAdornment position="start" sx={{ mr: 1 }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}><Typography sx={{ color: 'white', fontWeight: 400, fontSize: "0.93rem", lineHeight: "1.4375em" }}>+380</Typography><Box sx={{ width: '1px', height: '16.5px', backgroundColor: 'rgba(255,255,255,0.3)', display: 'block' }} /></Box></InputAdornment>),
                      }}
                    />
                    <ErrorMessage name="phoneNumber" render={msg => <Typography sx={errorStyle}>{msg}</Typography>} />
                  </Box>
                  <Box sx={{ flex: 1 }}> 
                    <TextField name="birthDate" type="date" fullWidth sx={inputStyle} value={values.birthDate} onBlur={handleBlur}
                      onChange={(e) => { setFieldValue("birthDate", e.target.value); }}
                      inputProps={{ max: new Date().toISOString().split("T")[0], min: "1900-01-01" }}
                    />
                    <ErrorMessage name="birthDate" render={msg => <Typography sx={errorStyle}>{msg}</Typography>} />
                  </Box>
                </Box>

                <Box>
                  <TextField name="email" placeholder="Email" fullWidth sx={inputStyle} value={values.email} onBlur={handleBlur} onChange={(e) => { setFieldValue("email", e.target.value); }} />
                  <ErrorMessage name="email" render={msg => <Typography sx={errorStyle}>{msg}</Typography>} />
                </Box>
                <Box>
                  <TextField name="password" placeholder="Пароль" type="password" fullWidth sx={inputStyle} value={values.password} onBlur={handleBlur} onChange={(e) => { setFieldValue("password", e.target.value); }} />
                  <ErrorMessage name="password" render={msg => <Typography sx={errorStyle}>{msg}</Typography>} />
                </Box>

                <Button type="submit" variant="contained" fullWidth disabled={isSubmitting} sx={{ mt: 1.1, py: 1.05, fontSize: "1.03rem", fontWeight: 700, borderRadius: "10.5px", background: "linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)", boxShadow: "0 4px 15px rgba(79, 172, 254, 0.4)", textTransform: "none", '&:hover': { background: "linear-gradient(45deg, #00f2fe 0%, #4facfe 100%)" } }}>{isSubmitting ? "Реєстрація..." : "Зареєструватися"}</Button>
              </Box>
            </Form>
          );
        }}
      </Formik>
    </Box>
  );
};

export default Register;