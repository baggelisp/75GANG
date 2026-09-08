import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme/tokens';

export type OnboardingDotProps = {
  isCurrent: boolean;
};

const DOT_SIZE = 7;

/** Coral for the page you are on — the accent this design system gives to active. */
export const OnboardingDot = ({ isCurrent }: OnboardingDotProps) => {
  const stateStyle = isCurrent ? styles.current : styles.other;

  return <View style={[styles.dot, stateStyle]} />;
};

const styles = StyleSheet.create({
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  current: {
    backgroundColor: colors.coral,
  },
  other: {
    backgroundColor: colors.outline,
  },
});
