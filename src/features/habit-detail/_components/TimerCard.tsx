import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Habit } from '@/domain/habits';
import { calculateTimerMinutes, decideTimerIsRunning } from '@/domain/timers';
import { HabitRecord } from '@/domain/types';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';

import { formatDuration } from '../formatDuration';
import { useTicker } from '../_hooks/useTicker';
import { TimerControls } from './TimerControls';
import { TimerReadout } from './TimerReadout';

export type TimerCardProps = {
  habit: Habit;
  record: HabitRecord;
  isComplete: boolean;
  onStart: () => void;
  onPause: () => void;
};

/**
 * A single timer. The elapsed number is derived from the stored start timestamp against the
 * ticker's live reading, so it advances on screen; nothing is written between start and pause.
 */
export const TimerCard = ({ habit, record, isComplete, onStart, onPause }: TimerCardProps) => {
  const { t } = useTranslation();
  const isRunning = decideTimerIsRunning(record);
  const now = useTicker(isRunning);
  const targetMinutes = habit.targetValue ?? 0;

  return (
    <Card>
      <View style={styles.body}>
        <TimerReadout
          elapsed={formatDuration(calculateTimerMinutes(record, now))}
          target={t('timer.target', { minutes: targetMinutes })}
          isComplete={isComplete}
        />
        <TimerControls isRunning={isRunning} onStart={onStart} onPause={onPause} />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  body: {
    gap: spacing.sm,
  },
});
