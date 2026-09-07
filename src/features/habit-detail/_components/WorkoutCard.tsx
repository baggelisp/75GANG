import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { SecondaryButton } from '@/components/SecondaryButton';
import { Habit } from '@/domain/habits';
import { WORKOUT_MINUTES_REQUIRED } from '@/domain/targets';
import { calculateElapsedMinutes, decideTimerIsRunning } from '@/domain/timers';
import { HabitRecord } from '@/domain/types';
import { countQualifyingSessions } from '@/domain/workouts';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';

import { formatDuration } from '../formatDuration';
import { useTicker } from '../_hooks/useTicker';
import { CounterCompleteLabel } from './CounterCompleteLabel';
import { OutdoorToggle } from './OutdoorToggle';
import { TimerReadout } from './TimerReadout';
import { WorkoutPrimaryControl } from './WorkoutPrimaryControl';
import { WorkoutSessionList } from './WorkoutSessionList';

export type WorkoutCardProps = {
  habit: Habit;
  record: HabitRecord;
  isComplete: boolean;
  isOutdoor: boolean;
  onToggleOutdoor: () => void;
  onStart: () => void;
  onFinish: () => void;
  onRecordByHand: () => void;
  onUndoLast: () => void;
};

/**
 * Rule 4: two workouts, each of at least the mode's session length, one ideally outdoors.
 *
 * Each finished workout is recorded as one session however long it ran — ninety minutes in one go
 * is one workout, not two.
 */
export const WorkoutCard = ({
  habit,
  record,
  isComplete,
  isOutdoor,
  onToggleOutdoor,
  onStart,
  onFinish,
  onRecordByHand,
  onUndoLast,
}: WorkoutCardProps) => {
  const { t } = useTranslation();
  const isRunning = decideTimerIsRunning(record);
  const now = useTicker(isRunning);
  const sessions = record.sessions ?? [];
  const minutesRequired = habit.sessionMinutes ?? WORKOUT_MINUTES_REQUIRED;
  const sessionsDone = countQualifyingSessions(record, minutesRequired);
  const sessionsRequired = habit.targetValue ?? 0;

  return (
    <Card>
      <View style={styles.body}>
        <TimerReadout
          elapsed={formatDuration(calculateElapsedMinutes(record.startedAt, now))}
          target={t('timer.workoutTarget', {
            done: sessionsDone,
            total: sessionsRequired,
            minutes: minutesRequired,
          })}
          isComplete={false}
        />

        <WorkoutSessionList sessions={sessions} minutesRequired={minutesRequired} />
        <CounterCompleteLabel isComplete={isComplete} />

        <View style={styles.controls}>
          <OutdoorToggle isOutdoor={isOutdoor} isDisabled={isRunning} onToggle={onToggleOutdoor} />
          <WorkoutPrimaryControl isRunning={isRunning} onStart={onStart} onFinish={onFinish} />
          <SecondaryButton
            label={t('timer.recordByHand')}
            accessibilityLabel={t('timer.recordByHandAccessibility', { minutes: minutesRequired })}
            onPress={onRecordByHand}
          />
          <SecondaryButton
            label={t('timer.undoSession')}
            accessibilityLabel={t('timer.undoSession')}
            onPress={onUndoLast}
          />
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  body: {
    gap: spacing.sm,
  },
  controls: {
    gap: spacing.lg,
    marginTop: spacing.giant,
  },
});
