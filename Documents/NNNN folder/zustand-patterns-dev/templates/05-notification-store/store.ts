import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type NotificationType = "info" | "success" | "warning" | "error";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  read: boolean;
  createdAt: Date;
  actionLabel?: string;
  actionUrl?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
}

interface NotificationActions {
  addNotification: (notification: Omit<Notification, "id" | "read" | "createdAt">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  fetchNotifications: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState & NotificationActions>()(
  devtools(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isLoading: false,

      addNotification: (notification) => {
        const id = Math.random().toString(36).slice(2);
        const newNotif: Notification = {
          ...notification,
          id,
          read: false,
          createdAt: new Date(),
        };
        set((s) => ({
          notifications: [newNotif, ...s.notifications],
          unreadCount: s.unreadCount + 1,
        }), false, "notifications/add");
      },

      markAsRead: (id) => {
        set((s) => {
          const updated = s.notifications.map((n) =>
            n.id === id && !n.read ? { ...n, read: true } : n
          );
          const unread = updated.filter((n) => !n.read).length;
          return { notifications: updated, unreadCount: unread };
        }, false, "notifications/markRead");
      },

      markAllAsRead: () => {
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }), false, "notifications/markAllRead");
      },

      removeNotification: (id) => {
        set((s) => {
          const updated = s.notifications.filter((n) => n.id !== id);
          return { notifications: updated, unreadCount: updated.filter((n) => !n.read).length };
        }, false, "notifications/remove");
      },

      clearAll: () => set({ notifications: [], unreadCount: 0 }, false, "notifications/clearAll"),

      fetchNotifications: async () => {
        set({ isLoading: true }, false, "notifications/fetchStart");
        try {
          const res = await fetch("/api/notifications");
          if (!res.ok) throw new Error("Failed to fetch notifications");
          const data: Notification[] = await res.json();
          set({
            notifications: data,
            unreadCount: data.filter((n) => !n.read).length,
            isLoading: false,
          }, false, "notifications/fetchSuccess");
        } catch (err) {
          set({ isLoading: false }, false, "notifications/fetchError");
          console.error("Failed to fetch notifications:", err);
        }
      },
    }),
    { name: "NotificationStore" }
  )
);

export const selectUnreadNotifications = (s: NotificationState) =>
  s.notifications.filter((n) => !n.read);
export const selectRecentNotifications = (count = 5) => (s: NotificationState) =>
  s.notifications.slice(0, count);
