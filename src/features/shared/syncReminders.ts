import { calculateCurrentDay } from '@/domain/challenge';
import { calculateDayCompletion } from '@/domain/completion';
import { countHabitsForMode } from '@/domain/habits';
import { ChallengeMode } from '@/domain/modes';
import { planReminders, ReminderIdEnum, ReminderPlan } from '@/domain/reminders';
import { DEFAULT_SETTINGS } from '@/domain/settings';
import { DayCompletion, DayRecordsByDate, IsoDate } from '@/domain/types';
import { Translate } from '@/i18n';
import { ScheduledNotification } from '@/storage/ports/notificationScheduler';
import { Repositories } from '@/storage/repositories/buildRepositories';
import { startOfLocalDay, toLocalIsoDate } from '@/utils/DateUtility';

export const ReminderSyncEnum = {
  /** Reminders are scheduled and the device agreed to show them. */
  SCHEDULED: 'SCHEDULED',
  /** Nothing to schedule — switched off, no challenge, or the challenge is over. */
  CLEARED: 'CLEARED',
  /** The user wants reminders; the phone will not allow them. */
  PERMISSION_DENIED: 'PERMISSION_DENIED',
} as const;

export type ReminderSync = (typeof ReminderSyncEnum)[keyof typeof ReminderSyncEnum];

const MINUTES_PER_HOUR = 60;

/**
 * Brings the device's scheduled reminders in line with what the data actually says.
 *
 * Everything is cancelled and rebuilt every time rather than patched, because the evening reminder
 * carries the live completed count: a reminder scheduled at breakfast would otherwise still say
 * "0 of 11" at eight in the evening. Cancelling first also means a reset, a finished challenge or
 * a switched-off toggle all clear the queue through the same path.
 */
/**
 * One sync at a time.
 *
 * Cancelling and rescheduling is not atomic, and two taps in quick succession interleave as
 * A.cancel, B.cancel, A.schedule, B.schedule — leaving A's reminders, built from the settings
 * before the toggle, alive after B cancelled them. Reminders would survive being switched off.
 */
let inFlight: Promise<ReminderSync> = Promise.resolve(ReminderSyncEnum.CLEARED);

export const syncReminders = (repositories: Repositories, t: Translate): Promise<ReminderSync> => {
  const next = inFlight.then(
    () => runSync(repositories, t),
    () => runSync(repositories, t),
  );

  inFlight = next.catch(() => ReminderSyncEnum.CLEARED);

  return next;
};

const runSync = async (repositories: Repositories, t: Translate): Promise<ReminderSync> => {
  const now = repositories.clock.now();
  const today = toLocalIsoDate(now);

  const [settingsResult, challengeResult, daysResult] = await Promise.all([
    repositories.settings.read(),
    repositories.challenge.read(),
    repositories.days.readAll(),
  ]);

  // A read that failed says nothing about what the user wanted. Leaving the queue alone is the
  // only safe answer: cancelling would silently switch off reminders they had turned on.
  if (!settingsResult.ok || !challengeResult.ok || !daysResult.ok) {
    return ReminderSyncEnum.CLEARED;
  }

  const settings = settingsResult.value ?? DEFAULT_SETTINGS;
  const challenge = challengeResult.value;
  const completion = describeToday(daysResult.value, today, challenge?.mode ?? null);

  const plans = planReminders({
    settings,
    challenge,
    today,
    nowMinutes: countMinutesSinceMidnight(now),
    currentDay: challenge === null ? 0 : calculateCurrentDay(challenge.startDate, today),
    completedHabits: completion.completedHabits,
    totalHabits: completion.totalHabits,
  });

  await repositories.notifications.cancelAll();

  if (plans.length === 0) {
    return ReminderSyncEnum.CLEARED;
  }

  if (!(await repositories.notifications.requestPermission())) {
    return ReminderSyncEnum.PERMISSION_DENIED;
  }

  await repositories.notifications.schedule(plans.map((plan) => toNotification(plan, t)));

  return ReminderSyncEnum.SCHEDULED;
};

/**
 * Minutes since local midnight, read off the wall clock.
 *
 * Not `now - startOfLocalDay`: on the two days a year the clocks change, that difference is off by
 * an hour, and the reminder either gets a trigger date in the past or is pushed to tomorrow and
 * never fires. The whole of `src/domain/calendar.ts` exists because subtracting timestamps across
 * a daylight-saving boundary lies.
 */
const countMinutesSinceMidnight = (now: Date): number =>
  now.getHours() * MINUTES_PER_HOUR + now.getMinutes();

const describeToday = (
  history: DayRecordsByDate | null,
  today: IsoDate,
  mode: ChallengeMode | null,
): DayCompletion => {
  const record = history?.[today];

  if (mode === null) {
    return { completedHabits: 0, totalHabits: 0, completionPercentage: 0, perfectDay: false };
  }

  // A day with nothing recorded still has a total: "0 of 11" is the reminder worth sending, and
  // "0 of 0" would read as a challenge with no rules in it.
  if (record === undefined) {
    return {
      completedHabits: 0,
      totalHabits: countHabitsForMode(mode),
      completionPercentage: 0,
      perfectDay: false,
    };
  }

  return calculateDayCompletion(record.habits, mode);
};

const toNotification = (plan: ReminderPlan, t: Translate): ScheduledNotification => ({
  id: plan.id,
  title: describeTitle(plan, t),
  body: describeBody(plan, t),
  at: buildFireDate(plan),
});

const describeTitle = (plan: ReminderPlan, t: Translate): string => {
  if (plan.id === ReminderIdEnum.MORNING) {
    return t('reminders.morningTitle', { day: plan.day });
  }

  return t('reminders.eveningTitle', { done: plan.completedHabits, total: plan.totalHabits });
};

const describeBody = (plan: ReminderPlan, t: Translate): string => {
  if (plan.id === ReminderIdEnum.MORNING) {
    return t('reminders.morningBody');
  }

  if (plan.completedHabits >= plan.totalHabits && plan.totalHabits > 0) {
    return t('reminders.eveningBodyComplete');
  }

  return t('reminders.eveningBody');
};

/** Local wall-clock time, so a reminder set for 07:00 arrives at 07:00 wherever the phone is. */
const buildFireDate = (plan: ReminderPlan): Date => {
  const midnight = startOfLocalDay(plan.date);
  const [hours, minutes] = plan.time.split(':').map(Number);

  midnight.setHours(hours ?? 0, minutes ?? 0, 0, 0);

  return midnight;
};
