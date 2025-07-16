import axiosClient from "@/helper/axisoClients";

interface commonResponse {
    success: boolean;
    message: string;
}


//update profile api
export const changesProfileApi = async (data: any): Promise<commonResponse> => {
    try {
        const response = await axiosClient.patch('/api/auth/update', data);
        return response.data;
    } catch (error: any) {
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        } else if (error.message) {
            throw new Error(error.message);
        } else {
            throw new Error('Failed to change profile');
        }
    }
}


