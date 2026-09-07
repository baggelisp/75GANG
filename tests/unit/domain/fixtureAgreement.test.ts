import { readFileSync } from 'fs';
import { join } from 'path';

import { calculateDayCompletion } from '@/domain/completion';
import { ChallengeModeEnum } from '@/domain/modes';
import { DayRecord } from '@/domain/types';

const FIXTURES = join(__dirname, '..', '..', 'fixtures');

const readDayFixture = (fileName: string): DayRecord =>
  JSON.parse(readFileSync(join(FIXTURES, fileName), 'utf8')) as DayRecord;

/**
 * The stored counts on a day record are a projection of its habits. A fixture whose projection
 * disagrees with the rules is a lie every later feature would be built against, so the two are
 * pinned together here.
 */
describe('day fixtures agree with the completion rules', () => {
  it.each(['perfect_day.json', 'imperfect_day.json'])(
    '%s stores exactly what the rules derive from its habits',
    (fileName) => {
      const fixture = readDayFixture(fileName);

      const derived = calculateDayCompletion(fixture.habits, ChallengeModeEnum.HARD);

      expect(derived.completedHabits).toBe(fixture.completedHabits);
      expect(derived.totalHabits).toBe(fixture.totalHabits);
      expect(derived.completionPercentage).toBe(fixture.completionPercentage);
      expect(derived.perfectDay).toBe(fixture.perfectDay);
    },
  );
});
