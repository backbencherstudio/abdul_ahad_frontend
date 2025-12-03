import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../baseApi";

// API Response Types
export interface ApiVehicle {
    id: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    registration_number: string;
    make: string;
    model: string;
    color: string;
    fuel_type: string;
    year_of_manufacture: number;
    engine_capacity: number;
    co2_emissions: number;
    mot_expiry_date: string;
    dvla_data: string;
    mot_data: string;
    mot_reports: any[];
}

export interface VehiclesResponse {
    success: boolean;
    message: string;
    data: ApiVehicle[];
}

export interface MotTestDefect {
    dangerous: boolean;
    text: string;
    type: string;
}

export interface MotTest {
    reportId?: string;
    registrationAtTimeOfTest: string | null;
    motTestNumber: string;
    completedDate: string;
    expiryDate: string | null;
    odometerValue: string;
    odometerUnit: string;
    odometerResultType: string;
    testResult: string;
    dataSource: string;
    defects: MotTestDefect[];
}

export interface MotReportsResponse {
    registration: string;
    make: string;
    model: string;
    primaryColour: string;
    fuelType: string;
    engineSize: string;
    firstUsedDate: string;
    registrationDate: string;
    manufactureDate: string;
    motExpiryDate: string;
    hasOutstandingRecall: string;
    motTests: MotTest[];
}

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
        getVehicles: builder.query<VehiclesResponse, void>({
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


        // get mot report /api/vehicles/cmio2vx5o0001zz0m9ew7c7ok/mot-reports
        getVehicleMotReports: builder.query<MotReportsResponse, string>({
            query: (id) => ({
                url: `/api/vehicles/${id}/mot-reports`,
                method: "GET",
            }),
            providesTags: ["Vehicles"],
        }),

    }),
});

export const { useAddVehicleMutation, useGetVehiclesQuery, useDeleteVehicleMutation, useGetVehicleMotReportsQuery } = vehiclesApis;