import { useState } from 'react';

import { ChallengeMode } from '@/domain/modes';
import { resetChallenge, restartChallenge } from '@/features/shared/challengeLifecycle';
import { useRepositories } from '@/storage/repositoryContext';
import { toLocalIsoDate } from '@/utils/DateUtility';

/** Which destructive action the user has asked for and not yet confirmed. */
export const PendingActionEnum = {
  NONE: 'NONE',
  RESET: 'RESET',
  RESTART: 'RESTART',
} as const;

export type PendingAction = (typeof PendingActionEnum)[keyof typeof PendingActionEnum];

export const ChallengeOutcomeEnum = {
  RESET: 'RESET',
  RESTARTED: 'RESTARTED',
  FAILED: 'FAILED',
} as const;

export type ChallengeOutcome = (typeof ChallengeOutcomeEnum)[keyof typeof ChallengeOutcomeEnum];

/**
 * Reset and restart, each behind a confirmation.
 *
 * Nothing is touched until `confirm` is called: asking is a state change and nothing else, so a
 * mistaken tap on "Erase" followed by "Cancel" leaves the challenge exactly as it was.
 */
export const useChallengeControls = (mode: ChallengeMode) => {
  const repositories = useRepositories();
  const [pending, setPending] = useState<PendingAction>(PendingActionEnum.NONE);
  const [isRunning, setIsRunning] = useState(false);

  const ask = (action: PendingAction) => setPending(action);
  const cancel = () => setPending(PendingActionEnum.NONE);

  const confirm = async (): Promise<ChallengeOutcome | null> => {
    if (pending === PendingActionEnum.NONE) {
      return null;
    }

    setIsRunning(true);

    const outcome = await runPendingAction();

    setIsRunning(false);
    setPending(PendingActionEnum.NONE);

    return outcome;
  };

  const runPendingAction = async (): Promise<ChallengeOutcome> => {
    if (pending === PendingActionEnum.RESET) {
      await resetChallenge(repositories);

      return ChallengeOutcomeEnum.RESET;
    }

    const today = toLocalIsoDate(repositories.clock.now());
    const restarted = await restartChallenge(repositories, today, mode);

    if (!restarted) {
      return ChallengeOutcomeEnum.FAILED;
    }

    return ChallengeOutcomeEnum.RESTARTED;
  };

  return { pending, isRunning, ask, cancel, confirm };
};
