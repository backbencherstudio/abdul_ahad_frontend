import axiosClient from "@/helper/axisoClients";


// data type
interface LoginData {
    email: string;
    password: string;
    type: string;
}

interface LoginResponse {
    success: boolean;
    message: string;
    authorization: {
        token: string;
        type: string;
    };
    type: string;
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
        type: string;
        gender: string | null;
        date_of_birth: string | null;
        created_at: string;
    };
}


interface commonResponse {
    success: boolean;
    message: string;
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


// forgot password api
export const forgotPasswordApi = async (email: string): Promise<commonResponse> => {
    try {
        const response = await axiosClient.post('/api/auth/forgot-password', { email });

        // Check if the response indicates failure
        if (response.data.success === false) {
            throw new Error(response.data.message || 'Failed to send reset email');
        }

        return response.data;
    } catch (error: any) {
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        } else if (error.message) {
            throw new Error(error.message);
        } else {
            throw new Error('Failed to send reset email');
        }
    }
}

// verify email api
export const verifyEmailApi = async (email: string, token: string): Promise<commonResponse> => {
    try {
        const response = await axiosClient.post('/api/auth/verify-email', { email, token });

        // Check if the response indicates failure
        if (response.data.success === false) {
            throw new Error(response.data.message || 'Failed to verify email');
        }

        return response.data;
    } catch (error: any) {
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        } else if (error.message) {
            throw new Error(error.message);
        } else {
            throw new Error('Failed to verify email');
        }
    }
}

// verify reset password api
export const verifyResetPasswordApi = async (email: string, token: string, password: string): Promise<commonResponse> => {
    try {
        const response = await axiosClient.post('/api/auth/reset-password', { email, token, password });

        // Check if the response indicates failure
        if (response.data.success === false) {
            throw new Error(response.data.message || 'Failed to reset password');
        }

        return response.data;
    } catch (error: any) {
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        } else if (error.message) {
            throw new Error(error.message);
        } else {
            throw new Error('Failed to reset password');
        }
    }
}


// resend verification email api
export const resendVerificationEmailApi = async (email: string): Promise<commonResponse> => {
    try {
        const response = await axiosClient.post('/api/auth/resend-verification-email', { email });

        // Check if the response indicates failure
        if (response.data.success === false) {
            throw new Error(response.data.message || 'Failed to resend verification email');
        }

        return response.data;
    } catch (error: any) {
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        } else if (error.message) {
            throw new Error(error.message);
        } else {
            throw new Error('Failed to resend verification email');
        }
    }
}