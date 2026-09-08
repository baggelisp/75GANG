import { StyleSheet, Text, View } from 'react-native';

import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

import { OnboardingIllustration } from './OnboardingIllustration';
import { RulesList } from './RulesList';

export type RulesSlideProps = {
  kicker: string;
  title: string;
  illustration: string;
  illustrationLabel: string;
};

const RULES_SLIDE_MAX_HEIGHT = 520;

export const RulesSlide = ({ kicker, title, illustration, illustrationLabel }: RulesSlideProps) => {
  return (
    <View style={styles.slide}>
      <OnboardingIllustration xml={illustration} accessibilityLabel={illustrationLabel} />
      <Text style={styles.kicker}>{kicker}</Text>
      <Text style={styles.title}>{title}</Text>
      <RulesList />
    </View>
  );
};

const styles = StyleSheet.create({
  slide: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.giant,
    maxHeight: RULES_SLIDE_MAX_HEIGHT,
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
});
