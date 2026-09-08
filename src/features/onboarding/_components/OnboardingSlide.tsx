import { StyleSheet, Text, View } from 'react-native';

import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

import { OnboardingIllustration } from './OnboardingIllustration';

export type OnboardingSlideProps = {
  kicker: string;
  title: string;
  body: string;
  illustration: string;
  illustrationLabel: string;
};

export const OnboardingSlide = ({
  kicker,
  title,
  body,
  illustration,
  illustrationLabel,
}: OnboardingSlideProps) => {
  return (
    <View style={styles.slide}>
      <OnboardingIllustration xml={illustration} accessibilityLabel={illustrationLabel} />
      <Text style={styles.kicker}>{kicker}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  slide: {
    alignItems: 'center',
    gap: spacing.xl,
    paddingHorizontal: spacing.massive,
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
  body: {
    ...typography.ruleName,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
