import { DayRecordsByDate } from '@/domain/types';
import {
  calculateTrendRange,
  collectWeightPoints,
  decideHasLine,
  plotWeightPoints,
} from '@/domain/weightTrend';

const PLOT = { width: 300, height: 90 };

const dayWithWeight = (kilograms: number | null): DayRecordsByDate[string] => ({
  habits:
    kilograms === null
      ? {}
      : ({
          'weigh-in': { completed: false, weightKg: kilograms },
        } as DayRecordsByDate[string]['habits']),
  completedHabits: 0,
  totalHabits: 11,
  completionPercentage: 0,
  perfectDay: false,
  updatedAt: '2026-09-08T09:00:00.000Z',
});

const historyOf = (entries: Record<string, number | null>): DayRecordsByDate =>
  Object.fromEntries(Object.entries(entries).map(([date, kg]) => [date, dayWithWeight(kg)]));

describe('collectWeightPoints', () => {
  it('finds nothing when nobody has weighed in', () => {
    expect(collectWeightPoints(historyOf({ '2026-09-01': null }))).toEqual([]);
  });

  it('returns the weigh-ins in date order, whatever order they were stored in', () => {
    const points = collectWeightPoints(
      historyOf({ '2026-09-03': 88, '2026-09-01': 90, '2026-09-02': 89 }),
    );

    expect(points.map((point) => point.date)).toEqual(['2026-09-01', '2026-09-02', '2026-09-03']);
    expect(points.map((point) => point.kilograms)).toEqual([90, 89, 88]);
  });

  it('skips the days with no weigh-in rather than inventing one', () => {
    const points = collectWeightPoints(
      historyOf({ '2026-09-01': 90, '2026-09-02': null, '2026-09-03': 88 }),
    );

    expect(points).toHaveLength(2);
  });
});

describe('calculateTrendRange', () => {
  it('spans the lowest and highest weights', () => {
    const points = collectWeightPoints(historyOf({ '2026-09-01': 90, '2026-09-02': 88 }));

    expect(calculateTrendRange(points)).toEqual({ lowest: 88, highest: 90 });
  });

  /** Every weight the same has no range of its own; without padding the scale divides by zero. */
  it('gives a flat series a range instead of dividing by zero', () => {
    const points = collectWeightPoints(historyOf({ '2026-09-01': 88, '2026-09-02': 88 }));

    const range = calculateTrendRange(points);

    expect(range.highest).toBeGreaterThan(range.lowest);
  });

  it('gives an empty series a usable range', () => {
    const range = calculateTrendRange([]);

    expect(range.highest).toBeGreaterThan(range.lowest);
  });
});

describe('plotWeightPoints', () => {
  it('plots nothing for an empty series', () => {
    expect(plotWeightPoints([], PLOT)).toEqual([]);
  });

  it('centres a single weigh-in rather than pinning it to the left edge', () => {
    const points = collectWeightPoints(historyOf({ '2026-09-01': 88 }));

    expect(plotWeightPoints(points, PLOT)[0]?.x).toBe(PLOT.width / 2);
  });

  it('never produces a coordinate that is not a number, even for a flat series', () => {
    const points = collectWeightPoints(historyOf({ '2026-09-01': 88, '2026-09-02': 88 }));

    plotWeightPoints(points, PLOT).forEach((plot) => {
      expect(Number.isNaN(plot.x)).toBe(false);
      expect(Number.isNaN(plot.y)).toBe(false);
    });
  });

  /**
   * Wide enough for the hollow ring drawn on the latest point. A smaller inset clips it against
   * the right-hand edge of the card, which is what this whole inset exists to prevent.
   */
  const MARKER_RING_RADIUS = 9;

  it('spreads the points across the width, clear of both edges', () => {
    const points = collectWeightPoints(
      historyOf({ '2026-09-01': 90, '2026-09-02': 89, '2026-09-03': 88 }),
    );

    const plots = plotWeightPoints(points, PLOT);

    expect(plots[0]?.x).toBeGreaterThanOrEqual(MARKER_RING_RADIUS);
    expect(plots[2]?.x).toBeLessThanOrEqual(PLOT.width - MARKER_RING_RADIUS);
    // Symmetric, so the line is centred rather than pushed against one side.
    expect(plots[0]?.x).toBe(PLOT.width - (plots[2]?.x ?? 0));
  });

  it('keeps the highest and lowest weights off the top and bottom edges', () => {
    const points = collectWeightPoints(historyOf({ '2026-09-01': 90, '2026-09-02': 88 }));

    const plots = plotWeightPoints(points, PLOT);

    // The stroke is drawn on the point, so a point on the edge is shaved in half.
    expect(plots[0]?.y).toBeGreaterThanOrEqual(MARKER_RING_RADIUS);
    expect(plots[1]?.y).toBeLessThanOrEqual(PLOT.height - MARKER_RING_RADIUS);
    expect(plots[0]?.y).toBe(PLOT.height - (plots[1]?.y ?? 0));
  });

  it('still spans most of the box, rather than shrinking the line to nothing', () => {
    const points = collectWeightPoints(historyOf({ '2026-09-01': 90, '2026-09-02': 88 }));

    const plots = plotWeightPoints(points, PLOT);
    const drawn = (plots[1]?.y ?? 0) - (plots[0]?.y ?? 0);

    expect(drawn).toBeGreaterThan(PLOT.height / 2);
  });

  it('draws a heavier weight higher up the scale than a lighter one', () => {
    const points = collectWeightPoints(historyOf({ '2026-09-01': 90, '2026-09-02': 88 }));

    const plots = plotWeightPoints(points, PLOT);

    expect(plots[0]!.y).toBeLessThan(plots[1]!.y);
  });

  /** A day nobody weighed on is simply not a point; the line joins what was actually measured. */
  it('spaces points by position, so a gap is a gap rather than an invented value', () => {
    const points = collectWeightPoints(
      historyOf({ '2026-09-01': 90, '2026-09-10': 88, '2026-09-11': 87 }),
    );

    const plots = plotWeightPoints(points, PLOT);

    expect(plots).toHaveLength(3);
    expect(plots[1]?.x).toBe(PLOT.width / 2);
  });

  it('keeps every point inside the drawing', () => {
    const points = collectWeightPoints(
      historyOf({ '2026-09-01': 90, '2026-09-02': 85, '2026-09-03': 88 }),
    );

    plotWeightPoints(points, PLOT).forEach((plot) => {
      expect(plot.y).toBeGreaterThanOrEqual(0);
      expect(plot.y).toBeLessThanOrEqual(PLOT.height);
    });
  });
});

describe('decideHasLine', () => {
  it('needs more than one measurement, because one weight is not a trend', () => {
    expect(decideHasLine(collectWeightPoints(historyOf({ '2026-09-01': 88 })))).toBe(false);
    expect(
      decideHasLine(collectWeightPoints(historyOf({ '2026-09-01': 88, '2026-09-02': 87 }))),
    ).toBe(true);
  });
});
