import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../baseApi";

// Admin notifications: /api/admin/notifications

export const adminNotificationApis = createApi({
  reducerPath: "adminNotificationApis",
  baseQuery,
  tagTypes: ["AdminNotifications"],
  endpoints: (builder) => ({

    // get all notification /api/admin/notifications?limit=&page=
    getNotifications: builder.query<any, { page: number; limit: number }>({
      query: ({ page, limit }) => ({
        url: "/api/admin/notifications",
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ["AdminNotifications"],
      keepUnusedDataFor: 0,
    }),
    // unread
    getUnreadCount: builder.query<any, void>({
      query: () => ({
        url: "/api/admin/notifications/unread-count",
        method: "GET",
      }),
      providesTags: ["AdminNotifications"],
      keepUnusedDataFor: 0,
    }),
    // read all
    readAllNotifications: builder.mutation<any, void>({
      query: () => ({
        url: "/api/admin/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["AdminNotifications"],
    }),
    // read 
    readNotification: builder.mutation<any, string>({
      query: (id) => ({
        url: `/api/admin/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["AdminNotifications"],
    }),
    // delete /api/admin/notifications all notifications
    deleteAllNotifications: builder.mutation<any, void>({
      query: () => ({
        url: "/api/admin/notifications/all",
        method: "DELETE",
      }),
      invalidatesTags: ["AdminNotifications"],
    }),
    // /api/admin/notifications one notification
    deleteNotification: builder.mutation<any, string>({
      query: (id) => ({
        url: `/api/admin/notifications/${id}`,
        method: "DELETE",
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
  useDeleteAllNotificationsMutation: useAdminDeleteAllNotificationsMutation,
  useDeleteNotificationMutation: useAdminDeleteNotificationMutation,
} = adminNotificationApis;