import { useCallback, useState } from 'react';

import { useTranslation } from '@/i18n';
import { useRepositories } from '@/storage/repositoryContext';

import { ReminderSync, syncReminders } from './syncReminders';

/**
 * Keeps the device's reminders in step with the data.
 *
 * Called after anything that changes what a reminder would say: a habit tapped, a time moved, a
 * challenge reset, restarted or imported. A failure is swallowed rather than surfaced as an error
 * — a reminder that could not be rescheduled must never stop a habit from being recorded.
 */
export const useReminderSync = () => {
  const repositories = useRepositories();
  const { t } = useTranslation();
  const [status, setStatus] = useState<ReminderSync | null>(null);

  const sync = useCallback(async (): Promise<ReminderSync | null> => {
    const outcome = await syncReminders(repositories, t).catch(() => null);

    setStatus(outcome);

    return outcome;
  }, [repositories, t]);

  return { status, sync };
};
