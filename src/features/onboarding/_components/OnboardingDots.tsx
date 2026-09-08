import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme/spacing';

import { OnboardingDot } from './OnboardingDot';

export type OnboardingDotsProps = {
  pageCount: number;
  currentPage: number;
};

/**
 * The page indicator.
 *
 * Sized with flex longhands rather than the `flex: 0` shorthand: react-native-web resolves that
 * shorthand to a flex-basis of zero, which collapses the row to nothing and leaves the dots
 * hanging off the centre line — which is exactly what the library's own pagination does.
 */
export const OnboardingDots = ({ pageCount, currentPage }: OnboardingDotsProps) => {
  const pages = Array.from({ length: pageCount }, (_unused, index) => index);

  return (
    <View style={styles.dots}>
      {pages.map((page) => (
        <OnboardingDot key={page} isCurrent={page === currentPage} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  dots: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
