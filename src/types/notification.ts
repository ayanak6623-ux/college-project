export type NotificationType = 'leave' | 'employee' | 'attendance' | 'payroll' | 'system';
export type NotificationPriority = 'low' | 'medium' | 'high';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  priority?: NotificationPriority;
}
