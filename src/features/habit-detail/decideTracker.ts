import { findCounter } from '@/domain/counters';
import { Habit } from '@/domain/habits';
import { TargetType, TargetTypeEnum } from '@/domain/targets';

export const TrackerEnum = {
  COUNTER: 'COUNTER',
  TIMER: 'TIMER',
  WORKOUTS: 'WORKOUTS',
  DETOX: 'DETOX',
  NOT_BUILT_YET: 'NOT_BUILT_YET',
} as const;

export type Tracker = (typeof TrackerEnum)[keyof typeof TrackerEnum];

const TRACKER_BY_TARGET_TYPE: Readonly<Record<TargetType, Tracker>> = {
  [TargetTypeEnum.BOOLEAN]: TrackerEnum.NOT_BUILT_YET,
  [TargetTypeEnum.LITRES]: TrackerEnum.COUNTER,
  [TargetTypeEnum.PAGES]: TrackerEnum.COUNTER,
  [TargetTypeEnum.MINUTES]: TrackerEnum.TIMER,
  [TargetTypeEnum.SESSIONS]: TrackerEnum.WORKOUTS,
  [TargetTypeEnum.WINDOWS]: TrackerEnum.DETOX,
  [TargetTypeEnum.MEASUREMENT]: TrackerEnum.NOT_BUILT_YET,
};

/**
 * Which controls a habit gets, keyed by target type and stated for every one of them.
 *
 * Exhaustive on purpose: a target type added without deciding this is a compile error rather than
 * a screen that renders a raw translation key, which is exactly what happened when the counter
 * screen fell through for three of the eleven rules.
 */
export const decideTracker = (habit: Habit): Tracker => {
  const tracker = TRACKER_BY_TARGET_TYPE[habit.targetType];

  if (tracker === TrackerEnum.COUNTER && findCounter(habit) === null) {
    return TrackerEnum.NOT_BUILT_YET;
  }

  return tracker;
};
