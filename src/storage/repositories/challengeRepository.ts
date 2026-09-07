import { ChallengeModeEnum } from '@/domain/modes';
import { Challenge } from '@/domain/types';
import { isChallenge } from '@/domain/validation';
import { KeyValueStore } from '@/storage/ports/keyValueStore';
import { StorageKeyEnum } from '@/storage/storageKeys';

import { createJsonRecordStore, JsonRecordStore } from './jsonRecordStore';

export type ChallengeRepository = JsonRecordStore<Challenge>;

const isObject = (candidate: unknown): candidate is Record<string, unknown> =>
  typeof candidate === 'object' && candidate !== null && !Array.isArray(candidate);

/**
 * Reads a challenge, stamping the mode onto a record written before challenges had one.
 *
 * Only Hard existed then, so that is the only honest value to fill in. Rejecting the record
 * instead would strand the user: the entry gate would route them to onboarding, and the guard
 * against overwriting an existing challenge would refuse every attempt to start — an app that
 * cannot be opened and cannot be restarted.
 */
const parseChallenge = (candidate: unknown): Challenge | null => {
  if (isChallenge(candidate)) {
    return candidate;
  }

  if (!isObject(candidate) || candidate.mode !== undefined) {
    return null;
  }

  const migrated = { ...candidate, mode: ChallengeModeEnum.HARD };

  if (!isChallenge(migrated)) {
    return null;
  }

  return migrated;
};

export const createChallengeRepository = (store: KeyValueStore): ChallengeRepository =>
  createJsonRecordStore({ store, key: StorageKeyEnum.CHALLENGE, parse: parseChallenge });
