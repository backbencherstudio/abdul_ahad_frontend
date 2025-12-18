"use client";

import { useEffect, useCallback } from "react";
import {
  useGetAdminNotificationsQuery,
  useGetAdminUnreadCountQuery,
  useAdminReadAllNotificationsMutation,
  useAdminReadNotificationMutation,
  adminNotificationApis,
} from "@/rtk/api/notification/adminNotificationApis";
import {
  initSocket,
  NotificationEvents,
} from "@/lib/socket/index";
import { useAuth } from "@/hooks/useAuth";
import { NotificationManager } from "@/lib/NotificationManager/NotificationManager";
import { useAppDispatch } from "@/rtk";

export const useAdminNotifications = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();

  const shouldSkip = !user || user.type !== "ADMIN";

  const {
    data: notifications,
    refetch: refetchNotifications,
    isLoading: isLoadingNotifications,
  } = useGetAdminNotificationsQuery(undefined, {
    skip: shouldSkip,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  const {
    data: unreadCountData,
    refetch: refetchUnreadCount,
    isLoading: isLoadingUnread,
  } = useGetAdminUnreadCountQuery(undefined, {
    skip: shouldSkip,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  const [readAllNotifications, { isLoading: isMarkingAllRead }] =
    useAdminReadAllNotificationsMutation();
  const [readNotification, { isLoading: isMarkingOneRead }] =
    useAdminReadNotificationMutation();

  const handleSocketNotification = useCallback(
    (payload: any) => {
      dispatch(
        adminNotificationApis.util.invalidateTags(["AdminNotifications"])
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

    const setupListeners = () => {
      socket.on(NotificationEvents.ADMIN, handleSocketNotification);
      socket.on(NotificationEvents.GENERIC, handleSocketNotification);
    };

    if (socket.connected) {
      setupListeners();
    } else {
      socket.once("connect", setupListeners);
    }

    return () => {
      socket.off(NotificationEvents.ADMIN, handleSocketNotification);
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
