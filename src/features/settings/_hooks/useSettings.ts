import { useCallback, useEffect, useState } from 'react';

import { DEFAULT_SETTINGS, REMINDER_STEP_MINUTES, shiftReminderTime } from '@/domain/settings';
import { Settings } from '@/domain/types';
import { useRepositories } from '@/storage/repositoryContext';

export const SettingsStatusEnum = {
  LOADING: 'LOADING',
  READY: 'READY',
  UNAVAILABLE: 'UNAVAILABLE',
} as const;

export type SettingsStatus = (typeof SettingsStatusEnum)[keyof typeof SettingsStatusEnum];

/** The reminder a step moves. Both are stored, and feature 18 schedules against them. */
export const ReminderEnum = {
  MORNING: 'morningReminder',
  EVENING: 'eveningReminder',
} as const;

export type Reminder = (typeof ReminderEnum)[keyof typeof ReminderEnum];

export type SettingsView = {
  status: SettingsStatus;
  settings: Settings;
  didFail: boolean;
};

/**
 * Reads and writes the settings record.
 *
 * A settings key that has never been written reads as absent, which is not a failure — it means
 * the defaults. A read that actually failed is different and is reported, because toggling from a
 * guessed state would write those guesses over whatever is really on the device.
 *
 * Changes are applied optimistically and rolled back if the write fails, so a switch never sits
 * in a position the storage does not agree with.
 */
export const useSettings = () => {
  const repositories = useRepositories();
  const [view, setView] = useState<SettingsView>({
    status: SettingsStatusEnum.LOADING,
    settings: DEFAULT_SETTINGS,
    didFail: false,
  });

  const load = useCallback(async () => {
    const stored = await repositories.settings.read();

    if (!stored.ok) {
      setView({
        status: SettingsStatusEnum.UNAVAILABLE,
        settings: DEFAULT_SETTINGS,
        didFail: false,
      });

      return;
    }

    setView({
      status: SettingsStatusEnum.READY,
      settings: stored.value ?? DEFAULT_SETTINGS,
      didFail: false,
    });
  }, [repositories]);

  useEffect(() => {
    load();
  }, [load]);

  const change = async (next: Settings): Promise<boolean> => {
    const previous = view.settings;

    setView((current) => ({ ...current, settings: next, didFail: false }));

    const written = await repositories.settings.write(next).catch(() => ({ ok: false }));

    if (!written.ok) {
      setView((current) => ({ ...current, settings: previous, didFail: true }));

      return false;
    }

    return true;
  };

  const toggleNotifications = () =>
    change({ ...view.settings, notificationsEnabled: !view.settings.notificationsEnabled });

  const stepReminder = (reminder: Reminder, steps: number) =>
    change({
      ...view.settings,
      [reminder]: shiftReminderTime(view.settings[reminder], steps * REMINDER_STEP_MINUTES),
    });

  return { ...view, toggleNotifications, stepReminder, refresh: load };
};
