/**
 * Ring radii from `.claude/rules/design-system.md` — "The rings".
 * Outer measures habits, middle workouts, inner water.
 */
export const RING_RADII = {
  habits: 52,
  workouts: 38,
  water: 24,
} as const;

export const RING_STROKE_WIDTH = 12;
export const RING_VIEWBOX_SIZE = 128;
export const RING_CENTRE = RING_VIEWBOX_SIZE / 2;

export type RingArcInput = {
  readonly radius: number;
  readonly value: number;
  readonly target: number;
};

export type RingArc = {
  readonly circumference: number;
  readonly arcLength: number;
  readonly remainder: number;
};

const calculateProgress = (value: number, target: number): number => {
  if (target <= 0) {
    return 0;
  }

  if (value <= 0) {
    return 0;
  }

  if (value >= target) {
    return 1;
  }

  return value / target;
};

/**
 * Progress is expressed as a `strokeDasharray` of `<arc> <remainder>`, never as a rotation trick,
 * so the round cap sits exactly where the value ends.
 */
export const calculateRingArc = ({ radius, value, target }: RingArcInput): RingArc => {
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * calculateProgress(value, target);

  return {
    circumference,
    arcLength,
    remainder: circumference - arcLength,
  };
};
