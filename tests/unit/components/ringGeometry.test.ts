import { calculateRingArc, RING_RADII } from '@/components/charts/ringGeometry';

const OUTER_RADIUS = 52;
const OUTER_CIRCUMFERENCE = 2 * Math.PI * OUTER_RADIUS;

describe('calculateRingArc', () => {
  it('draws no arc at zero, leaving only the track visible', () => {
    const arc = calculateRingArc({ radius: OUTER_RADIUS, value: 0, target: 11 });

    expect(arc.arcLength).toBe(0);
    expect(arc.remainder).toBeCloseTo(OUTER_CIRCUMFERENCE, 5);
  });

  it('draws a full circle when the value reaches the target', () => {
    const arc = calculateRingArc({ radius: OUTER_RADIUS, value: 11, target: 11 });

    expect(arc.arcLength).toBeCloseTo(OUTER_CIRCUMFERENCE, 5);
    expect(arc.remainder).toBeCloseTo(0, 5);
  });

  it('draws a proportional arc part-way through', () => {
    const arc = calculateRingArc({ radius: OUTER_RADIUS, value: 6, target: 11 });

    expect(arc.arcLength).toBeCloseTo(OUTER_CIRCUMFERENCE * (6 / 11), 5);
  });

  it('never exceeds a full circle when the value passes its target', () => {
    const arc = calculateRingArc({ radius: OUTER_RADIUS, value: 4.5, target: 3 });

    expect(arc.arcLength).toBeCloseTo(OUTER_CIRCUMFERENCE, 5);
    expect(arc.remainder).toBeCloseTo(0, 5);
  });

  it('treats a negative value as empty rather than drawing backwards', () => {
    const arc = calculateRingArc({ radius: OUTER_RADIUS, value: -2, target: 3 });

    expect(arc.arcLength).toBe(0);
  });

  it('treats a target of zero as empty instead of dividing by zero', () => {
    const arc = calculateRingArc({ radius: OUTER_RADIUS, value: 5, target: 0 });

    expect(arc.arcLength).toBe(0);
    expect(Number.isNaN(arc.arcLength)).toBe(false);
  });

  it('uses the radii the design system specifies for the three rings', () => {
    expect(RING_RADII).toEqual({ habits: 52, workouts: 38, water: 24 });
  });
});
