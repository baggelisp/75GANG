import { ChallengeModeEnum } from './modes';
import { Challenge } from './types';
import { isChallenge } from './validation';

const isObject = (candidate: unknown): candidate is Record<string, unknown> =>
  typeof candidate === 'object' && candidate !== null && !Array.isArray(candidate);

/**
 * Reads a stored challenge, stamping the mode onto a record written before challenges had one.
 *
 * Only Hard existed then, so that is the only honest value to fill in. Rejecting the record
 * instead would strand the user: the entry gate would route them to onboarding, and the guard
 * against overwriting an existing challenge would refuse every attempt to start — an app that
 * cannot be opened and cannot be restarted.
 *
 * The same reasoning applies to an imported backup taken from that older build, which is why this
 * lives in the domain rather than inside the repository.
 */
export const parseStoredChallenge = (candidate: unknown): Challenge | null => {
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
