import { StyleSheet, Text, View } from 'react-native';

import { Pill } from '@/components/Pill';
import { countHabitsForMode } from '@/domain/habits';
import { ChallengeMode } from '@/domain/modes';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

import { RulesList } from './RulesList';

export type ModeSlideProps = {
  mode: ChallengeMode;
};

const MODE_SLIDE_MAX_HEIGHT = 520;

/**
 * One challenge, with its own rules at its own targets.
 *
 * No illustration here, unlike the narrative slides either side: these three are reference, and
 * the room goes to the rules. Eleven lines and a drawing do not both fit on a phone.
 */
export const ModeSlide = ({ mode }: ModeSlideProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.slide}>
      <Text style={styles.kicker}>{t('onboarding.modesKicker')}</Text>
      <Text style={styles.title}>{t(`modes.${mode}.name`)}</Text>
      <Pill>{t('modes.ruleCount', { count: countHabitsForMode(mode) })}</Pill>
      <Text style={styles.summary}>{t(`modes.${mode}.summary`)}</Text>
      <RulesList mode={mode} />
    </View>
  );
};

const styles = StyleSheet.create({
  slide: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.giant,
    maxHeight: MODE_SLIDE_MAX_HEIGHT,
  },
  kicker: {
    ...typography.kicker,
    color: colors.coral,
  },
  title: {
    ...typography.greeting,
    color: colors.text,
    textAlign: 'center',
  },
  summary: {
    ...typography.ruleName,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
