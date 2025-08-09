import type { Notification } from '@/service/Interfaces';

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
}

export interface NotificationActions {
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAll: () => void;
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface NotificationFilter {
  showUnreadOnly: boolean;
  types?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}
