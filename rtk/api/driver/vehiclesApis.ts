import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../baseApi";

// add vehicle  registration_number: string
export const vehiclesApis = createApi({
    reducerPath: "vehiclesApis",
    baseQuery,
    tagTypes: ["Vehicles"],
    endpoints: (builder) => ({
        addVehicle: builder.mutation<any, { registration_number: string }>({
            query: (body) => ({
                url: `/api/vehicles`,
                method: "POST",
                body,
            }),
            invalidatesTags: ["Vehicles"],
        }),
        // get vehicle api/vehicles
        getVehicles: builder.query<any, void>({
            query: () => ({
                url: `/api/vehicles`,
                method: "GET",
            }),
            providesTags: ["Vehicles"],
        }),

        // delete vehicle api/vehicles/:id
        deleteVehicle: builder.mutation<any, string>({
            query: (id) => ({
                url: `/api/vehicles/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Vehicles"],
        }),

    }),
});

export const { useAddVehicleMutation, useGetVehiclesQuery, useDeleteVehicleMutation } = vehiclesApis;