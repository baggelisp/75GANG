import * as Notifications from 'expo-notifications';

import {
  NotificationScheduler,
  ScheduledNotification,
} from '@/storage/ports/notificationScheduler';

/**
 * The only module that imports expo-notifications.
 *
 * Everything is scheduled locally against a date. Nothing is sent, nothing is registered, and no
 * token ever leaves the device — the app has no server to send one to.
 */
export const createExpoNotificationScheduler = (): NotificationScheduler => {
  const requestPermission = async (): Promise<boolean> => {
    const current = await Notifications.getPermissionsAsync();

    if (current.granted) {
      return true;
    }

    if (!current.canAskAgain) {
      return false;
    }

    const asked = await Notifications.requestPermissionsAsync();

    return asked.granted;
  };

  const cancelAll = async (): Promise<void> => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  const schedule = async (notifications: readonly ScheduledNotification[]): Promise<void> => {
    for (const notification of notifications) {
      await Notifications.scheduleNotificationAsync({
        identifier: notification.id,
        content: { title: notification.title, body: notification.body },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: notification.at,
        },
      });
    }
  };

  return { requestPermission, cancelAll, schedule };
};
