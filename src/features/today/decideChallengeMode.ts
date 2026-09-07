import { ChallengeMode, ChallengeModeEnum } from '@/domain/modes';
import { Challenge } from '@/domain/types';

/**
 * The challenge being scored against.
 *
 * The screen never renders without a challenge, so the fallback is unreachable — it exists because
 * the mode decides `totalHabits` and `perfectDay`, and a silent default is the worst possible
 * guess for either. Naming it makes the assumption visible instead of hiding it in a `??`.
 */
export const decideChallengeMode = (challenge: Challenge | null): ChallengeMode => {
  if (challenge === null) {
    return ChallengeModeEnum.HARD;
  }

  return challenge.mode;
};
