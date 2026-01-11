import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../baseApi";

// Garage profile type based on API response
export interface GarageProfile {
  id: string;
  garage_name: string;
  address: string;
  zip_code: string;
  email: string;
  vts_number: string;
  primary_contact: string;
  phone_number: string;
  avatar: string | null;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  updated_at: string;
  mot_price: number;
  avatar_url: string | null;
}

// get profile /api/garage-dashboard/profile
export interface ProfileResponse {
  success: boolean;
  message: string;
  data: GarageProfile;
}

export const profileApi = createApi({
  reducerPath: "profileApi",
  baseQuery,
  tagTypes: ["Profile"],
  endpoints: (builder) => ({
    getProfile: builder.query<ProfileResponse, void>({
      query: () => "/api/garage-dashboard/profile",
      providesTags: ["Profile"],
    }),
    updateProfile: builder.mutation<
      UpdateProfileResponse,
      UpdateProfileRequest | FormData
    >({
      query: (body) => ({
        url: "/api/garage-dashboard/profile",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Profile"],
    }),
  }),
});

// update profile /api/garage-dashboard/profile
export interface UpdateProfileRequest {
  garage_name: string;
  address?: string;
  zip_code?: string;
  email?: string;
  vts_number?: string;
  primary_contact?: string;
  phone_number?: string;
  avatar?: File | null | string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: GarageProfile;
}

export const { useGetProfileQuery, useUpdateProfileMutation } = profileApi;
