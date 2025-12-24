import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../baseApi";

// Contact message request interface
export interface ContactMessageRequest {
    garage_name: string;
    primary_contact_person_name: string;
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

// create contact message api
export const contactApis = createApi({
    reducerPath: "contactApis",
    baseQuery,
    tagTypes: ["ContactMessages"],
    endpoints: (builder) => ({
        createContactMessage: builder.mutation<ContactMessageResponse, ContactMessageRequest>({
            query: (body) => ({
                url: "/api/contact",
                method: "POST",
                body,
            }),
            invalidatesTags: ["ContactMessages"],
        }),
    }),
});

export const { useCreateContactMessageMutation } = contactApis;