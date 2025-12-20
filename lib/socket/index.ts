import { AppConfig } from "@/config/app.config";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * Initialize a singleton socket.io client with query parameters.
 * Safe on server (returns null).
 */
export const initSocket = (
  token?: string | null,
  userId?: string | null
): Socket | null => {
  if (typeof window === "undefined") return null;

  if (socket) {
    return socket;
  }

  const socketUrl = AppConfig().app.url;

  socket = io(socketUrl, {
    transports: ["websocket"],
    query: {
      token: token || "",
      userId: userId || "",
    },
  });

  return socket;
};

/**
 * Get existing socket instance if initialized.
 */
export const getSocket = (): Socket | null => socket;

/**
 * Disconnect and clear socket instance.
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Common notification event keys
export const NotificationEvents = {
  DRIVER: "notification:driver",
  GARAGE: "notification:garage",
  ADMIN: "notification:admin",
  GENERIC: "notification",
} as const;

export type NotificationEventKey =
  (typeof NotificationEvents)[keyof typeof NotificationEvents];



