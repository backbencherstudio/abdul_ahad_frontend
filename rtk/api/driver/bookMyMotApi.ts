import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../baseApi";

// search vehicles and garages pass in body registrationNumber and postcode
export const bookMyMotApi = createApi({
    reducerPath: "bookMyMotApi",
    baseQuery,
    tagTypes: ["BookMyMot"],
    endpoints: (builder) => ({
        searchVehiclesAndGarages: builder.query<any, { registrationNumber: string; postcode: string }>({
            query: (body) => ({
                url: `/api/vehicles/search-garages`,
                method: "POST",
                body,
            }),
            providesTags: ["BookMyMot"],
        }),
    }),
});

export const { useSearchVehiclesAndGaragesQuery } = bookMyMotApi;