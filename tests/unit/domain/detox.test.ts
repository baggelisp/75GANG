import {
  calculateDetoxProgress,
  clearWakeUp,
  decideDetoxIsUnsettled,
  decideHasWokenUp,
  recordWakeUp,
  settleDetox,
} from '@/domain/detox';
import { decideHabitIsComplete } from '@/domain/completion';
import { HabitIdEnum } from '@/domain/habitIds';
import { ChallengeModeEnum } from '@/domain/modes';
import { HabitRecord } from '@/domain/types';

const SEVEN = new Date('2026-09-07T07:00:00.000Z');
const SEVEN_THIRTY = new Date('2026-09-07T07:30:00.000Z');
const EIGHT = new Date('2026-09-07T08:00:00.000Z');
const NINE_FIFTY_NINE = new Date('2026-09-07T09:59:00.000Z');
const TEN = new Date('2026-09-07T10:00:00.000Z');
const HARD = ChallengeModeEnum.HARD;

const wokeAt = (moment: Date): HabitRecord => recordWakeUp(undefined, moment);

describe('waking up', () => {
  it('records nothing until the user says they woke up', () => {
    expect(decideHasWokenUp(undefined)).toBe(false);
    expect(calculateDetoxProgress(undefined, TEN).hasWokenUp).toBe(false);
  });

  it('starts both windows from the one moment', () => {
    const record = wokeAt(SEVEN);

    expect(record.wokeUpAt).toBe(SEVEN.toISOString());
    expect(record.phoneFreeMinutes).toBe(0);
    expect(record.noContentMinutes).toBe(0);
  });

  /** A second tap would otherwise throw away an hour the user had genuinely earned. */
  it('does not restart a morning that is already under way', () => {
    const first = wokeAt(SEVEN);

    const second = recordWakeUp(first, EIGHT);

    expect(second.wokeUpAt).toBe(SEVEN.toISOString());
  });

  it('can be undone when tapped by mistake', () => {
    const cleared = clearWakeUp(wokeAt(SEVEN));

    expect(decideHasWokenUp(cleared)).toBe(false);
    expect(cleared.wokeUpAt).toBeNull();
  });
});

describe('the two windows running in parallel', () => {
  it('counts both from the same wake-up', () => {
    const progress = calculateDetoxProgress(wokeAt(SEVEN), SEVEN_THIRTY);

    expect(progress.phone.elapsedMinutes).toBe(30);
    expect(progress.content.elapsedMinutes).toBe(30);
  });

  it('finishes the phone window an hour in, while the content window runs on', () => {
    const progress = calculateDetoxProgress(wokeAt(SEVEN), EIGHT);

    expect(progress.phone.isDone).toBe(true);
    expect(progress.content.isDone).toBe(false);
  });

  it('finishes the content window three hours in', () => {
    const progress = calculateDetoxProgress(wokeAt(SEVEN), TEN);

    expect(progress.phone.isDone).toBe(true);
    expect(progress.content.isDone).toBe(true);
  });

  it('treats a wake-up in the future as nothing elapsed', () => {
    const record: HabitRecord = { completed: false, wokeUpAt: TEN.toISOString() };

    expect(calculateDetoxProgress(record, SEVEN).phone.elapsedMinutes).toBe(0);
  });
});

describe('the rule itself', () => {
  it('is incomplete with the phone window done and the content window at 179 minutes', () => {
    const record = settleDetox(wokeAt(SEVEN), NINE_FIFTY_NINE);

    expect(record.phoneFreeMinutes).toBe(60);
    expect(record.noContentMinutes).toBe(179);
    expect(decideHabitIsComplete(HabitIdEnum.MORNING_DETOX, record, HARD)).toBe(false);
  });

  it('is complete once both windows have finished', () => {
    const record = settleDetox(wokeAt(SEVEN), TEN);

    expect(decideHabitIsComplete(HabitIdEnum.MORNING_DETOX, record, HARD)).toBe(true);
  });

  it('is incomplete before either window finishes', () => {
    const record = settleDetox(wokeAt(SEVEN), SEVEN_THIRTY);

    expect(decideHabitIsComplete(HabitIdEnum.MORNING_DETOX, record, HARD)).toBe(false);
  });
});

describe('settling the windows', () => {
  /** The whole morning passed with the app closed; both windows are still credited. */
  it('credits a window that finished while the app was closed', () => {
    const record = settleDetox(wokeAt(SEVEN), TEN);

    expect(record.phoneFreeMinutes).toBe(60);
    expect(record.noContentMinutes).toBe(180);
  });

  it('does not bank more than each window is worth', () => {
    const record = settleDetox(wokeAt(SEVEN), new Date('2026-09-07T20:00:00.000Z'));

    expect(record.phoneFreeMinutes).toBe(60);
    expect(record.noContentMinutes).toBe(180);
  });

  it('leaves a record alone when the user has not woken up yet', () => {
    expect(settleDetox({ completed: false }, TEN)).toEqual({ completed: false });
  });

  it('is idempotent, so reading a day twice cannot inflate it', () => {
    const once = settleDetox(wokeAt(SEVEN), EIGHT);
    const twice = settleDetox(once, EIGHT);

    expect(twice.phoneFreeMinutes).toBe(once.phoneFreeMinutes);
    expect(twice.noContentMinutes).toBe(once.noContentMinutes);
  });
});

describe('what gets written down', () => {
  it('banks whole minutes, because the number is shown and exported', () => {
    const woke = recordWakeUp(undefined, new Date('2026-09-07T07:00:17.000Z'));

    const settled = settleDetox(woke, new Date('2026-09-07T07:42:03.000Z'));

    expect(settled.phoneFreeMinutes).toBe(42);
    expect(settled.noContentMinutes).toBe(42);
    expect(Number.isInteger(settled.phoneFreeMinutes)).toBe(true);
  });

  it('banks an hour that ends exactly on the boundary as a full hour', () => {
    const woke = recordWakeUp(undefined, new Date('2026-09-07T07:00:00.000Z'));

    expect(settleDetox(woke, new Date('2026-09-07T08:00:00.000Z')).phoneFreeMinutes).toBe(60);
  });
});

describe('deciding whether a day still needs settling', () => {
  it('says yes while the windows can still gain minutes', () => {
    const woke = recordWakeUp(undefined, new Date('2026-09-07T07:00:00.000Z'));

    expect(decideDetoxIsUnsettled(woke, new Date('2026-09-07T07:30:00.000Z'))).toBe(true);
  });

  it('says no once settling again would change nothing', () => {
    const woke = recordWakeUp(undefined, new Date('2026-09-07T07:00:00.000Z'));
    const settled = settleDetox(woke, new Date('2026-09-07T10:00:00.000Z'));

    expect(decideDetoxIsUnsettled(settled, new Date('2026-09-07T10:00:00.000Z'))).toBe(false);
  });

  /**
   * A day that can never fill — an evening wake-up settled against its own end — must stop being
   * rewritten, or every read restamps a historical record with today's date forever.
   */
  it('says no for a day that has already had everything it can get', () => {
    const woke = recordWakeUp(undefined, new Date('2026-09-06T22:30:00.000Z'));
    const endOfThatDay = new Date('2026-09-07T00:00:00.000Z');
    const settled = settleDetox(woke, endOfThatDay);

    expect(decideDetoxIsUnsettled(settled, endOfThatDay)).toBe(false);
  });

  it('says no for a morning that never began', () => {
    expect(decideDetoxIsUnsettled({ completed: false }, new Date('2026-09-07T10:00:00.000Z'))).toBe(
      false,
    );
  });
});

describe('settling never takes minutes away', () => {
  const WOKE_UP = '2026-09-08T06:00:00.000Z';

  it('keeps an hour already banked when the clock has moved backwards', () => {
    const finished = {
      completed: false,
      wokeUpAt: WOKE_UP,
      phoneFreeMinutes: 60,
      noContentMinutes: 180,
    };

    // A phone whose clock was corrected back to before the user woke up.
    const settled = settleDetox(finished, new Date('2026-09-08T05:00:00.000Z'));

    expect(settled.phoneFreeMinutes).toBe(60);
    expect(settled.noContentMinutes).toBe(180);
  });

  it('keeps what was banked when the wake-up belongs to another day entirely', () => {
    const importedFromElsewhere = {
      completed: false,
      wokeUpAt: '2026-11-01T06:00:00.000Z',
      phoneFreeMinutes: 60,
      noContentMinutes: 180,
    };

    const settled = settleDetox(importedFromElsewhere, new Date('2026-09-08T23:59:00.000Z'));

    expect(settled.phoneFreeMinutes).toBe(60);
    expect(settled.noContentMinutes).toBe(180);
  });

  it('still adds the minutes that have genuinely run', () => {
    const started = {
      completed: false,
      wokeUpAt: WOKE_UP,
      phoneFreeMinutes: 10,
      noContentMinutes: 10,
    };

    const settled = settleDetox(started, new Date('2026-09-08T06:45:00.000Z'));

    expect(settled.phoneFreeMinutes).toBe(45);
    expect(settled.noContentMinutes).toBe(45);
  });

  it('leaves a settled past day alone rather than rewriting it on every read', () => {
    const finished = {
      completed: false,
      wokeUpAt: WOKE_UP,
      phoneFreeMinutes: 60,
      noContentMinutes: 180,
    };

    expect(decideDetoxIsUnsettled(finished, new Date('2026-09-08T05:00:00.000Z'))).toBe(false);
  });
});
