import { ScrollView, StyleSheet } from 'react-native';

import { describeHabitTargets, HABITS } from '@/domain/habits';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';

import { RuleLine } from './RuleLine';

/** The eleven rules, read from the domain so this list can never drift from the app. */
export const RulesList = () => {
  const { t } = useTranslation();

  return (
    <ScrollView style={styles.list} contentContainerStyle={styles.content}>
      {HABITS.map((habit) => (
        <RuleLine
          key={habit.id}
          number={habit.number}
          name={t(`habits.${habit.id}.name`, describeHabitTargets(habit))}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  list: {
    alignSelf: 'stretch',
  },
  content: {
    gap: spacing.sm,
  },
});
