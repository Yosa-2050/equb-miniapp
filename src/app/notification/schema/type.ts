export type NotificationType = "success" | "info" | "warning";

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
}