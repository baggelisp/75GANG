import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { decideHabitIsComplete } from '@/domain/completion';
import { describeHabitTargets, Habit } from '@/domain/habits';
import { ChallengeMode } from '@/domain/modes';
import { HabitRecord } from '@/domain/types';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';

import { describeHabitNote } from '../describeHabitNote';
import { describeHabitProgress } from '../describeHabitProgress';
import { RuleRow } from './RuleRow';
import { TodayCardHeader } from './TodayCardHeader';

export type RuleListProps = {
  habits: readonly Habit[];
  records: Record<string, HabitRecord>;
  mode: ChallengeMode;
  completedHabits: number;
  onPressRule: (habitId: string) => void;
};

export const RuleList = ({
  habits,
  records,
  mode,
  completedHabits,
  onPressRule,
}: RuleListProps) => {
  const { t } = useTranslation();

  const describe = (habit: Habit): string | null => {
    const progress = describeHabitProgress(habit, records[habit.id]);

    if (progress !== null) {
      return t(progress.key, progress.values);
    }

    const noteKey = describeHabitNote(habit);

    if (noteKey === null) {
      return null;
    }

    return t(noteKey);
  };

  return (
    <Card>
      <TodayCardHeader
        title={t('today.sectionRules')}
        badge={t('today.habitsFraction', { done: completedHabits, total: habits.length })}
      />
      <View style={styles.list}>
        {habits.map((habit, index) => (
          <RuleRow
            key={habit.id}
            habitId={habit.id}
            name={t(`habits.${habit.id}.name`, describeHabitTargets(habit))}
            meta={describe(habit)}
            isDone={decideHabitIsComplete(
              habit.id,
              records[habit.id] ?? { completed: false },
              mode,
            )}
            isFirst={index === 0}
            accessibilityLabel={t(`habits.${habit.id}.name`, describeHabitTargets(habit))}
            onPress={onPressRule}
          />
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  list: {
    marginTop: spacing.sm,
  },
});
