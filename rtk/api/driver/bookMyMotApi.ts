import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../baseApi";
import { ApiResponse } from "../garage/scheduleApis";

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

export interface GarageSlotsResponse {
    slots: Slot[];
}

export interface Slot {
    id: string;
    start_time: string;
    end_time: string;
    date: string;
    status?: string[];
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
            keepUnusedDataFor: 0,
        }),

        // garage details 
        getGarageServices: builder.query<GarageServicesResponse, string>({
            query: (id) => ({
                url: `/api/vehicles/garages/${id}/services`,
                method: "GET",
            }),
            providesTags: ["BookMyMot"],
            keepUnusedDataFor: 0,
        }),

        // get garage slots
        getGarageSlots: builder.query<GarageSlotsResponse, { id: string; date: string }>({
            query: ({ id, date }) => ({
                url: `/api/vehicles/garages/${id}/slots?date=${date}`,
                method: "GET",
            }),
            transformResponse: (response: any, _meta, arg) => {
                const toSlot = (slot: any, index: number): Slot => ({
                    id:
                        slot?.id ||
                        `${slot?.date || arg.date || "date"}-${slot?.start_time || "start"}-${slot?.end_time || "end"}-${index}`,
                    start_time: slot?.start_time || "",
                    end_time: slot?.end_time || "",
                    date: slot?.date || arg.date,
                    status: slot?.status,
                });

                // Array response
                if (Array.isArray(response)) {
                    return { slots: response.map(toSlot) };
                }

                // { slots: [...] }
                if (response?.slots && Array.isArray(response.slots)) {
                    return { slots: response.slots.map(toSlot) };
                }

                // { data: [...] } or other wrapped formats
                if (response?.data && Array.isArray(response.data)) {
                    return { slots: response.data.map(toSlot) };
                }

                return { slots: [] };
            },
            providesTags: ["BookMyMot"],
            keepUnusedDataFor: 0,
        }),

        // book slot /api/vehicles/book-slot 
        bookSlot: builder.mutation<
            ApiResponse,
            {
                garage_id: string;
                vehicle_id: string;
                service_type: string;
                slot_id?: string;
                start_time?: string;
                end_time?: string;
                date?: string;
            }
        >({
            query: (body) => ({
                url: `/api/vehicles/book-slot`,
                method: "POST",
                body: body,
            }),
            invalidatesTags: ["BookMyMot"]
        }),

        // get my bookings /api/vehicles/my-bookings?search=&status=&page=&limit=  pending, accepted, rejected
        getMyBookings: builder.query<ApiResponse, { search: string; status: string; page: number; limit: number }>({
            query: ({ search, status, page, limit }) => ({
                url: `/api/vehicles/my-bookings?search=${search}&status=${status}&page=${page}&limit=${limit}`,
                method: "GET",
            }),
            transformResponse: (response: any) => {
                // API returns: { bookings: [], pagination: {}, filters: {} }
                // Wrap it in ApiResponse format
                if (response?.bookings) {
                    return {
                        success: true,
                        data: response
                    }
                }
                return response
            },
            providesTags: ["BookMyMot"],
            // casg
            keepUnusedDataFor: 0,
        }),
    }),
});

export const { useSearchVehiclesAndGaragesQuery, useGetGarageServicesQuery, useGetGarageSlotsQuery, useBookSlotMutation, useGetMyBookingsQuery } = bookMyMotApi;