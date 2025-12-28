import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../baseApi";
import { ApiResponse } from "./scheduleApis";

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
    // Create or Update Pricing - POST /api/garage-dashboard/service-price
    createPricing: builder.mutation<CreatePricingResponse, CreatePricingRequest>({
      query: (body) => ({
        url: "/api/garage-dashboard/service-price",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Pricing"],
    }),

    // Get All Pricing - GET /api/garage-dashboard/services
    getPricing: builder.query<PricingResponsePayload, void>({
      query: () => "/api/garage-dashboard/services",
      transformResponse: (response: any): PricingResponsePayload => {
        // API returns: { success: true, data: { mot, retest, additionals } }
        if (response?.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
          // Response is already in the correct format
          return {
            mot: response.data.mot || { name: "MOT Test", price: null, type: "MOT" },
            retest: response.data.retest || { name: "MOT Retest", price: null, type: "RETEST" },
            additionals: response.data.additionals || [],
          };
        }
        
        // Fallback: if response is an array (old format)
        const servicesArray = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
        
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
      keepUnusedDataFor: 0,
    }),

    // Delete Service - DELETE /api/garage-dashboard/services/:id
    deleteService: builder.mutation<ApiResponse, string>({
      query: (id) => ({
        url: `/api/garage-dashboard/services/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Pricing"],
    }),
  }),
});

export const { 
  useCreatePricingMutation, 
  useGetPricingQuery, 
  useDeleteServiceMutation 
} = pricingApi;
