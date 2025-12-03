import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../baseApi";

// Vehicle interface matching API response
export interface VehicleData {
    registration_number: string;
    make: string;
    model: string;
    color: string;
    fuel_type: string;
    mot_expiry_date: string;
    exists_in_account: boolean;
    vehicle_id: string;
}

// Garage interface matching API response
export interface GarageData {
    id: string;
    garage_name: string;
    address: string;
    postcode: string;
    vts_number: string;
    primary_contact: string;
    phone_number: string;
}

// Search request interface
export interface SearchRequest {
    registration_number: string;
    postcode: string;
}

// Search response interface
export interface SearchResponse {
    vehicle: VehicleData;
    garages: GarageData[];
    total_count: number;
    search_postcode: string;
}

// Garage Services Response interfaces
export interface GarageServiceGarage {
    id: string;
    garage_name: string;
    address: string | null;
    zip_code: string;
    vts_number: string;
    primary_contact: string;
    phone_number: string;
}

export interface ScheduleRestriction {
    type: string;
    end_time: string;
    start_time: string;
    day_of_week: number[];
    description: string;
}

export interface DailyHoursInterval {
    end_time: string;
    start_time: string;
}

export interface DailyHours {
    is_closed?: boolean;
    intervals?: DailyHoursInterval[];
    slot_duration?: number;
}

export interface Schedule {
    id: string;
    start_time: string;
    end_time: string;
    slot_duration: number;
    restrictions: ScheduleRestriction[];
    daily_hours: {
        [key: string]: DailyHours;
    };
    is_active: boolean;
}

export interface Service {
    id: string;
    name: string;
    type: string;
    price: number;
}

export interface Additional {
    id: string;
    name: string;
    type: string;
}

export interface GarageServicesResponse {
    garage: GarageServiceGarage;
    services: Service[];
    additionals: Additional[];
    schedule: Schedule;
}

// search vehicles and garages pass in body registrationNumber and postcode
export const bookMyMotApi = createApi({
    reducerPath: "bookMyMotApi",
    baseQuery,
    tagTypes: ["BookMyMot"],
    endpoints: (builder) => ({
        searchVehiclesAndGarages: builder.query<SearchResponse, SearchRequest>({
            query: (body) => ({
                url: `/api/vehicles/search-garages`,
                method: "POST",
                body: {
                    registration_number: body.registration_number,
                    postcode: body.postcode,
                },
            }),
            providesTags: ["BookMyMot"],
        }),

        // garage details 
        getGarageServices: builder.query<GarageServicesResponse, string>({
            query: (id) => ({
                url: `/api/vehicles/garages/${id}/services`,
                method: "GET",
            }),
            providesTags: ["BookMyMot"],
        }),
    }),
});

export const { useSearchVehiclesAndGaragesQuery, useGetGarageServicesQuery } = bookMyMotApi;