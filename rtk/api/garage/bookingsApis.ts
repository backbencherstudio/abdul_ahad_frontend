import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../baseApi";
import { Pagination } from "@/types";

// Driver interface
export interface Driver {
    id: string;
    name: string;
    email: string;
    phone_number: string;
}

// Booking interface
export interface Booking {
    id: string;
    created_at: string;
    order_date: string;
    status: string;
    total_amount: string;
    garage_id: string;
    vehicle_id: string;
    driver: Driver;
    slot: any | null;
}

// Bookings response interface
export interface BookingsResponse {
    success: boolean;
    message: string;
    data: Booking[];
    pagination: Pagination;
}

// Single booking response interface
export interface BookingResponse {
    success: boolean;
    message: string;
    data: Booking;
}

// Update status response interface
export interface UpdateStatusResponse {
    success: boolean;
    message: string;
    data: Booking;
}

export const bookingsApi = createApi({
    reducerPath: "bookingsApi",
    baseQuery,
    tagTypes: ["Bookings"],
    endpoints: (builder) => ({
        // query params search, status, page, limit 
        getBookings: builder.query<BookingsResponse, { search?: string; status?: string; page?: number; limit?: number }>({
            query: ({ search = "", status = "", page = 1, limit = 10 }) => {
                const params = new URLSearchParams();
                if (search) params.append("search", search);
                if (status) params.append("status", status);
                params.append("page", page.toString());
                params.append("limit", limit.toString());
                return `/api/garage-dashboard/bookings?${params.toString()}`;
            },
            providesTags: ["Bookings"],
        }),
        // get booking by id
        getBookingById: builder.query<BookingResponse, string>({
            query: (id) => `/api/garage-dashboard/bookings/${id}`,
            providesTags: ["Bookings"],
        }),
        // status update pass in body status
        updateBookingStatus: builder.mutation<UpdateStatusResponse, { id: string; status: string }>({
            query: ({ id, status }) => ({
                url: `/api/garage-dashboard/bookings/${id}/status`,
                method: "PATCH",
                body: { status },
            }),
            invalidatesTags: ["Bookings"],
        }),
        // reschedule booking
        rescheduleBooking: builder.mutation<
            UpdateStatusResponse,
            { booking_id: string; slot_id?: string; date?: string; start_time?: string; end_time?: string; reason?: string }
        >({
            query: (body) => ({
                url: `/api/garage-dashboard/bookings/reschedule`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: ["Bookings"],
        }),
    }),
});

export const { useGetBookingsQuery, useGetBookingByIdQuery, useUpdateBookingStatusMutation, useRescheduleBookingMutation } = bookingsApi;