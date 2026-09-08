import {
  NotificationScheduler,
  ScheduledNotification,
} from '@/storage/ports/notificationScheduler';

export type InMemoryNotificationScheduler = NotificationScheduler & {
  /** Everything currently scheduled, after every cancel that came before it. */
  scheduled(): readonly ScheduledNotification[];
  /** How many times everything was cancelled, so a test can prove a cancel happened at all. */
  cancelCount(): number;
  denyPermission(): void;
};

/** The device's notification centre, in memory. Scheduling is device-only, so no test sees it. */
export const createInMemoryNotificationScheduler = (): InMemoryNotificationScheduler => {
  const state: {
    scheduled: ScheduledNotification[];
    cancels: number;
    granted: boolean;
  } = { scheduled: [], cancels: 0, granted: true };

  return {
    requestPermission: async () => state.granted,
    cancelAll: async () => {
      state.cancels += 1;
      state.scheduled = [];
    },
    schedule: async (notifications) => {
      state.scheduled = [...state.scheduled, ...notifications];
    },
    scheduled: () => state.scheduled,
    cancelCount: () => state.cancels,
    denyPermission: () => {
      state.granted = false;
    },
  };
};
