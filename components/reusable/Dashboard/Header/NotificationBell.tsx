"use client";

import React, { useState } from "react";
import { Bell, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useGarageDriverNotifications } from "@/hooks/useGarageDriverNotifications";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

export const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const isDriverOrGarage =
    user?.type === "DRIVER" || user?.type === "GARAGE";
  const isAdmin = user?.type === "ADMIN";

  // Use appropriate hook based on user type
  const driverGarageNotifications = useGarageDriverNotifications();
  const adminNotifications = useAdminNotifications();

  // Select the right notification data based on user type
  const {
    notifications,
    unreadCount,
    isLoading,
    markAllRead,
    markOneRead,
    deleteAll,
    deleteOne,
    hasMore,
    loadMore,
  } = isAdmin ? adminNotifications : driverGarageNotifications;

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Show notification bell for all user types
  if (!user) {
    return null;
  }

  const handleViewAll = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await markAllRead();
  };

  const handleItemClick = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    await markOneRead(id);
  };

  const handleClearAll = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDeleting(true);
    
    // Add slight delay for smooth animation
    setTimeout(async () => {
      await deleteAll();
      setIsDeleting(false);
    }, 300);
  };

  const handleDeleteOne = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDeletingId(id);
    
    // Add slight delay for smooth animation
    setTimeout(async () => {
      await deleteOne(id);
      setDeletingId(null);
    }, 300);
  };

  // Format date to relative time (e.g., "2 hours ago")
  const formatNotificationDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return new Date(dateString).toLocaleString();
    }
  };

  // Get notification text from the nested structure
  const getNotificationText = (notification: any) => {
    return notification?.notification_event?.text || notification?.message || "New notification";
  };

  // Get notification type
  const getNotificationType = (notification: any) => {
    return notification?.notification_event?.type || "general";
  };

  // Check if notification is unread
  const isUnread = (notification: any) => {
    return !notification?.read_at;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative cursor-pointer select-none border"
        >
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <DropdownMenuLabel className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <span>{isLoading ? "Loading..." : "Notifications"}</span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount} new
                </Badge>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="h-7 px-2 cursor-pointer text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </DropdownMenuLabel>

        {/* Scrollable notifications list */}
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 && !isLoading && (
            <div className="py-8 text-sm text-gray-500 text-center">
              No notifications yet
            </div>
          )}

          {notifications.map((notification: any) => {
            const notificationText = getNotificationText(notification);
            const notificationType = getNotificationType(notification);
            const isUnreadNotification = isUnread(notification);
            const isDeletingThis = deletingId === notification.id || isDeleting;

            return (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start gap-1 p-3 cursor-pointer hover:bg-gray-50 border-b relative group transition-all duration-300 ${
                  isUnreadNotification ? "bg-blue-50/50" : ""
                } ${
                  isDeletingThis ? "opacity-0 scale-95 h-0 p-0 overflow-hidden" : "opacity-100 scale-100"
                }`}
                onSelect={(e) => e.preventDefault()}
                onClick={(e) => handleItemClick(e, notification.id)}
                onMouseEnter={() => setHoveredId(notification.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="flex items-start justify-between w-full gap-2">
                  <div className="flex-1 min-w-0 pr-8">
                    {/* Notification Type Badge */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge
                        variant="outline"
                        className="text-xs capitalize border-gray-300"
                      >
                        {notificationType}
                      </Badge>
                      {isUnreadNotification && (
                        <div className="h-2 w-2 bg-blue-500 rounded-full shrink-0"></div>
                      )}
                    </div>

                    {/* Notification Text */}
                    <div className="font-medium text-sm text-gray-900 mb-1.5 wrap-break-word">
                      {notificationText}
                    </div>

                    {/* Timestamp */}
                    {notification.created_at && (
                      <div className="text-xs text-gray-400">
                        {formatNotificationDate(notification.created_at)}
                      </div>
                    )}
                  </div>

                  {/* Delete Icon - Shows on hover */}
                  {hoveredId === notification.id && (
                    <button
                      onClick={(e) => handleDeleteOne(e, notification.id)}
                      className="absolute cursor-pointer right-3 top-3 p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </DropdownMenuItem>
            );
          })}
        </div>

        {/* Footer with mark all as read and load more */}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="flex flex-col">
              {hasMore && (
                <DropdownMenuItem
                  className="text-center text-blue-600 font-medium cursor-pointer py-2.5 hover:bg-blue-50"
                  onSelect={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    loadMore();
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "More"}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-center text-[#19CA32] font-medium cursor-pointer py-2.5"
                onSelect={(e) => e.preventDefault()}
                onClick={handleViewAll}
              >
                Mark all as read
              </DropdownMenuItem>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};



