import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../baseApi";

// Contact message request interface
export interface ContactMessageRequest {
    name: string;
    email: string;
    phone_number: string;
    message: string;
}

// Contact message response interface
export interface ContactMessageResponse {
    success: boolean;
    message: string;
    data?: any;
}

// create contact message api for driver
export const driverContactApis = createApi({
    reducerPath: "driverContactApis",
    baseQuery,
    tagTypes: ["DriverContactMessages"],
    endpoints: (builder) => ({
        createContactMessage: builder.mutation<ContactMessageResponse, ContactMessageRequest>({
            query: (body) => ({
                url: "/api/contact",
                method: "POST",
                body,
            }),
            invalidatesTags: ["DriverContactMessages"],
        }),
    }),
});

export const { useCreateContactMessageMutation } = driverContactApis;