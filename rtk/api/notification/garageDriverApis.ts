import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../baseApi";

// get notifications for garage and driver /api/notification /api/notification

export const garageDriverApis = createApi({
    reducerPath: "garageDriverApis",
    baseQuery,
    tagTypes: ["GarageDriverNotifications"],
    endpoints: (builder) => ({
        getNotifications: builder.query<any, void>({
            query: () => ({
                url: "/api/notification",
                method: "GET",
            }),
            providesTags: ["GarageDriverNotifications"],
            keepUnusedDataFor: 0,
        }),
        //    /api/notification/unread-count
        getUnreadCount: builder.query<any, void>({
            query: () => ({
                url: "/api/notification/unread-count",
                method: "GET",
            }),
            providesTags: ["GarageDriverNotifications"],
            keepUnusedDataFor: 0,
        }),

        // /api/notification/read-all
        readAllNotifications: builder.mutation<any, void>({
            query: () => ({
                url: "/api/notification/read-all",
                method: "PATCH",
            }),
            invalidatesTags: ["GarageDriverNotifications"],
        }),

        // /api/notification/:id/read
        readNotification: builder.mutation<any, string>({
            query: (id) => ({
                url: `/api/notification/${id}/read`,
                method: "PATCH",
            }),
            invalidatesTags: ["GarageDriverNotifications"],
        }),

        // delete all notification  
        deleteAllNotifications: builder.mutation<any, void>({
            query: () => ({
                url: `/api/notification/all`,
                method: "DELETE",
            }),
            invalidatesTags: ["GarageDriverNotifications"],
        }),

        // delete one notification   /api/notification/:id
        deleteNotification: builder.mutation<any, string>({
            query: (id) => ({
                url: `/api/notification/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["GarageDriverNotifications"],
        }),
    }),
});

export const { useGetNotificationsQuery, useGetUnreadCountQuery, useReadAllNotificationsMutation, useReadNotificationMutation, useDeleteAllNotificationsMutation, useDeleteNotificationMutation } = garageDriverApis;