import { ChallengeModeEnum } from '@/domain/modes';
import {
  planReminders,
  ReminderIdEnum,
  ReminderPlanInput,
  decideReminderDate,
} from '@/domain/reminders';
import { DEFAULT_SETTINGS } from '@/domain/settings';
import { ChallengeStatusEnum } from '@/domain/types';

const TODAY = '2026-09-08';

const CHALLENGE = {
  startDate: '2026-08-28',
  mode: ChallengeModeEnum.HARD,
  totalDays: 75,
  currentStreak: 6,
  longestStreak: 9,
  status: ChallengeStatusEnum.ACTIVE,
};

const ENABLED = { ...DEFAULT_SETTINGS, notificationsEnabled: true };

const MIDDAY_MINUTES = 12 * 60;

const buildInput = (overrides: Partial<ReminderPlanInput> = {}): ReminderPlanInput => ({
  settings: ENABLED,
  challenge: CHALLENGE,
  today: TODAY,
  nowMinutes: MIDDAY_MINUTES,
  currentDay: 12,
  completedHabits: 4,
  totalHabits: 11,
  ...overrides,
});

describe('deciding which day a reminder falls on', () => {
  it('is today when the time is still to come', () => {
    expect(decideReminderDate('20:00', TODAY, MIDDAY_MINUTES)).toBe(TODAY);
  });

  it('is tomorrow when the time has already gone by', () => {
    expect(decideReminderDate('07:00', TODAY, MIDDAY_MINUTES)).toBe('2026-09-09');
  });

  it('is tomorrow when the time is exactly now, because now is too late to warn anyone', () => {
    expect(decideReminderDate('12:00', TODAY, MIDDAY_MINUTES)).toBe('2026-09-09');
  });

  it('rolls into the next month', () => {
    expect(decideReminderDate('07:00', '2026-09-30', MIDDAY_MINUTES)).toBe('2026-10-01');
  });

  it('rolls across a leap day', () => {
    expect(decideReminderDate('07:00', '2028-02-28', MIDDAY_MINUTES)).toBe('2028-02-29');
  });
});

describe('planning the day’s reminders', () => {
  it('plans both of them', () => {
    expect(planReminders(buildInput()).map((plan) => plan.id)).toEqual([
      ReminderIdEnum.MORNING,
      ReminderIdEnum.EVENING,
    ]);
  });

  it('carries the completed count on the evening reminder', () => {
    const evening = planReminders(buildInput()).find((plan) => plan.id === ReminderIdEnum.EVENING);

    expect(evening?.completedHabits).toBe(4);
    expect(evening?.totalHabits).toBe(11);
  });

  it('carries the count as it stands, not as it was when the reminder was first set', () => {
    const evening = planReminders(buildInput({ completedHabits: 10 })).find(
      (plan) => plan.id === ReminderIdEnum.EVENING,
    );

    expect(evening?.completedHabits).toBe(10);
  });

  it('puts the morning reminder on tomorrow once this morning has gone', () => {
    const morning = planReminders(buildInput()).find((plan) => plan.id === ReminderIdEnum.MORNING);

    expect(morning?.date).toBe('2026-09-09');
    expect(morning?.time).toBe('07:00');
  });

  it('counts the day the reminder is actually about, not the day it was planned on', () => {
    const [morning, evening] = planReminders(buildInput());

    // The morning one has already rolled to tomorrow, which is day 13.
    expect(morning?.day).toBe(13);
    expect(evening?.day).toBe(12);
  });

  it('plans nothing while reminders are switched off', () => {
    expect(planReminders(buildInput({ settings: DEFAULT_SETTINGS }))).toEqual([]);
  });

  it('plans nothing without a challenge to remind anyone about', () => {
    expect(planReminders(buildInput({ challenge: null }))).toEqual([]);
  });

  it('plans nothing once the challenge is over', () => {
    expect(
      planReminders(
        buildInput({ challenge: { ...CHALLENGE, status: ChallengeStatusEnum.COMPLETED } }),
      ),
    ).toEqual([]);
  });

  it('plans nothing on the day after the last day of the challenge', () => {
    expect(planReminders(buildInput({ currentDay: 75 })).length).toBeGreaterThan(0);
    expect(planReminders(buildInput({ currentDay: 76 }))).toEqual([]);
  });

  it('plans nothing when a reminder time is not a time', () => {
    expect(
      planReminders(buildInput({ settings: { ...ENABLED, morningReminder: 'dawn' } })),
    ).toEqual([]);
  });
});
