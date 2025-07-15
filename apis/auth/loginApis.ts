import axiosClient from "@/helper/axisoClients";


// data type
interface LoginData {
    email: string;
    password: string;
    type: 'DRIVER' | 'GARAGE' | 'ADMIN';
}

interface LoginResponse {
    success: boolean;
    message: string;
    authorization: {
        token: string;
        type: string;
    };
    type: 'DRIVER' | 'GARAGE' | 'ADMIN';
}

interface AuthMeResponse {
    success: boolean;
    data: {
        id: string;
        name: string;
        email: string;
        avatar: string | null;
        address: string | null;
        phone_number: string | null;
        type: 'DRIVER' | 'GARAGE' | 'ADMIN';
        gender: string | null;
        date_of_birth: string | null;
        created_at: string;
    };
}


// driver/garage/admin login api with type
export const loginApi = async (data: LoginData): Promise<LoginResponse> => {
    try {
        const response = await axiosClient.post('/api/auth/login', data);
        return response.data;
    } catch (error: any) {
        if (error.response?.data?.message?.message) {
            throw new Error(error.response.data.message.message);
        } else if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        } else {
            throw new Error('Login failed. Please try again.');
        }
    }
}

// me api
export const AuthMeApi = async (): Promise<AuthMeResponse> => {
    try {
        const response = await axiosClient.get('/api/auth/me');
        return response.data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            throw new Error('Unauthorized - Token invalid or expired');
        }
        throw new Error('Failed to fetch user data');
    }
}