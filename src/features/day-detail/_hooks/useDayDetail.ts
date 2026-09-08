import { useEffect, useState } from 'react';

import { Challenge, DayRecord } from '@/domain/types';
import { useRepositories } from '@/storage/repositoryContext';

export type DayDetailView = {
  isLoading: boolean;
  challenge: Challenge | null;
  record: DayRecord | null;
};

/** Reads one past day. Nothing here writes — looking back never changes what happened. */
export const useDayDetail = (date: string): DayDetailView => {
  const repositories = useRepositories();
  const [view, setView] = useState<DayDetailView>({
    isLoading: true,
    challenge: null,
    record: null,
  });

  useEffect(() => {
    let isCurrent = true;

    const load = async () => {
      const [challengeResult, dayResult] = await Promise.all([
        repositories.challenge.read(),
        repositories.days.readOne(date),
      ]);

      if (!isCurrent) {
        return;
      }

      setView({
        isLoading: false,
        challenge: challengeResult.ok ? challengeResult.value : null,
        record: dayResult.ok ? dayResult.value : null,
      });
    };

    void load();

    return () => {
      isCurrent = false;
    };
  }, [date, repositories]);

  return view;
};
