import { Circle } from 'react-native-svg';

import { calculateRingArc, RING_CENTRE, RING_STROKE_WIDTH } from './ringGeometry';

export type RingArcProps = {
  radius: number;
  color: string;
  value: number;
  target: number;
};

/**
 * One ring's progress, expressed as a `strokeDasharray` of `<arc> <remainder>` rather than a
 * rotation, so the round cap lands exactly on the value.
 */
export const RingArc = ({ radius, color, value, target }: RingArcProps) => {
  const arc = calculateRingArc({ radius, value, target });

  // A zero-length dash with a round cap is painted as a dot, so an empty ring would show an
  // accent spot at twelve o'clock and read as progress. Draw nothing; the track is already there.
  if (arc.arcLength === 0) {
    return null;
  }

  return (
    <Circle
      cx={RING_CENTRE}
      cy={RING_CENTRE}
      r={radius}
      stroke={color}
      strokeWidth={RING_STROKE_WIDTH}
      strokeLinecap="round"
      strokeDasharray={`${arc.arcLength} ${arc.remainder}`}
      fill="none"
    />
  );
};
