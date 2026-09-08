import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import { CompletionSnapshot, decideCelebrates } from '@/domain/celebration';

/** Long enough to read, short enough not to be in the way of the next tap. */
export const CELEBRATION_MILLISECONDS = 4000;

export type PerfectDayCelebration = {
  isShowing: boolean;
  prefersReducedMotion: boolean;
  dismiss: () => void;
};

/**
 * Watches for the day becoming perfect and shows the celebration once.
 *
 * The decision is the pure one in `src/domain/celebration.ts`; this only feeds it the snapshots and
 * holds the timer. Nothing here is awaited by the write path — the habit is already saved by the
 * time this runs, so a celebration can never delay or block recording one.
 */
export const usePerfectDayCelebration = (snapshot: CompletionSnapshot): PerfectDayCelebration => {
  const previous = useRef<CompletionSnapshot | null>(null);
  const [isShowing, setIsShowing] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    let isMounted = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((isEnabled) => {
        if (isMounted) {
          setPrefersReducedMotion(isEnabled);
        }
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  const { date, completedHabits, totalHabits } = snapshot;

  useEffect(() => {
    const current = { date, completedHabits, totalHabits };
    const celebrates = decideCelebrates(previous.current, current);

    previous.current = current;

    if (!celebrates) {
      return;
    }

    setIsShowing(true);
  }, [date, completedHabits, totalHabits]);

  useEffect(() => {
    if (!isShowing) {
      return;
    }

    const timer = setTimeout(() => setIsShowing(false), CELEBRATION_MILLISECONDS);

    return () => clearTimeout(timer);
  }, [isShowing]);

  return { isShowing, prefersReducedMotion, dismiss: () => setIsShowing(false) };
};
