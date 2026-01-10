import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../baseApi";
import { PAGINATION_CONFIG } from "../../../../config/pagination.config";

export type Driver = {
  id: string;
  created_at: string;
  updated_at: string;
  status: number;
  approved_at: string | null;
  availability: string | null;
  email: string;
  username: string | null;
  name: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  state: string | null;
  zip_code: string | null;
  gender: string | null;
  vehicle_registration_number: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
};
export type TDriverDetails = {
  id: string;
  name: string;
  email: string;
  phone_number: string | null;
  status: number;
  created_at: string;
  approved_at: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zip_code: string | null;
  date_of_birth: string | null;
  gender: string | null;
  vehicles: any[];
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type VehicleUser = {
  id: string;
  name: string;
  email: string;
  phone_number: string | null;
  status?: number;
  created_at?: string;
  approved_at?: string | null;
};

export type Vehicle = {
  id: string;
  registration_number: string;
  make: string;
  model: string;
  color: string;
  mot_expiry_date: string;
  user: VehicleUser;
  created_at?: string;
  updated_at?: string;
};

export type DriversResponseData = {
  drivers: Driver[];
  pagination: Pagination;
};

export type DriversAPIResponse = {
  success: boolean;
  data: DriversResponseData;
};
export type TDriversDetailsAPIResponse = {
  success: boolean;
  data: TDriverDetails;
};

export const driversApi = createApi({
  reducerPath: "driversApi",
  baseQuery,
  tagTypes: ["Drivers"],
  endpoints: (builder) => ({
    // GET ALL DRIVERS
    getAllDrivers: builder.query<
      DriversAPIResponse,
      {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        startdate?: string;
        enddate?: string;
      }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();

        // optional filters
        if (params.search) queryParams.append("search", params.search);
        if (params.status) queryParams.append("status", params.status);

        // date filters
        if (params.startdate) queryParams.append("startdate", params.startdate);
        if (params.enddate) queryParams.append("enddate", params.enddate);

        // pagination
        queryParams.append(
          "page",
          (params.page || PAGINATION_CONFIG.DEFAULT_PAGE).toString()
        );

        queryParams.append(
          "limit",
          (params.limit || PAGINATION_CONFIG.DEFAULT_LIMIT).toString()
        );

        return {
          url: `/api/admin/driver?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Drivers"],
      keepUnusedDataFor: 0,
    }),

    // Get a driver details
    getADriverDetails: builder.query<TDriversDetailsAPIResponse, string>({
      query: (id) => ({
        url: `/api/admin/driver/${id}`,
        method: "GET",
      }),
      providesTags: ["Drivers"],
    }),

    // Delete a driver
    deleteDriver: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/api/admin/user/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Drivers"],
    }),
  }),
});

export const {
  useGetAllDriversQuery,
  useGetADriverDetailsQuery,
  useDeleteDriverMutation,
} = driversApi;
