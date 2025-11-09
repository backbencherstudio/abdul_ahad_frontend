import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../baseApi";
import { PAGINATION_CONFIG } from "../../../../config/pagination.config";

export type SingleSubscription = {
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
export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  price_pence: number;
  price_formatted: string;
  currency: string;
  max_bookings_per_month: number;
  max_vehicles: number;
  priority_support: boolean;
  advanced_analytics: boolean;
  custom_branding: boolean;
  is_active: boolean;
  stripe_price_id: string;
  active_subscriptions_count: number;
  created_at: string;
  updated_at: string;
};

export type IAGarageResponse = {
  data: SingleSubscription;
  pagination: Pagination;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type SubscriptionPlanResponseData = {
  data: SingleSubscription[];
  pagination: Pagination;
};

export type SubscriptionsAPIResponse = {
  success: boolean;
  data: SubscriptionPlan[];
};

export const subscriptionsManagementApi = createApi({
  reducerPath: "allSubscriptionsApi",
  baseQuery,
  tagTypes: ["all-subscriptions"],
  endpoints: (builder) => ({
    // Get all garages
    getAllSubscriptions: builder.query<
      SubscriptionsAPIResponse,
      { page?: number; limit?: number }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();

        queryParams.append(
          "page",
          (params.page || PAGINATION_CONFIG.DEFAULT_PAGE).toString()
        );
        queryParams.append(
          "limit",
          (params.limit || PAGINATION_CONFIG.DEFAULT_LIMIT).toString()
        );

        return {
          url: `/api/admin/subscription/plans?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["all-subscriptions"],
    }),

    // Get a garage by ID
    // getAGarageById: builder.query<IAGarageResponse, string>({
    //   query: (id) => ({
    //     url: `/api/admin/garage/${id}`,
    //     method: "GET",
    //   }),
    //   providesTags: ["Garages"],
    // }),

    // Update a garage
    // updateGarage: builder.mutation<
    //   { success?: boolean; message?: string },
    //   { id: string; body: Partial<Garage> }
    // >({
    //   query: ({ id, body }) => ({
    //     url: `/api/admin/garage/${id}/approve`,
    //     method: "PATCH",
    //     body,
    //   }),
    //   invalidatesTags: ["Garages"],
    // }),

    // Create a garage
    createGarage: builder.mutation<
      SingleSubscription,
      Partial<SingleSubscription>
    >({
      query: (body) => ({
        url: `/api/admin/garage`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["all-subscriptions"],
    }),

    // Delete a garage
    // deleteGarage: builder.mutation<
    //   { success?: boolean; message?: string },
    //   string
    // >({
    //   query: (id) => ({
    //     url: `/api/admin/garage/${id}`,
    //     method: "DELETE",
    //   }),
    //   invalidatesTags: ["Garages"],
    // }),
  }),
});

export const {
  useGetAllSubscriptionsQuery,
  //   useGetAGarageByIdQuery,
  //   useCreateGarageMutation,
  //   useUpdateGarageMutation,
  //   useDeleteGarageMutation,
} = subscriptionsManagementApi;
