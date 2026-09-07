import { calculateDayCompletion } from './completion';
import { ChallengeMode } from './modes';
import { DayRecordsByDate, IsoDate } from './types';

/**
 * The dates that were genuinely perfect, recomputed from each day's habit records.
 *
 * The stored `perfectDay` flag is a cached projection and is never trusted here: an interrupted
 * write or an imported file could leave a day claiming eleven of eleven with nothing recorded, and
 * that day would then prop up a streak the user never earned.
 */
export const collectPerfectDates = (
  history: DayRecordsByDate,
  mode: ChallengeMode,
): readonly IsoDate[] =>
  Object.entries(history)
    .filter(([, record]) => calculateDayCompletion(record.habits, mode).perfectDay)
    .map(([date]) => date);
