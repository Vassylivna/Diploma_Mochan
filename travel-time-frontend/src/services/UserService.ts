import axiosClient from '../api/axiosClient';
import { 
    User, 
    LoginRequest, 
    RegisterRequest, 
    UpdateProfileRequest, 
    UpdatePasswordRequest, 
    UpdateUserRequest 
} from '../types/user.types';
import { PageResponse } from '../types/pagination.types';

const USER_ID_KEY = 'app_current_user_id';
const ROLE_KEY = 'app_user_role';

export const UserService = {
    
    login: async (data: LoginRequest): Promise<User> => {
        const response = await axiosClient.post<User>('/auth/login', data);
        const user = response.data;
        
        if (user && user.userId) {
            localStorage.setItem(USER_ID_KEY, user.userId.toString());
            localStorage.setItem(ROLE_KEY, user.role);
        }
        return user;
    },

    register: async (data: RegisterRequest): Promise<User> => {
        const response = await axiosClient.post<User>('/auth/register', data);
        const user = response.data;
        
        if (user && user.userId) {
            localStorage.setItem(USER_ID_KEY, user.userId.toString());
            localStorage.setItem(ROLE_KEY, user.role);
        }
        return user;
    },

    logout: async () => {
        try {
            await axiosClient.post('/auth/logout');
        } catch (error) {
            console.error("Помилка при логауті на бекенді", error);
        } finally {
            localStorage.removeItem(USER_ID_KEY);
            localStorage.removeItem(ROLE_KEY);
        }
    },

    getCurrentUserId: (): number | null => {
        const id = localStorage.getItem(USER_ID_KEY);
        return id ? Number(id) : null;
    },

    getProfile: async (): Promise<User> => {
        const { data } = await axiosClient.get<User>('/users/current-user');
        return data;
    },

    updateProfile: async (phoneNumber: string): Promise<User> => {
        const payload: UpdateProfileRequest = { phoneNumber };
        const { data } = await axiosClient.patch<User>('/users/current-user', payload);
        return data;
    },

    changePassword: async (req: UpdatePasswordRequest): Promise<void> => {
        await axiosClient.post('/users/current-user/password', req);
    },

    getPaginatedUsers: async (
        page: number, 
        size: number, 
        search: string = '', 
        role: string = 'all', 
        status: string = 'all',
        startDate?: string, 
        endDate?: string  
    ) => {
        const params = {
            page: page - 1, 
            size,
            search: search || undefined,
            role: role !== 'all' ? role : undefined,
            status: status !== 'all' ? status : undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            sort: 'userId,asc'
        };
        const { data } = await axiosClient.get<PageResponse<User>>('/users', { params });
        return data;
    },

    updateUserByAdmin: async (id: number, data: UpdateUserRequest): Promise<User> => {
        const response = await axiosClient.patch<User>(`/users/${id}`, data);
        return response.data;
    },

    deleteUser: async (id: number): Promise<void> => {
        await axiosClient.delete(`/users/${id}`);
    }
};