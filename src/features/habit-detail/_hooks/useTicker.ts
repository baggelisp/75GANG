import { useEffect, useState } from 'react';

import { useRepositories } from '@/storage/repositoryContext';

const ONE_SECOND = 1000;

/**
 * A clock reading that refreshes once a second while something is running.
 *
 * Nothing is written on a tick — elapsed time is always derived from the stored start timestamp,
 * and this only supplies the "now" that derivation is measured against. Stop it and the timer
 * still runs; it just stops being redrawn.
 *
 * It returns the reading rather than a counter, because re-rendering a value derived from a
 * frozen instant produces a frozen number.
 */
export const useTicker = (isRunning: boolean): Date => {
  const repositories = useRepositories();
  const [now, setNow] = useState(() => repositories.clock.now());

  useEffect(() => {
    setNow(repositories.clock.now());

    if (!isRunning) {
      return;
    }

    const interval = setInterval(() => {
      setNow(repositories.clock.now());
    }, ONE_SECOND);

    return () => {
      clearInterval(interval);
    };
  }, [isRunning, repositories]);

  return now;
};
