import axiosClient from "@/helper/axisoClients";


// data type
interface RegisterData {
    name: string;
    garage_name?: string;
    vts_number?: string;
    primary_contact?: string;
    email: string;
    phone_number: string;
    password: string;
    type: string;
}

// register api
export const registerApi = async (data: RegisterData) => {
    try {
        const response = await axiosClient.post('/api/auth/register', data);
        return response.data;
    } catch (error: any) {
        if (error.response?.data?.message?.message) {
            throw new Error(error.response.data.message.message);
        } else if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        } else {
            throw new Error('Registration failed. Please try again.');
        }
    }
}



// email verification api
export const emailVerificationApi = async (data: any) => {
    try {
        const response = await axiosClient.post('/api/auth/verify-email', data);
        return response.data;
    } catch (error: any) {
        if (error.response?.data?.message?.message) {
            throw new Error(error.response.data.message.message);
        } else if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        } else {
            throw new Error('Email verification failed. Please try again.');
        }
    }
}


// resend email verification api
export const resendEmailVerificationApi = async (data: any) => {
    try {
        const response = await axiosClient.post('/api/auth/resend-verification-email', data);
        return response.data;
    } catch (error: any) {
        throw new Error('Failed to resend email verification. Please try again.');
    }
}



