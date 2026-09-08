/**
 * The shapes persisted to local storage, exactly as `Docs/75-hard-gang-way-mvp.md` describes them
 * under "Local Data Structure". There is no `userId` anywhere: the app has no accounts.
 *
 * Dates are ISO calendar days (`YYYY-MM-DD`); timestamps are ISO date-times.
 */
import { ChallengeMode } from './modes';

export type IsoDate = string;
export type IsoTimestamp = string;

export const ChallengeStatusEnum = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  RESET: 'reset',
} as const;

export type ChallengeStatus = (typeof ChallengeStatusEnum)[keyof typeof ChallengeStatusEnum];

export type Profile = {
  name: string | null;
  createdAt: IsoTimestamp;
};

export type Challenge = {
  startDate: IsoDate;
  /** Which of the three challenges this is. See `src/domain/modes.ts`. */
  mode: ChallengeMode;
  totalDays: number;
  currentStreak: number;
  longestStreak: number;
  status: ChallengeStatus;
};

export type WorkoutSession = {
  minutes: number;
  outdoor: boolean;
  completedAt: IsoTimestamp;
};

export type HabitRecord = {
  completed: boolean;
  value?: number | null;
  sessions?: WorkoutSession[];
  wokeUpAt?: IsoTimestamp | null;
  phoneFreeMinutes?: number;
  noContentMinutes?: number;
  weightKg?: number;
  photo?: string | null;
};

export type DayRecord = {
  habits: Record<string, HabitRecord>;
  completedHabits: number;
  totalHabits: number;
  completionPercentage: number;
  perfectDay: boolean;
  updatedAt: IsoTimestamp;
};

export type DayRecordsByDate = Record<IsoDate, DayRecord>;

/** The derived half of a day record, recomputed from the habits rather than trusted. */
export type DayCompletion = {
  completedHabits: number;
  totalHabits: number;
  completionPercentage: number;
  perfectDay: boolean;
};

export type JournalEntry = {
  content: string;
  whatWentWell: string;
  whatWasDifficult: string;
  tomorrowGoal: string;
  createdAt: IsoTimestamp;
};

export type JournalEntriesByDate = Record<IsoDate, JournalEntry>;

export type Settings = {
  darkMode: boolean;
  notificationsEnabled: boolean;
  morningReminder: string;
  eveningReminder: string;
};
