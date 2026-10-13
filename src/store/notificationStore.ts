import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppNotification } from '../types/notification';

interface NotificationState {
  notifications: AppNotification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'> & { timestamp?: string }) => void;
}

const initialNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Leave Request Pending',
    message: 'Sarah Jenkins applied for 1 day Vacation Leave (Family trip). Requires manager approval.',
    timestamp: '10 mins ago',
    type: 'leave',
    read: false,
    link: '/leaves',
    priority: 'high',
  },
  {
    id: 'notif-2',
    title: 'New Employee Onboarded',
    message: 'Rajesh Sharma was registered as Software Engineer in Engineering department.',
    timestamp: '45 mins ago',
    type: 'employee',
    read: false,
    link: '/employees',
    priority: 'medium',
  },
  {
    id: 'notif-3',
    title: 'October Payroll Slips Ready',
    message: 'Monthly salary slips and net pay records have been generated with updated ₹ Indian Rupee deductions.',
    timestamp: '3 hours ago',
    type: 'payroll',
    read: false,
    link: '/employees',
    priority: 'medium',
  },
  {
    id: 'notif-4',
    title: 'Attendance Shift Synced',
    message: 'Daily biometric attendance logs and check-in times have been successfully synchronized.',
    timestamp: 'Yesterday',
    type: 'attendance',
    read: true,
    link: '/attendance',
    priority: 'low',
  },
  {
    id: 'notif-5',
    title: 'Company Policy Update',
    message: 'Updated holiday and maternity leave guidelines for FY 2026-27 are now active.',
    timestamp: '2 days ago',
    type: 'system',
    read: true,
    link: '/leaves/types',
    priority: 'low',
  },
];

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: initialNotifications,

      markAsRead: (id: string) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      deleteNotification: (id: string) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      clearAll: () =>
        set({
          notifications: [],
        }),

      addNotification: (notif) =>
        set((state) => ({
          notifications: [
            {
              id: 'notif-' + Date.now(),
              title: notif.title,
              message: notif.message,
              timestamp: notif.timestamp || 'Just now',
              type: notif.type,
              read: false,
              link: notif.link,
              priority: notif.priority || 'medium',
            },
            ...state.notifications,
          ],
        })),
    }),
    {
      name: 'hrms_notifications_store',
    }
  )
);
