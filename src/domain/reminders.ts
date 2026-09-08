import { addCalendarDays } from './calendar';
import { CHALLENGE_LENGTH_DAYS, decideIsRealChallengeDay } from './challenge';
import { isReminderTime, toMinutesOfDay } from './settings';
import { Challenge, ChallengeStatusEnum, IsoDate, Settings } from './types';

export const ReminderIdEnum = {
  MORNING: 'morning',
  EVENING: 'evening',
} as const;

export type ReminderId = (typeof ReminderIdEnum)[keyof typeof ReminderIdEnum];

/**
 * One reminder, said in numbers rather than words. The copy is assembled at the edge, so the
 * domain never holds a sentence and the plan can be asserted exactly.
 */
export type ReminderPlan = {
  id: ReminderId;
  date: IsoDate;
  time: string;
  /** The challenge day this reminder is about — tomorrow's, once today's time has gone by. */
  day: number;
  completedHabits: number;
  totalHabits: number;
};

export type ReminderPlanInput = {
  settings: Settings;
  challenge: Challenge | null;
  today: IsoDate;
  /** Minutes since local midnight. Injected, because the domain never reads the clock. */
  nowMinutes: number;
  currentDay: number;
  completedHabits: number;
  totalHabits: number;
};

const ONE_DAY = 1;

/**
 * The day a reminder set for `time` will next fire on.
 *
 * A time that has already gone by today goes to tomorrow rather than being dropped: scheduling it
 * for a moment in the past would either fire immediately or silently never fire, and both are
 * worse than tomorrow morning.
 */
export const decideReminderDate = (
  time: string,
  today: IsoDate,
  nowMinutes: number,
): IsoDate | null => {
  const minutes = toMinutesOfDay(time);

  if (minutes === null) {
    return null;
  }

  if (minutes > nowMinutes) {
    return today;
  }

  return addCalendarDays(today, ONE_DAY);
};

/**
 * Both of the day's reminders, or none at all.
 *
 * None is the answer whenever there is nothing to remind anyone about: reminders switched off, no
 * challenge, a challenge already finished, or a day past the seventy-fifth. The evening reminder
 * carries the count as it stands right now, which is why this is recomputed and rescheduled after
 * every write rather than set once and left.
 */
export const planReminders = ({
  settings,
  challenge,
  today,
  nowMinutes,
  currentDay,
  completedHabits,
  totalHabits,
}: ReminderPlanInput): readonly ReminderPlan[] => {
  if (!settings.notificationsEnabled || challenge === null) {
    return [];
  }

  if (challenge.status !== ChallengeStatusEnum.ACTIVE) {
    return [];
  }

  if (!decideIsRealChallengeDay(currentDay) || currentDay > CHALLENGE_LENGTH_DAYS) {
    return [];
  }

  if (!isReminderTime(settings.morningReminder) || !isReminderTime(settings.eveningReminder)) {
    return [];
  }

  const morningDate = decideReminderDate(settings.morningReminder, today, nowMinutes);
  const eveningDate = decideReminderDate(settings.eveningReminder, today, nowMinutes);

  if (morningDate === null || eveningDate === null) {
    return [];
  }

  return [
    {
      id: ReminderIdEnum.MORNING,
      date: morningDate,
      time: settings.morningReminder,
      day: currentDay + countDaysAhead(morningDate, today),
      completedHabits,
      totalHabits,
    },
    {
      id: ReminderIdEnum.EVENING,
      date: eveningDate,
      time: settings.eveningReminder,
      day: currentDay + countDaysAhead(eveningDate, today),
      completedHabits,
      totalHabits,
    },
  ];
};

/** Either zero or one: a reminder is scheduled for today or for tomorrow, never further out. */
const countDaysAhead = (date: IsoDate, today: IsoDate): number => (date === today ? 0 : ONE_DAY);
