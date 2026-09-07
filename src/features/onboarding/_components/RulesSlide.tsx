import { StyleSheet, Text, View } from 'react-native';

import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

import { RulesList } from './RulesList';

export type RulesSlideProps = {
  kicker: string;
  title: string;
};

const RULES_SLIDE_MAX_HEIGHT = 420;

export const RulesSlide = ({ kicker, title }: RulesSlideProps) => {
  return (
    <View style={styles.slide}>
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
