import axios, { AxiosError } from 'axios';
import { showGlobalSnackbar } from '../components/GlobalSnackbar';

interface ApiErrorResponse {
    status: number;
    error: string;
    message: string;
    validationErrors?: Record<string, string>;
}

const axiosClient = axios.create({
    baseURL: 'http://localhost:8081',
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true, 
});

axiosClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiErrorResponse>) => {
        const { response, config } = error;

        if (!response) {
            showGlobalSnackbar('Сервер не відповідає. Перевірте з\'єднання.', 'error');
            return Promise.reject(error);
        }

        const { status, message, validationErrors } = response.data;
        
        const isBadCredentials = message && message.toLowerCase().includes('bad credentials');
        const isLoginRequest = config?.url?.includes('/login');

        switch (status) {
            case 401:
                if (isBadCredentials || isLoginRequest) {
                    showGlobalSnackbar('Неправильно введено email або пароль', 'error');
                    break;
                }

                showGlobalSnackbar('Сесія закінчилась. Увійдіть знову.', 'warning');
                
                localStorage.removeItem('app_current_user_id');
                localStorage.removeItem('app_user_role');
                
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login'; 
                }
                break;
            case 403:
                if (isBadCredentials || isLoginRequest) {
                    showGlobalSnackbar('Неправильно введено email або пароль', 'error');
                } else {
                    showGlobalSnackbar(message || 'Доступ заборонено.', 'error');
                }
                break;
            case 404:
                showGlobalSnackbar(message || 'Дані не знайдено.', 'warning');
                break;
            case 409:
                showGlobalSnackbar(message || 'Конфлікт даних.', 'error');
                break;
            case 500:
                if (isBadCredentials || isLoginRequest) {
                    showGlobalSnackbar('Неправильно введено email або пароль', 'error');
                } else {
                    showGlobalSnackbar('Критична помилка сервера.', 'error');
                }
                break;
            case 400:
                if (!validationErrors) {
                    showGlobalSnackbar(message || 'Невірний запит.', 'error');
                }
                break;
            default:
                showGlobalSnackbar(message || 'Сталася помилка.', 'error');
        }

        return Promise.reject(error);
    }
);

export default axiosClient;