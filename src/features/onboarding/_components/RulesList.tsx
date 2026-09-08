import { ScrollView, StyleSheet } from 'react-native';

import { decideHabitNameKey, describeHabitTargets, resolveHabitsForMode } from '@/domain/habits';
import { ChallengeMode } from '@/domain/modes';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';

import { RuleLine } from './RuleLine';

/**
 * Rules are numbered within their own challenge. Easy carries rules 1, 3, 4, 6, 8 and 10 of the
 * eleven, and a list headed "6 rules" that jumps from 1 to 3 reads as though something is missing.
 */
const FIRST_RULE = 1;

export type RulesListProps = {
  mode: ChallengeMode;
};

/**
 * The rules of one challenge, read from the domain so this list can never drift from the app.
 *
 * Keyed on the mode rather than on the eleven: Easy and Medium are strict subsets at lighter
 * targets, and a list that always showed Hard's numbers would be promising the wrong challenge.
 */
export const RulesList = ({ mode }: RulesListProps) => {
  const { t } = useTranslation();

  return (
    <ScrollView style={styles.list} contentContainerStyle={styles.content}>
      {resolveHabitsForMode(mode).map((habit, index) => (
        <RuleLine
          key={habit.id}
          number={index + FIRST_RULE}
          name={t(decideHabitNameKey(habit), describeHabitTargets(habit))}
          accessibilityLabel={t('onboarding.ruleLine', {
            number: index + FIRST_RULE,
            name: t(decideHabitNameKey(habit), describeHabitTargets(habit)),
          })}
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
