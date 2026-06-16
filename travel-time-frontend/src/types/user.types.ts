
export interface User {
    userId: number;
    firstName: string;
    lastName: string;
    middleName?: string;
    birthDate: string;
    phoneNumber: string;
    email: string;
    role: 'ADMIN' | 'USER' | 'GUIDE';       
    accountStatus: 'ACTIVE' | 'BLOCKED';   
}

export interface LoginRequest {
    email: string; 
    password: string;
}

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    middleName?: string;
    birthDate: string;
    phoneNumber: string;
    email: string;
    password: string;
}

export interface UpdateProfileRequest {
    phoneNumber: string;
}

export interface UpdatePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface UpdateUserRequest {
    role?: string;
    accountStatus?: string;
    phoneNumber?: string;
}
