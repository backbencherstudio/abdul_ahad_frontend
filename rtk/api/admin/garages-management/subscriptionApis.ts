import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../baseApi";
import { PAGINATION_CONFIG } from "../../../../config/pagination.config";

// Types for subscription plans
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_pence: number;
  currency: string;
  max_bookings_per_month: number;
  max_vehicles: number;
  priority_support: boolean;
  advanced_analytics: boolean;
  custom_branding: boolean;
  stripe_price_id: string;
  price_formatted: string;
  features: string[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PlansResponse {
  success: boolean;
  data: {
    plans: SubscriptionPlan[];
    pagination: Pagination;
  };
}

export interface CurrentSubscription {
  id: string;
  plan_id: string;
  status: "ACTIVE" | "INACTIVE" | "CANCELLED";
  current_period_start: string;
  current_period_end: string;
  next_billing_date: string;
  can_cancel: boolean;
  created_at: string;
  subscription_type: string;
  trial_information?: {
    is_trial: boolean;
    trial_end: string;
    days_remaining: number;
    is_trial_active: boolean;
    trial_status: string;
  };
  cancellation_information?: any;
  visibility: {
    is_visible_to_drivers: boolean;
    visible_until: string | null;
  };
  plan: SubscriptionPlan;
}

export interface CurrentSubscriptionResponse {
  success: boolean;
  data: CurrentSubscription;
}

export interface CheckoutRequest {
  plan_id: string;
}

export interface CheckoutResponse {
  success: boolean;
  data: {
    checkout_url: string;
  };
}

export interface CancelRequest {
  cancel_type: "immediate" | "at_period_end";
  reason?: string;
}

export interface CancelResponse {
  success: boolean;
  message?: string;
  effective_date?: string;
  cancelled_immediately?: boolean;
}

// Subscription API endpoints
export const subscriptionApi = createApi({
  reducerPath: "subscriptionApi",
  baseQuery,
  tagTypes: ["Subscription", "Plan", "SubscriptionsMe"],
  endpoints: (builder) => ({
    // Get subscription plans
    getSubscriptionPlans: builder.query<
      PlansResponse,
      { page?: number; limit?: number }
    >({
      query: ({
        page = PAGINATION_CONFIG.DEFAULT_PAGE,
        limit = PAGINATION_CONFIG.DEFAULT_LIMIT,
      }) => ({
        url: "/api/garage-dashboard/subscription/plans",
        params: { page, limit },
      }),
      providesTags: ["Plan"],
    }),

    // Get current subscription
    getCurrentSubscription: builder.query<CurrentSubscriptionResponse, void>({
      query: () => "/api/garage-dashboard/subscription/me",
      providesTags: ["Subscription", "SubscriptionsMe"],
      keepUnusedDataFor: 300, // Keep cache for 5 minutes
    }),

    // Checkout subscription
    checkoutSubscription: builder.mutation<CheckoutResponse, CheckoutRequest>({
      query: (body) => ({
        url: "/api/garage-dashboard/subscription/checkout",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Subscription", "SubscriptionsMe"],
    }),

    // Cancel subscription
    cancelSubscription: builder.mutation<CancelResponse, CancelRequest>({
      query: (body) => ({
        url: "/api/garage-dashboard/subscription/cancel",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Subscription", "Plan", "SubscriptionsMe"],
    }),
  }),
});

export const {
  useGetSubscriptionPlansQuery,
  useGetCurrentSubscriptionQuery,
  useCheckoutSubscriptionMutation,
  useCancelSubscriptionMutation,
  util: subscriptionApiUtil,
} = subscriptionApi;
