import { CompletionSnapshot, decideCelebrates } from '@/domain/celebration';

const snapshot = (
  completedHabits: number,
  totalHabits: number,
  date = '2026-09-08',
): CompletionSnapshot => ({ date, completedHabits, totalHabits });

describe('finishing the last rule of the day', () => {
  it('celebrates', () => {
    expect(decideCelebrates(snapshot(10, 11), snapshot(11, 11))).toBe(true);
  });

  it('celebrates on a six-rule challenge too, since perfect means all of them', () => {
    expect(decideCelebrates(snapshot(5, 6), snapshot(6, 6))).toBe(true);
  });
});

describe('anything short of the last rule', () => {
  it('does not celebrate at ten of eleven', () => {
    expect(decideCelebrates(snapshot(9, 11), snapshot(10, 11))).toBe(false);
  });

  it('does not celebrate when a rule is undone', () => {
    expect(decideCelebrates(snapshot(11, 11), snapshot(10, 11))).toBe(false);
  });
});

describe('a day that was already perfect', () => {
  it('does not celebrate again on the next render', () => {
    expect(decideCelebrates(snapshot(11, 11), snapshot(11, 11))).toBe(false);
  });

  it('does not celebrate when the screen simply opens on a perfect day', () => {
    expect(decideCelebrates(null, snapshot(11, 11))).toBe(false);
  });

  it('does not celebrate when the first read lands on a day that was already perfect', () => {
    // What a screen holds before its first read: a date, and no rules yet.
    expect(decideCelebrates(snapshot(0, 0), snapshot(11, 11))).toBe(false);
  });

  it('celebrates once and only once across a redo of the same rule', () => {
    const steps = [snapshot(10, 11), snapshot(11, 11), snapshot(11, 11), snapshot(11, 11)];
    const celebrations = steps.filter((current, index) =>
      decideCelebrates(steps[index - 1] ?? null, current),
    );

    expect(celebrations).toHaveLength(1);
  });
});

describe('a new day', () => {
  it('never inherits yesterday’s progress as a reason to celebrate', () => {
    expect(decideCelebrates(snapshot(10, 11, '2026-09-07'), snapshot(11, 11, '2026-09-08'))).toBe(
      false,
    );
  });
});

describe('a challenge with no rules to speak of', () => {
  it('never celebrates, rather than treating zero of zero as perfect', () => {
    expect(decideCelebrates(snapshot(0, 0), snapshot(0, 0))).toBe(false);
    expect(decideCelebrates(snapshot(0, 11), snapshot(0, 0))).toBe(false);
  });
});
