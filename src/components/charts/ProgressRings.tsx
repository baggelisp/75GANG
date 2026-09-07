import Svg, { G } from 'react-native-svg';

import { colors } from '@/theme/tokens';

import { RingArc } from './RingArc';
import { RingTrack } from './RingTrack';
import { RING_CENTRE, RING_RADII, RING_VIEWBOX_SIZE } from './ringGeometry';

export type ProgressRingsProps = {
  habitsCompleted: number;
  habitsTarget: number;
  workoutsCompleted: number;
  workoutsTarget: number;
  waterLitres: number;
  waterTargetLitres: number;
  accessibilityLabel: string;
  size?: number;
};

const ROTATION_TO_TWELVE_OCLOCK = -90;

/**
 * The Today card's three concentric rings: habits outermost in coral, workouts in lavender, water
 * innermost in butter. All three share one accessibility label — three silent circles are not
 * accessible.
 */
export const ProgressRings = ({
  habitsCompleted,
  habitsTarget,
  workoutsCompleted,
  workoutsTarget,
  waterLitres,
  waterTargetLitres,
  accessibilityLabel,
  size = RING_VIEWBOX_SIZE,
}: ProgressRingsProps) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${RING_VIEWBOX_SIZE} ${RING_VIEWBOX_SIZE}`}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      <G rotation={ROTATION_TO_TWELVE_OCLOCK} origin={`${RING_CENTRE}, ${RING_CENTRE}`}>
        <RingTrack radius={RING_RADII.habits} />
        <RingTrack radius={RING_RADII.workouts} />
        <RingTrack radius={RING_RADII.water} />
        <RingArc
          radius={RING_RADII.habits}
          color={colors.coral}
          value={habitsCompleted}
          target={habitsTarget}
        />
        <RingArc
          radius={RING_RADII.workouts}
          color={colors.lavender}
          value={workoutsCompleted}
          target={workoutsTarget}
        />
        <RingArc
          radius={RING_RADII.water}
          color={colors.butter}
          value={waterLitres}
          target={waterTargetLitres}
        />
      </G>
    </Svg>
  );
};
