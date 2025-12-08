import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../baseApi";

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
  }),
});

export const { useCreatePricingMutation } = pricingApi;
