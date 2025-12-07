import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../baseApi";
import { PAGINATION_CONFIG } from "../../../../config/pagination.config";


// get all bookings /api/admin/booking?page=&limit=&search=&status=&startdate=&enddate=
export const bookingManagementApi = createApi({
    reducerPath: "bookingManagementApi",
    baseQuery,
    tagTypes: ["Bookings"],
    endpoints: (builder) => ({
        getAllBookings: builder.query<any, { page?: number; limit?: number; search?: string; status?: string; startdate?: string; enddate?: string }>({
            query: (params) => {
                const queryParams = new URLSearchParams();
                queryParams.append("page", (params.page || PAGINATION_CONFIG.DEFAULT_PAGE).toString());
                queryParams.append("limit", (params.limit || PAGINATION_CONFIG.DEFAULT_LIMIT).toString());
                if (params.search) queryParams.append("search", params.search);
                if (params.status) queryParams.append("status", params.status);
                if (params.startdate) queryParams.append("startdate", params.startdate);
                if (params.enddate) queryParams.append("enddate", params.enddate);
                return {
                    url: `/api/admin/booking?${queryParams.toString()}`,
                    method: "GET",
                };
            },
            providesTags: ["Bookings"],
        }),
        // single booking details /api/admin/booking/:id
        getSingleBooking: builder.query<any, string>({
            query: (id) => ({
                url: `/api/admin/booking/${id}`,
                method: "GET",
            }),
            providesTags: ["Bookings"],
        }),

        // delete a booking /api/admin/driver/:id
        deleteBooking: builder.mutation<any, string>({
            query: (id) => ({
                url: `/api/admin/booking/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Bookings"],
        }),

        // cancel a booking /api/admin/booking/:id/cancel
        cancelBooking: builder.mutation<any, string>({
            query: (id) => ({
                url: `/api/admin/booking/${id}/cancel`,
                method: "PATCH",
            }),
            invalidatesTags: ["Bookings"],
        }),
        // update a booking status /api/admin/booking/:id/status
        // pass in body status (PENDING, ACCEPTED, REJECTED, COMPLETED, CANCELLED)
        updateBookingStatus: builder.mutation<any, { id: string; status: string }>({
            query: ({ id, status }) => {
                // Ensure status is uppercase and trimmed
                const statusValue = String(status).trim().toUpperCase();
                console.log('API mutation - Status value:', statusValue, 'Original:', status);
                return {
                    url: `/api/admin/booking/${id}/status`,
                    method: "PATCH",
                    body: { status: statusValue },
                };
            },
            invalidatesTags: ["Bookings"],
        }),
    }),
});

export const { 
    useGetAllBookingsQuery,
    useGetSingleBookingQuery,
    useDeleteBookingMutation,
    useCancelBookingMutation,
    useUpdateBookingStatusMutation,
} = bookingManagementApi;