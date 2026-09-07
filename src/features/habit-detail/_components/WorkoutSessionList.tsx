import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme/spacing';

import { WorkoutSession } from '@/domain/types';
import { buildSessionKey } from '@/domain/workouts';

import { WorkoutSessionRow } from './WorkoutSessionRow';

export type WorkoutSessionListProps = {
  sessions: readonly WorkoutSession[];
  minutesRequired: number;
};

export const WorkoutSessionList = ({ sessions, minutesRequired }: WorkoutSessionListProps) => {
  return (
    <View style={styles.list}>
      {sessions.map((session, index) => (
        <WorkoutSessionRow
          key={buildSessionKey(session, index)}
          index={index}
          isFirst={index === 0}
          minutes={session.minutes}
          isOutdoor={session.outdoor}
          isLongEnough={session.minutes >= minutesRequired}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    marginTop: spacing.sm,
  },
});
