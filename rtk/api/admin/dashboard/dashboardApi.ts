import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../baseApi";

export type DashboardOverview = {
  total_garages: number;
  total_drivers: number;
  total_bookings: number;
  total_payments: number;
  active_subscriptions: number;
};

export type DashboardResponse = {
  success: boolean;
  data: {
    overview: DashboardOverview;
    last_updated: string;
  };
};

export type DashboardAnalyticsMetrics = {
  revenue: number;
  bookings: number;
  active_garages: number;
  active_drivers: number;
};

export type DashboardAnalyticsResponse = {
  success: boolean;
  data: {
    period: string;
    metrics: DashboardAnalyticsMetrics;
    charts: any[];
  };
};

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery,
  tagTypes: ["Dashboard"],
  endpoints: (builder) => ({
    getDashboardOverview: builder.query<DashboardResponse, void>({
      query: () => ({
        url: "/api/admin/dashboard",
        method: "GET",
      }),
      providesTags: ["Dashboard"],
    }),
  }),
});

export const { useGetDashboardOverviewQuery } = dashboardApi;
