/** One local notification, ready to hand to the device. */
export type ScheduledNotification = {
  /** Stable per reminder, so rescheduling replaces rather than stacks. */
  id: string;
  title: string;
  body: string;
  at: Date;
};

/**
 * Local notifications, and nothing else — there is no push server anywhere in this app.
 *
 * Behind a port because scheduling and delivery are device-only: neither works under
 * react-native-web or in jest, so everything above this line is tested against a double.
 */
export type NotificationScheduler = {
  /** True when the app may post notifications. Asking twice after a denial is not asking again. */
  requestPermission(): Promise<boolean>;
  cancelAll(): Promise<void>;
  schedule(notifications: readonly ScheduledNotification[]): Promise<void>;
};
