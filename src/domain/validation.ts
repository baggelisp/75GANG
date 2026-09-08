import {
  Challenge,
  ChallengeStatusEnum,
  DayRecord,
  DayRecordsByDate,
  HabitRecord,
  JournalEntriesByDate,
  JournalEntry,
  Profile,
  Settings,
} from './types';
import { isChallengeMode } from './modes';
import { isReminderTime } from './settings';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const isObject = (candidate: unknown): candidate is Record<string, unknown> =>
  typeof candidate === 'object' && candidate !== null && !Array.isArray(candidate);

const isString = (candidate: unknown): candidate is string => typeof candidate === 'string';

const isNumber = (candidate: unknown): candidate is number =>
  typeof candidate === 'number' && Number.isFinite(candidate);

const isBoolean = (candidate: unknown): candidate is boolean => typeof candidate === 'boolean';

const isWholeNumber = (candidate: unknown): candidate is number =>
  isNumber(candidate) && Number.isInteger(candidate);

const MONTH_LENGTHS: readonly number[] = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const FEBRUARY = 2;
const DAYS_IN_LEAP_FEBRUARY = 29;

const decideIsLeapYear = (year: number): boolean => {
  if (year % 400 === 0) {
    return true;
  }

  if (year % 100 === 0) {
    return false;
  }

  return year % 4 === 0;
};

const countDaysInMonth = (year: number, month: number): number => {
  if (month === FEBRUARY && decideIsLeapYear(year)) {
    return DAYS_IN_LEAP_FEBRUARY;
  }

  return MONTH_LENGTHS[month - 1] ?? 0;
};

/**
 * A real calendar day, not just four-two-two digits. `2026-02-30` matches the shape and is not a
 * date; it would become a day-map key and feed a wrong day number into the challenge maths.
 *
 * The check is arithmetic rather than `new Date(...)`, because the domain never constructs a Date
 * — that belongs to the clock adapter, and the architecture test enforces it.
 */
export const isIsoDate = (candidate: unknown): candidate is string => {
  if (!isString(candidate) || !ISO_DATE.test(candidate)) {
    return false;
  }

  const year = Number(candidate.slice(0, 4));
  const month = Number(candidate.slice(5, 7));
  const day = Number(candidate.slice(8, 10));

  if (month < 1 || month > MONTH_LENGTHS.length) {
    return false;
  }

  if (day < 1 || day > countDaysInMonth(year, month)) {
    return false;
  }

  return year > 0;
};

export const isProfile = (candidate: unknown): candidate is Profile => {
  if (!isObject(candidate)) {
    return false;
  }

  const hasValidName = candidate.name === null || isString(candidate.name);

  return hasValidName && isString(candidate.createdAt);
};

export const isChallenge = (candidate: unknown): candidate is Challenge => {
  if (!isObject(candidate)) {
    return false;
  }

  if (!isIsoDate(candidate.startDate)) {
    return false;
  }

  if (!isChallengeMode(candidate.mode)) {
    return false;
  }

  const statuses: readonly string[] = Object.values(ChallengeStatusEnum);

  return (
    isWholeNumber(candidate.totalDays) &&
    candidate.totalDays > 0 &&
    isWholeNumber(candidate.currentStreak) &&
    candidate.currentStreak >= 0 &&
    isWholeNumber(candidate.longestStreak) &&
    candidate.longestStreak >= 0 &&
    isString(candidate.status) &&
    statuses.includes(candidate.status)
  );
};

const MAXIMUM_PERCENTAGE = 100;

export const isHabitRecord = (candidate: unknown): candidate is HabitRecord => {
  if (!isObject(candidate)) {
    return false;
  }

  if (!isBoolean(candidate.completed)) {
    return false;
  }

  const hasUsableValue =
    candidate.value === undefined || candidate.value === null || isNumber(candidate.value);
  const hasUsableSessions = candidate.sessions === undefined || Array.isArray(candidate.sessions);

  return hasUsableValue && hasUsableSessions;
};

export const isDayRecord = (candidate: unknown): candidate is DayRecord => {
  if (!isObject(candidate)) {
    return false;
  }

  if (!isObject(candidate.habits)) {
    return false;
  }

  if (!Object.values(candidate.habits).every(isHabitRecord)) {
    return false;
  }

  const hasSaneCounts =
    isWholeNumber(candidate.completedHabits) &&
    candidate.completedHabits >= 0 &&
    isWholeNumber(candidate.totalHabits) &&
    candidate.totalHabits >= 0 &&
    candidate.completedHabits <= candidate.totalHabits;

  const hasSanePercentage =
    isNumber(candidate.completionPercentage) &&
    candidate.completionPercentage >= 0 &&
    candidate.completionPercentage <= MAXIMUM_PERCENTAGE;

  return (
    hasSaneCounts &&
    hasSanePercentage &&
    isBoolean(candidate.perfectDay) &&
    isString(candidate.updatedAt)
  );
};

export const isJournalEntry = (candidate: unknown): candidate is JournalEntry => {
  if (!isObject(candidate)) {
    return false;
  }

  return (
    isString(candidate.content) &&
    isString(candidate.whatWentWell) &&
    isString(candidate.whatWasDifficult) &&
    isString(candidate.tomorrowGoal) &&
    isString(candidate.createdAt)
  );
};

const isMapKeyedByDate = (candidate: unknown, isEntry: (entry: unknown) => boolean): boolean => {
  if (!isObject(candidate)) {
    return false;
  }

  return Object.entries(candidate).every(([key, entry]) => isIsoDate(key) && isEntry(entry));
};

export const isDayRecordsByDate = (candidate: unknown): candidate is DayRecordsByDate =>
  isMapKeyedByDate(candidate, isDayRecord);

export const isJournalEntriesByDate = (candidate: unknown): candidate is JournalEntriesByDate =>
  isMapKeyedByDate(candidate, isJournalEntry);

export const isSettings = (candidate: unknown): candidate is Settings => {
  if (!isObject(candidate)) {
    return false;
  }

  return (
    isBoolean(candidate.darkMode) &&
    isBoolean(candidate.notificationsEnabled) &&
    isReminderTime(candidate.morningReminder) &&
    isReminderTime(candidate.eveningReminder)
  );
};
