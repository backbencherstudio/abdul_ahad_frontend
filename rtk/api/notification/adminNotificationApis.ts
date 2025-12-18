import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../baseApi";

// Admin notifications: /api/admin/notifications

export const adminNotificationApis = createApi({
  reducerPath: "adminNotificationApis",
  baseQuery,
  tagTypes: ["AdminNotifications"],
  endpoints: (builder) => ({
    getNotifications: builder.query<any, void>({
      query: () => ({
        url: "/api/admin/notifications",
        method: "GET",
      }),
      providesTags: ["AdminNotifications"],
      keepUnusedDataFor: 0,
    }),
    getUnreadCount: builder.query<any, void>({
      query: () => ({
        url: "/api/admin/notifications/unread-count",
        method: "GET",
      }),
      providesTags: ["AdminNotifications"],
      keepUnusedDataFor: 0,
    }),
    readAllNotifications: builder.mutation<any, void>({
      query: () => ({
        url: "/api/admin/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["AdminNotifications"],
    }),
    readNotification: builder.mutation<any, string>({
      query: (id) => ({
        url: `/api/admin/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["AdminNotifications"],
    }),
  }),
});

export const {
  useGetNotificationsQuery: useGetAdminNotificationsQuery,
  useGetUnreadCountQuery: useGetAdminUnreadCountQuery,
  useReadAllNotificationsMutation: useAdminReadAllNotificationsMutation,
  useReadNotificationMutation: useAdminReadNotificationMutation,
} = adminNotificationApis;