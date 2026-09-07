import { useState } from 'react';

import { countDaysBetween } from '@/domain/calendar';
import {
  calculateCurrentDay,
  CHALLENGE_LENGTH_DAYS,
  decideChallengeStatus,
} from '@/domain/challenge';
import { ChallengeMode } from '@/domain/modes';
import { IsoDate } from '@/domain/types';
import { useRepositories } from '@/storage/repositoryContext';

export const StartErrorEnum = {
  START_DATE_IN_FUTURE: 'START_DATE_IN_FUTURE',
  START_DATE_TOO_FAR_BACK: 'START_DATE_TOO_FAR_BACK',
  START_DATE_INVALID: 'START_DATE_INVALID',
  CHALLENGE_ALREADY_EXISTS: 'CHALLENGE_ALREADY_EXISTS',
  COULD_NOT_SAVE: 'COULD_NOT_SAVE',
} as const;

export type StartError = (typeof StartErrorEnum)[keyof typeof StartErrorEnum];

export type StartChallengeInput = {
  name: string;
  startDate: IsoDate;
  mode: ChallengeMode;
  today: IsoDate;
};

export type StartChallengeResult = { ok: true } | { ok: false; error: StartError };

/** The earliest start date that still leaves a day of the challenge to live. */
export const EARLIEST_START_OFFSET_DAYS = CHALLENGE_LENGTH_DAYS - 1;

/**
 * Whether a start date may begin a challenge.
 *
 * Today and recent past dates are allowed — someone may already be on day 4 when they install the
 * app. A future date would leave the challenge at day zero with nothing to record, and a date more
 * than 74 days back would start a challenge that is already over.
 */
export const decideStartDateError = (startDate: IsoDate, today: IsoDate): StartError | null => {
  const elapsed = countDaysBetween(startDate, today);

  if (elapsed === null) {
    return StartErrorEnum.START_DATE_INVALID;
  }

  if (elapsed < 0) {
    return StartErrorEnum.START_DATE_IN_FUTURE;
  }

  if (elapsed > EARLIEST_START_OFFSET_DAYS) {
    return StartErrorEnum.START_DATE_TOO_FAR_BACK;
  }

  return null;
};

export const useStartChallenge = () => {
  const repositories = useRepositories();
  const [error, setError] = useState<StartError | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const failWith = (reason: StartError): StartChallengeResult => {
    setError(reason);

    return { ok: false, error: reason };
  };

  const startChallenge = async ({
    name,
    startDate,
    mode,
    today,
  }: StartChallengeInput): Promise<StartChallengeResult> => {
    const dateError = decideStartDateError(startDate, today);

    if (dateError !== null) {
      return failWith(dateError);
    }

    // Never write over a challenge that is already running. Onboarding is reachable after a failed
    // read, and one tap here would otherwise replace a day-60 record with a fresh day 1.
    const existing = await repositories.challenge.read();

    if (!existing.ok) {
      return failWith(StartErrorEnum.COULD_NOT_SAVE);
    }

    if (existing.value !== null) {
      return failWith(StartErrorEnum.CHALLENGE_ALREADY_EXISTS);
    }

    setIsSaving(true);

    const createdAt = repositories.clock.now().toISOString();
    const trimmedName = name.trim();

    // The profile is cosmetic and its failure must not report a failed start: the challenge is the
    // record that defines the app's state, so only its write decides the outcome.
    await repositories.profile.write({
      name: trimmedName.length === 0 ? null : trimmedName,
      createdAt,
    });

    const challengeWritten = await repositories.challenge.write({
      startDate,
      mode,
      totalDays: CHALLENGE_LENGTH_DAYS,
      currentStreak: 0,
      longestStreak: 0,
      status: decideChallengeStatus(calculateCurrentDay(startDate, today)),
    });

    setIsSaving(false);

    if (!challengeWritten.ok) {
      return failWith(StartErrorEnum.COULD_NOT_SAVE);
    }

    setError(null);

    return { ok: true };
  };

  return { startChallenge, error, isSaving };
};
