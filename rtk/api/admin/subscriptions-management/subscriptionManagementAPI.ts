import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../baseApi";
import { PAGINATION_CONFIG } from "../../../../config/pagination.config";

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

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type SubscriptionPlanResponseData = {
  data: SubscriptionPlan[];
  pagination: Pagination;
};

export type SubscriptionsAPIResponse = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: SubscriptionPlan[];
};

export type TCreateSubscription = {
  name: string;
  price_pence: number;
  max_vehicles: number;
  max_bookings_per_month: number;
  description?: string;
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

    // Get a subscription by ID
    getASubscription: builder.query<SubscriptionPlan, string | undefined>({
      query: (id) => ({
        url: `/api/admin/subscription/plans/${id}`,
        method: "GET",
      }),
      providesTags: ["all-subscriptions"],
    }),
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
    createASubscription: builder.mutation<
      SubscriptionPlan,
      Partial<TCreateSubscription>
    >({
      query: (body) => ({
        url: `/api/admin/subscription/plans`,
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
  }),
});

export const {
  useGetAllSubscriptionsQuery,
  useGetASubscriptionQuery,
  useCreateASubscriptionMutation,
  //   useCreateGarageMutation,
  //   useUpdateGarageMutation,
  //   useDeleteGarageMutation,
} = subscriptionsManagementApi;
