import { Circle } from 'react-native-svg';

import { colors } from '@/theme/tokens';

import { RING_CENTRE, RING_STROKE_WIDTH } from './ringGeometry';

export type RingTrackProps = {
  radius: number;
};

/** The full-circle groove a ring's progress arc is drawn over. */
export const RingTrack = ({ radius }: RingTrackProps) => {
  return (
    <Circle
      cx={RING_CENTRE}
      cy={RING_CENTRE}
      r={radius}
      stroke={colors.hairline}
      strokeWidth={RING_STROKE_WIDTH}
      fill="none"
    />
  );
};
