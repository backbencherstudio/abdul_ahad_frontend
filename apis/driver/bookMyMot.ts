import axiosClient from "@/helper/axisoClients";

// get mot and garage list
export const getMotAndGarageList = async () => {
    try {
        const response = await axiosClient.get("/api/vehicles/search-garages");
        return response.data;
    } catch (error) {
        throw error;
    }
};

