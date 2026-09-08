import { DayRecordsByDate, IsoDate } from './types';

export type WeightPoint = {
  readonly date: IsoDate;
  readonly kilograms: number;
};

export type TrendRange = {
  readonly lowest: number;
  readonly highest: number;
};

/** A flat series still needs a range, or every point would divide by zero and land nowhere. */
const FLAT_SERIES_PADDING_KG = 1;

export const collectWeightPoints = (history: DayRecordsByDate): readonly WeightPoint[] =>
  Object.entries(history)
    .filter(([, record]) => typeof record.habits['weigh-in']?.weightKg === 'number')
    .map(([date, record]) => ({
      date,
      kilograms: record.habits['weigh-in']?.weightKg as number,
    }))
    .sort((first, second) => first.date.localeCompare(second.date));

/**
 * The vertical range the line is drawn against.
 *
 * A series where every weight is the same has no range of its own, so it is given one — otherwise
 * the scale divides by zero and every point lands on NaN.
 */
export const calculateTrendRange = (points: readonly WeightPoint[]): TrendRange => {
  if (points.length === 0) {
    return { lowest: 0, highest: FLAT_SERIES_PADDING_KG };
  }

  const weights = points.map((point) => point.kilograms);
  const lowest = Math.min(...weights);
  const highest = Math.max(...weights);

  if (lowest === highest) {
    return { lowest: lowest - FLAT_SERIES_PADDING_KG, highest: highest + FLAT_SERIES_PADDING_KG };
  }

  return { lowest, highest };
};

export type TrendPlot = {
  readonly x: number;
  readonly y: number;
};

export type PlotConfig = {
  readonly width: number;
  readonly height: number;
};

/**
 * How far the line is kept off each edge of the drawing.
 *
 * Without it the highest and lowest weights sit exactly on the top and bottom of the box and the
 * stroke is shaved in half, and the marker ring on the latest point — which is wider than the
 * line — is clipped by the right-hand edge.
 */
export const PLOT_INSET = 12;

/**
 * Where each weight sits in the drawing.
 *
 * Points are spaced by their position in the series rather than by date, so a gap in the history
 * is a gap in the line rather than a value the app invented for a day the user never weighed.
 */
export const plotWeightPoints = (
  points: readonly WeightPoint[],
  { width, height }: PlotConfig,
): readonly TrendPlot[] => {
  if (points.length === 0) {
    return [];
  }

  const range = calculateTrendRange(points);
  const span = range.highest - range.lowest;
  const steps = points.length - 1;
  const drawableWidth = Math.max(width - PLOT_INSET * 2, 0);
  const drawableHeight = Math.max(height - PLOT_INSET * 2, 0);

  return points.map((point, index) => ({
    x: PLOT_INSET + (steps === 0 ? drawableWidth / 2 : (index / steps) * drawableWidth),
    y: PLOT_INSET + drawableHeight - ((point.kilograms - range.lowest) / span) * drawableHeight,
  }));
};

/** A single weigh-in is a point, not a line — one measurement is not a trend. */
export const decideHasLine = (points: readonly WeightPoint[]): boolean => points.length > 1;
