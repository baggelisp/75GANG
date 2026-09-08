import { findCounter } from '@/domain/counters';
import { Habit } from '@/domain/habits';
import { HabitRecord } from '@/domain/types';

import { Tracker, TrackerEnum } from '../decideTracker';
import { CounterCard } from './CounterCard';
import { DetoxCard } from './DetoxCard';
import { TimerCard } from './TimerCard';
import { WorkoutCard } from './WorkoutCard';

export type HabitTrackerProps = {
  tracker: Tracker;
  habit: Habit;
  record: HabitRecord;
  isComplete: boolean;
  isOutdoor: boolean;
  onStep: (amount: number) => void;
  onStart: () => void;
  onPause: () => void;
  onStartWorkout: () => void;
  onFinishWorkout: () => void;
  onToggleOutdoor: () => void;
  onRecordByHand: () => void;
  onUndoLast: () => void;
  onWakeUp: () => void;
  onClearWakeUp: () => void;
};

/** Picks the controls for a habit's target type. */
export const HabitTracker = ({
  tracker,
  habit,
  record,
  isComplete,
  isOutdoor,
  onStep,
  onStart,
  onPause,
  onStartWorkout,
  onFinishWorkout,
  onToggleOutdoor,
  onRecordByHand,
  onUndoLast,
  onWakeUp,
  onClearWakeUp,
}: HabitTrackerProps) => {
  if (tracker === TrackerEnum.DETOX) {
    return (
      <DetoxCard
        record={record}
        isComplete={isComplete}
        onWakeUp={onWakeUp}
        onClear={onClearWakeUp}
      />
    );
  }

  if (tracker === TrackerEnum.WORKOUTS) {
    return (
      <WorkoutCard
        habit={habit}
        record={record}
        isComplete={isComplete}
        isOutdoor={isOutdoor}
        onToggleOutdoor={onToggleOutdoor}
        onStart={onStartWorkout}
        onFinish={onFinishWorkout}
        onRecordByHand={onRecordByHand}
        onUndoLast={onUndoLast}
      />
    );
  }

  if (tracker === TrackerEnum.TIMER) {
    return (
      <TimerCard
        habit={habit}
        record={record}
        isComplete={isComplete}
        onStart={onStart}
        onPause={onPause}
      />
    );
  }

  const counter = findCounter(habit);

  if (counter === null) {
    return null;
  }

  return (
    <CounterCard
      habit={habit}
      counter={counter}
      record={record}
      isComplete={isComplete}
      onStep={onStep}
    />
  );
};
