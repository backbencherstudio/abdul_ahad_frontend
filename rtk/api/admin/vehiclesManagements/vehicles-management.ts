import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../baseApi";
import { PAGINATION_CONFIG } from "../../../../config/pagination.config";

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

export type VehiclesResponseData = {
  vehicles: Vehicle[];
  pagination: Pagination;
};

export type VehiclesAPIResponse = {
  success: boolean;
  data: VehiclesResponseData;
};

export type TVehicleDetails = {
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

export type TVehicleDetailsAPIResponse = {
  success: boolean;
  data: TVehicleDetails;
};

export const vehiclesApi = createApi({
  reducerPath: "vehiclesApi",
  baseQuery,
  tagTypes: ["Vehicles", "AutoReminderSettings"],
  endpoints: (builder) => ({
    // GET ALL VEHICLES
    getAllVehicles: builder.query<
      VehiclesAPIResponse,
      {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        startdate?: string;
        enddate?: string;
        sort_by_expiry?: "asc" | "desc";
        expiry_status?: "all" | "expired" | "expired_soon" | "not_expired";
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

        // sort and expiry status filters
        if (params.sort_by_expiry) queryParams.append("sort_by_expiry", params.sort_by_expiry);
        if (params.expiry_status) queryParams.append("expiry_status", params.expiry_status);

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
          url: `/api/admin/vehicle?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Vehicles"],
      // cache tags
      keepUnusedDataFor: 0,
    }),

    // Get a vehicle details
    getAVehicleDetails: builder.query<
      TVehicleDetailsAPIResponse,
      string
    >({
      query: (id) => ({
        url: `/api/admin/vehicle/${id}`,
        method: "GET",
      }),
      providesTags: ["Vehicles"],
      // cache tags
      keepUnusedDataFor: 0,
    }),


    // detele /api/admin/vehicle/:vehicleId
    deleteVehicle: builder.mutation<any, string>({
      query: (id) => ({
        url: `/api/admin/vehicle/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Vehicles"],
    }),
 
    // auto reminder api patch /api/admin/vehicle/reminder-settings
    patchAutoReminderSettings: builder.mutation<
      any,
      { reminderPeriods: number[]; autoReminder: boolean; reminderMessage: string }
    >({
      query: (body) => ({
        url: `/api/admin/vehicle/reminder-settings`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["AutoReminderSettings"],
    }),

    // get auto reminder settings api /api/admin/vehicle/reminder-settings
    getAutoReminderSettings: builder.query<any, void>({
      query: () => ({
        url: `/api/admin/vehicle/reminder-settings`,
        method: "GET",
      }),
      providesTags: ["AutoReminderSettings"],
      keepUnusedDataFor: 0,
    }), 

  }),
});

export const {
  useGetAllVehiclesQuery,
  useGetAVehicleDetailsQuery,
  useDeleteVehicleMutation,
  usePatchAutoReminderSettingsMutation,
  useGetAutoReminderSettingsQuery,
} = vehiclesApi;
