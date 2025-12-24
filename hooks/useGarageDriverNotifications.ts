"use client";

import { useEffect, useCallback, useState } from "react";
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useReadAllNotificationsMutation,
  useReadNotificationMutation,
  useDeleteAllNotificationsMutation,
  useDeleteNotificationMutation,
  garageDriverApis,
} from "@/rtk/api/notification/garageDriverApis";
import {
  initSocket,
  NotificationEvents,
} from "@/lib/socket/index";
import { useAuth } from "@/hooks/useAuth";
import { NotificationManager } from "@/lib/NotificationManager/NotificationManager";
import { useAppDispatch } from "@/rtk";
import { toast } from "react-toastify";

export const useGarageDriverNotifications = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();

  const shouldSkip = !user || (user.type !== "DRIVER" && user.type !== "GARAGE");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [allNotifications, setAllNotifications] = useState<any[]>([]);
  const limit = 10;

  const {
    data: notificationsResponse,
    refetch: refetchNotifications,
    isLoading: isLoadingNotifications,
  } = useGetNotificationsQuery(
    { page: currentPage, limit },
    {
      skip: shouldSkip,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
    }
  );

  // Accumulate notifications when new page loads
  useEffect(() => {
    const container = notificationsResponse?.data;
    const notificationsList = container?.notifications;

    if (notificationsList && Array.isArray(notificationsList)) {
      const newNotifications = notificationsList;
      if (currentPage === 1) {
        // First page - replace all notifications
        setAllNotifications(newNotifications);
      } else {
        // Subsequent pages - append new notifications, avoiding duplicates
        setAllNotifications((prev) => {
          const existingIds = new Set(prev.map((n: any) => n.id));
          const uniqueNew = newNotifications.filter(
            (n: any) => !existingIds.has(n.id)
          );
          return [...prev, ...uniqueNew];
        });
      }
    }
  }, [notificationsResponse, currentPage]);

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
  const [deleteAllNotifications, { isLoading: isDeletingAll }] =
    useDeleteAllNotificationsMutation();
  const [deleteNotification, { isLoading: isDeletingOne }] =
    useDeleteNotificationMutation();

  const handleSocketNotification = useCallback(
    (payload: any) => {
      dispatch(
        garageDriverApis.util.invalidateTags(["GarageDriverNotifications"])
      );

      if (!shouldSkip) {
        // Reset to first page and refetch when new notification arrives
        setCurrentPage(1);
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

  const handleDeleteAll = async () => {
    try {
      await deleteAllNotifications().unwrap();

      // Reset pagination and clear notifications
      setCurrentPage(1);
      setAllNotifications([]);

      // Invalidate cache to refetch data
      dispatch(
        garageDriverApis.util.invalidateTags(["GarageDriverNotifications"])
      );

      // Refetch to update UI immediately
      await Promise.all([refetchNotifications(), refetchUnreadCount()]);

    } catch (error) {
      toast.error("Failed to clear notifications", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  const handleDeleteOne = async (id: string) => {
    try {
      await deleteNotification(id).unwrap();

      // Remove from local state immediately for better UX
      setAllNotifications((prev) => prev.filter((n: any) => n.id !== id));

      // Invalidate cache to refetch data
      dispatch(
        garageDriverApis.util.invalidateTags(["GarageDriverNotifications"])
      );

      // Refetch to update UI immediately
      await Promise.all([refetchNotifications(), refetchUnreadCount()]);

    } catch (error) {
      toast.error("Failed to delete notification", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  // Check if there are more notifications to load
  const pagination = notificationsResponse?.data?.pagination;
  const hasMore = pagination
    ? pagination.page < pagination.pages
    : false;

  const loadMore = () => {
    if (hasMore && !isLoadingNotifications) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return {
    notifications: allNotifications,
    unreadCount,
    isLoading:
      isLoadingNotifications || isLoadingUnread || isMarkingAllRead || isMarkingOneRead || isDeletingAll || isDeletingOne,
    markAllRead: handleMarkAllRead,
    markOneRead: handleMarkOneRead,
    deleteAll: handleDeleteAll,
    deleteOne: handleDeleteOne,
    hasMore,
    loadMore,
  };
};
