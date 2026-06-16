import { useNavigate } from 'react-router-dom';
import * as Yup from "yup";
import { UserService } from '../services/UserService';
import { LoginRequest, RegisterRequest } from '../types/user.types';

export const useLogin = (setAuthRole: (role: 'admin' | 'user' | 'guide') => void) => {
    const navigate = useNavigate();
    

    const initialValues: LoginRequest = { email: "", password: "" };

    const validationSchema = Yup.object({
        email: Yup.string()
            .matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/, "Дозволено лише @gmail.com") 
            .required("Введіть пошту"),
        password: Yup.string()
            .min(6, "Пароль занадто короткий")
            .required("Введіть пароль"),
    });

    const handleLoginSubmit = async (values: LoginRequest, { setSubmitting }: any) => {
        try {
            const user = await UserService.login(values);

            if (user.accountStatus === 'BLOCKED') {
                UserService.logout(); 
                return;
            }

            const role = user.role.toLowerCase() as 'admin' | 'user' | 'guide';
            setAuthRole(role);

            if (role === 'guide') {
                navigate("/guide/dashboard");
            } else if (role === 'admin') {
                navigate("/admin/dashboard");
            } else {
                navigate("/");
            }

        } catch (error) {
        } finally {
            setSubmitting(false);
        }
    };

    return { initialValues, validationSchema, handleLoginSubmit };
};

export const useRegister = (setAuthRole: (role: 'admin' | 'user' | 'guide') => void) => {
    const navigate = useNavigate();

    const initialValues: RegisterRequest = {
        firstName: "",
        lastName: "",
        middleName: "",
        birthDate: "",
        email: "",
        password: "",
        phoneNumber: "" 
    };

    const validationSchema = Yup.object({
        lastName: Yup.string()
            .matches(/^[a-zA-Zа-яА-ЯіІїЇєЄґҐ'\-]+$/, "Лише літери")
            .required("Введіть прізвище"),
        firstName: Yup.string()
            .matches(/^[a-zA-Zа-яА-ЯіІїЇєЄґҐ'\-]+$/, "Лише літери")
            .required("Введіть ім'я"),
        middleName: Yup.string()
            .matches(/^[a-zA-Zа-яА-ЯіІїЇєЄґҐ'\-]+$/, "Лише літери")
            .nullable(),
        phoneNumber: Yup.string()
            .transform((value) => value.replace(/[^\d]/g, "")) 
            .length(9, "Має бути 9 цифр (після +380)")
            .required("Введіть номер"),
        birthDate: Yup.string().required("Оберіть дату"),
        email: Yup.string()
            .matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/, "Дозволено лише @gmail.com")
            .required("Введіть email"),
        password: Yup.string()
            .min(6, "Мінімум 6 символів")
            .required("Введіть пароль"),
    });

    const formatPhoneNumber = (value: string) => {
        const numbers = value.replace(/\D/g, "").slice(0, 9);
        let formatted = "";
        if (numbers.length > 0) formatted += numbers.substring(0, 2);
        if (numbers.length > 2) formatted += "-" + numbers.substring(2, 5);
        if (numbers.length > 5) formatted += "-" + numbers.substring(5, 7);
        if (numbers.length > 7) formatted += "-" + numbers.substring(7, 9);
        return formatted;
    };

    const handleRegisterSubmit = async (values: RegisterRequest, { setSubmitting }: any) => {
        try {
            const cleanPhone = values.phoneNumber.replace(/\D/g, "");
            
            const payload: RegisterRequest = {
                firstName: values.firstName,
                lastName: values.lastName,
                middleName: values.middleName,
                birthDate: values.birthDate,
                email: values.email,
                password: values.password,
                phoneNumber: `+380${cleanPhone}`
            };

            const user = await UserService.register(payload);

            const role = user.role.toLowerCase() as 'admin' | 'user' | 'guide';
            setAuthRole(role);
            navigate("/"); 

        } catch (error) {
        } finally {
            setSubmitting(false);
        }
    };

    return { 
        initialValues, 
        validationSchema, 
        formatPhoneNumber, 
        handleRegisterSubmit 
    };
};