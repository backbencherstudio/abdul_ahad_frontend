import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../baseApi";
import { PAGINATION_CONFIG } from "../../../../config/pagination.config";

export type Garage = {
  id: string;
  garage_name: string;
  email: string;
  phone_number: string;
  address: string | null;
  status: number; // 0 or 1
  created_at: string;
  approved_at: string | null;
  vts_number: string;
  primary_contact: string;
};
export type SingleGarage = {
  id: string;
  garage_name: string;
  email: string;
  phone_number: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zip_code: string | null;
  status: number; // 0 = inactive, 1 = active
  created_at: string;
  approved_at: string | null;
  vts_number: string;
  primary_contact: string;
};

export type IAGarageResponse = {
  data: SingleGarage;
  pagination: Pagination;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type GaragesResponseData = {
  garages: Garage[];
  pagination: Pagination;
};

export type GaragesAPIResponse = {
  success: boolean;
  data: GaragesResponseData;
};

export const garagesApi = createApi({
  reducerPath: "garagesApi",
  baseQuery,
  tagTypes: ["Garages"],
  endpoints: (builder) => ({
    // Get all garages
    getAllGarages: builder.query<
      GaragesAPIResponse,
      { page?: number; limit?: number; status?: string; search?: string }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();

        if (params.status) queryParams.append("status", params.status);
        if (params.search) queryParams.append("search", params.search);

        queryParams.append(
          "page",
          (params.page || PAGINATION_CONFIG.DEFAULT_PAGE).toString()
        );
        queryParams.append(
          "limit",
          (params.limit || PAGINATION_CONFIG.DEFAULT_LIMIT).toString()
        );

        return {
          url: `/api/admin/garage?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Garages"],
    }),

    // Get a garage by ID
    getAGarageById: builder.query<IAGarageResponse, string>({
      query: (id) => ({
        url: `/api/admin/garage/${id}`,
        method: "GET",
      }),
      providesTags: ["Garages"],
    }),

    // Update a garage
    updateGarage: builder.mutation<
      { success?: boolean; message?: string },
      { id: string; body: Partial<Garage> }
    >({
      query: ({ id, body }) => ({
        url: `/api/admin/garage/${id}/approve`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Garages"],
    }),

    // Create a garage
    createGarage: builder.mutation<Garage, Partial<Garage>>({
      query: (body) => ({
        url: `/api/admin/garage`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Garages"],
    }),

    // Delete a garage
    deleteGarage: builder.mutation<
      { success?: boolean; message?: string },
      string
    >({
      query: (id) => ({
        url: `/api/admin/garage/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Garages"],
    }),
  }),
});

export const {
  useGetAllGaragesQuery,
  useGetAGarageByIdQuery,
  useCreateGarageMutation,
  useUpdateGarageMutation,
  useDeleteGarageMutation,
} = garagesApi;
