"use client";

import { useEffect, useCallback } from "react";
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useReadAllNotificationsMutation,
  useReadNotificationMutation,
  garageDriverApis,
} from "@/rtk/api/notification/garageDriverApis";
import {
  initSocket,
  NotificationEvents,
} from "@/lib/socket/index";
import { useAuth } from "@/hooks/useAuth";
import { NotificationManager } from "@/lib/NotificationManager/NotificationManager";
import { useAppDispatch } from "@/rtk";

export const useGarageDriverNotifications = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();

  const shouldSkip = !user || (user.type !== "DRIVER" && user.type !== "GARAGE");

  const {
    data: notifications,
    refetch: refetchNotifications,
    isLoading: isLoadingNotifications,
  } = useGetNotificationsQuery(undefined, {
    skip: shouldSkip,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  const {
    data: unreadCountData,
    refetch: refetchUnreadCount,
    isLoading: isLoadingUnread,
  } = useGetUnreadCountQuery(undefined, {
    skip: shouldSkip,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  const [readAllNotifications, { isLoading: isMarkingAllRead }] =
    useReadAllNotificationsMutation();
  const [readNotification, { isLoading: isMarkingOneRead }] =
    useReadNotificationMutation();

  const handleSocketNotification = useCallback(
    (payload: any) => {
      dispatch(
        garageDriverApis.util.invalidateTags(["GarageDriverNotifications"])
      );

      if (!shouldSkip) {
        Promise.all([
          refetchNotifications(),
          refetchUnreadCount(),
        ]).catch(() => {
          setTimeout(() => {
            refetchNotifications();
            refetchUnreadCount();
          }, 500);
        });
      }

      const notificationText =
        payload?.notification_event?.text ||
        payload?.message ||
        payload?.title ||
        "New notification";

      const notificationType =
        payload?.notification_event?.type || "notification";

      if (notificationText) {
        NotificationManager.desktop().notify({
          title:
            notificationType.charAt(0).toUpperCase() +
            notificationType.slice(1),
          body: notificationText,
        });
      }
    },
    [dispatch, refetchNotifications, refetchUnreadCount, shouldSkip]
  );

  useEffect(() => {
    if (shouldSkip) return;

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const userId = user?.id || null;

    const socket = initSocket(token, userId);
    if (!socket) return;

    const event =
      user?.type === "GARAGE"
        ? NotificationEvents.GARAGE
        : NotificationEvents.DRIVER;

    const setupListeners = () => {
      socket.on(event, handleSocketNotification);
      socket.on(NotificationEvents.GENERIC, handleSocketNotification);
    };

    if (socket.connected) {
      setupListeners();
    } else {
      socket.once("connect", setupListeners);
    }

    return () => {
      socket.off(event, handleSocketNotification);
      socket.off(NotificationEvents.GENERIC, handleSocketNotification);
      socket.off("connect", setupListeners);
    };
  }, [user, handleSocketNotification, shouldSkip]);

  const unreadCount = unreadCountData?.count ?? 0;

  const handleMarkAllRead = async () => {
    await readAllNotifications().unwrap();
  };

  const handleMarkOneRead = async (id: string) => {
    await readNotification(id).unwrap();
  };

  return {
    notifications: notifications?.data ?? [],
    unreadCount,
    isLoading:
      isLoadingNotifications || isLoadingUnread || isMarkingAllRead || isMarkingOneRead,
    markAllRead: handleMarkAllRead,
    markOneRead: handleMarkOneRead,
  };
};
