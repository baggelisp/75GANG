import { findCounter } from '@/domain/counters';
import { Habit } from '@/domain/habits';
import { HabitRecord } from '@/domain/types';

import { Tracker, TrackerEnum } from '../decideTracker';
import { CounterCard } from './CounterCard';
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
}: HabitTrackerProps) => {
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
