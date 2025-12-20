import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../baseApi";
import { ApiResponse } from "./api";

export interface PricingService {
  id?: string;
  created_at?: string;
  updated_at?: string;
  garage_id?: string;
  name: string;
  type: "MOT" | "RETEST" | "ADDITIONAL";
  price: string | number | null;
  userId?: string | null;
}

export interface PricingResponsePayload {
  mot: PricingService;
  retest: PricingService;
  additionals: PricingService[];
}

export interface CreatePricingRequest {
  mot: { name: string; price: number };
  retest: { name: string; price: number };
  additionals: { name: string }[];
}

export interface CreatePricingResponse {
  success: boolean;
  message: string;
  data: PricingResponsePayload;
}

export const pricingApi = createApi({
  reducerPath: "pricingApi",
  baseQuery,
  tagTypes: ["Pricing"],
  endpoints: (builder) => ({
    createPricing: builder.mutation<CreatePricingResponse, CreatePricingRequest>(
      {
        query: (body) => ({
          url: "/api/garage-dashboard/service-price",
          method: "POST",
          body,
        }),
        invalidatesTags: ["Pricing"],
      }
    ),
    // get pricing /api/garage-dashboard/service-price
    getPricing: builder.query<PricingResponsePayload, void>({
      query: () => "/api/garage-dashboard/services",
      transformResponse: (response: any): PricingResponsePayload => {
        // API returns: { success: true, data: [...] } where data is an array of services
        const servicesArray = response?.data || response || [];
        
        // Find MOT service
        const motService = servicesArray.find((s: PricingService) => s.type === "MOT");
        // Find RETEST service
        const retestService = servicesArray.find((s: PricingService) => s.type === "RETEST");
        // Find all ADDITIONAL services
        const additionalServices = servicesArray.filter((s: PricingService) => s.type === "ADDITIONAL");
        
        // Return with safe defaults if fields are missing
        return {
          mot: motService || { name: "MOT Test", price: null, type: "MOT" },
          retest: retestService || { name: "MOT Retest", price: null, type: "RETEST" },
          additionals: additionalServices || [],
        };
      },
      providesTags: ["Pricing"],
    }),
    //delete service /garage-dashboard/services/:id
    deleteService: builder.mutation<ApiResponse, string>({
      query: (id) => ({
        url: `/api/garage-dashboard/services/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Pricing"],
    }),
  }),

});

export const { useCreatePricingMutation, useGetPricingQuery, useDeleteServiceMutation } = pricingApi;
