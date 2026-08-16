import {
  getNotifications as apiGetNotifications,
  markNotificationRead as apiMarkNotificationRead,
  type ApiNotification,
  type NotificationType,
} from "@/lib/api";
import type { Notification } from "./type";

function formatTimestamp(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function toNotification(n: ApiNotification): Notification {
  return {
    id: n.id,
    title: n.title,
    description: n.description,
    type: n.type as NotificationType,
    timestamp: formatTimestamp(n.createdAt),
    read: n.read,
  };
}

export const getNotifications = async (): Promise<Notification[]> => {
  const list = await apiGetNotifications();
  return list.map(toNotification);
};

export const markNotificationRead = async (id: string): Promise<void> => {
  await apiMarkNotificationRead(id);
};