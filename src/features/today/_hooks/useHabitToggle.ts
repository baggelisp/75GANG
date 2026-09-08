import { useState } from 'react';

import { applyHabitChange, toggleTapHabit } from '@/domain/dayRecord';
import { ChallengeMode } from '@/domain/modes';
import { DayRecord } from '@/domain/types';
import { useRepositories } from '@/storage/repositoryContext';
import { toLocalIsoDate } from '@/utils/DateUtility';

export type UseHabitToggle = {
  toggleHabit: (habitId: string) => Promise<boolean>;
  writeFailed: boolean;
  dismissError: () => void;
};

export type UseHabitToggleConfig = {
  mode: ChallengeMode;
  onWritten: () => void;
};

/**
 * The shared write path for a habit.
 *
 * Both the new value and the date it belongs to are resolved **inside** the transaction, from the
 * record the write is built on and from the clock at the moment of the tap. Taking either from the
 * screen's state would defeat the serialised update: two taps on the same habit would both read
 * "not done" and both write "done", losing the undo, and a screen left open across local midnight
 * would file the tap under yesterday.
 *
 * The write also happens before the screen changes, so a failure can never leave a tick on screen
 * that was never saved.
 */
export const useHabitToggle = ({ mode, onWritten }: UseHabitToggleConfig): UseHabitToggle => {
  const repositories = useRepositories();
  const [writeFailed, setWriteFailed] = useState(false);

  const toggleHabit = async (habitId: string): Promise<boolean> => {
    const now = repositories.clock.now();
    const date = toLocalIsoDate(now);
    const updatedAt = now.toISOString();

    const written = await repositories.days
      .update(date, (current: DayRecord | null) =>
        applyHabitChange(
          current,
          { habitId, record: toggleTapHabit(current?.habits[habitId]) },
          mode,
          updatedAt,
        ),
      )
      .catch(() => ({ ok: false }) as const);

    if (!written.ok) {
      setWriteFailed(true);

      return false;
    }

    setWriteFailed(false);
    onWritten();

    return true;
  };

  const dismissError = () => {
    setWriteFailed(false);
  };

  return { toggleHabit, writeFailed, dismissError };
};
