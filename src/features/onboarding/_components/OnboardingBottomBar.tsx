import { StyleSheet, View } from 'react-native';

import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';

import { OnboardingBarButton } from './OnboardingBarButton';
import { OnboardingDots } from './OnboardingDots';
import { OnboardingSkipButton } from './OnboardingSkipButton';

export type OnboardingBottomBarProps = {
  pageCount: number;
  currentPage: number;
  onSkip: () => void;
  onNext: () => void;
  onDone: () => void;
};

/**
 * Skip, the page dots, and next or done.
 *
 * Built here rather than using the library's own pagination, which sizes its dot row with the
 * `flex: 0` shorthand. react-native-web resolves that to a flex-basis of zero, so the row collapses
 * and the dots hang to the right of the centre instead of sitting on it. The library also ignores
 * the style it passes its own Dots component, so there is no way to correct it from outside.
 */
export const OnboardingBottomBar = ({
  pageCount,
  currentPage,
  onSkip,
  onNext,
  onDone,
}: OnboardingBottomBarProps) => {
  const { t } = useTranslation();
  const isLastPage = currentPage === pageCount - 1;

  return (
    <View style={styles.bar}>
      <View style={styles.side}>
        <OnboardingSkipButton
          isLastPage={isLastPage}
          label={t('onboarding.skip')}
          onSkip={onSkip}
        />
      </View>

      <OnboardingDots pageCount={pageCount} currentPage={currentPage} />

      <View style={styles.sideRight}>
        <OnboardingBarButton
          label={isLastPage ? t('onboarding.done') : t('onboarding.next')}
          align="right"
          isProminent={isLastPage}
          onPress={isLastPage ? onDone : onNext}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.giant,
  },
  side: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    alignItems: 'flex-start',
  },
  sideRight: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    alignItems: 'flex-end',
  },
});
