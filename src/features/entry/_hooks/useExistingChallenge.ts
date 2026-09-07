import { useEffect, useState } from 'react';

import { StorageErrorEnum } from '@/domain/result';
import { Challenge } from '@/domain/types';
import { useRepositories } from '@/storage/repositoryContext';

export const ChallengeLookupEnum = {
  LOADING: 'LOADING',
  NONE: 'NONE',
  FOUND: 'FOUND',
  UNREADABLE: 'UNREADABLE',
} as const;

export type ChallengeLookupStatus = (typeof ChallengeLookupEnum)[keyof typeof ChallengeLookupEnum];

export type ChallengeLookup = {
  status: ChallengeLookupStatus;
  challenge: Challenge | null;
};

/**
 * Reads the stored challenge once on mount.
 *
 * A device read that simply failed is reported as UNREADABLE rather than as "no challenge". The
 * difference matters: the record is still on disk and will read next launch, whereas routing to
 * onboarding invites the user to start again over the top of it.
 */
export const useExistingChallenge = (): ChallengeLookup => {
  const repositories = useRepositories();
  const [lookup, setLookup] = useState<ChallengeLookup>({
    status: ChallengeLookupEnum.LOADING,
    challenge: null,
  });

  useEffect(() => {
    const mounted = { value: true };

    const load = async () => {
      const result = await repositories.challenge.read();

      if (!mounted.value) {
        return;
      }

      if (!result.ok) {
        const status =
          result.error.reason === StorageErrorEnum.READ_FAILED
            ? ChallengeLookupEnum.UNREADABLE
            : ChallengeLookupEnum.NONE;

        setLookup({ status, challenge: null });

        return;
      }

      if (result.value === null) {
        setLookup({ status: ChallengeLookupEnum.NONE, challenge: null });

        return;
      }

      setLookup({ status: ChallengeLookupEnum.FOUND, challenge: result.value });
    };

    load();

    return () => {
      mounted.value = false;
    };
  }, [repositories]);

  return lookup;
};
