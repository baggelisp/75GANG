import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';

import { useTranslation } from '@/i18n';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

import { EmptySlideImage } from './_components/EmptySlideImage';
import { OnboardingBottomBar } from './_components/OnboardingBottomBar';
import { findIllustration, OnboardingSlideEnum } from './_illustrations/findIllustration';
import { OnboardingSlide } from './_components/OnboardingSlide';
import { RulesSlide } from './_components/RulesSlide';

/**
 * The intro carousel, using `react-native-onboarding-swiper` rather than a hand-rolled pager.
 *
 * The library owns paging, the dots and the skip/next/done buttons; everything visible is ours, so
 * the palette and type scale still come from the theme.
 */
export const OnboardingScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const swiper = useRef<Onboarding>(null);

  const goToStart = () => {
    router.push('/onboarding/start');
  };

  const goToNextPage = () => {
    swiper.current?.goNext();
  };

  const pages = [
    {
      backgroundColor: colors.bg,
      image: <EmptySlideImage />,
      title: (
        <OnboardingSlide
          kicker={t('onboarding.welcomeKicker')}
          title={t('onboarding.welcomeTitle')}
          body={t('onboarding.welcomeBody')}
          illustration={findIllustration(OnboardingSlideEnum.WELCOME)}
          illustrationLabel={t('onboarding.welcomeIllustration')}
        />
      ),
      subtitle: '',
    },
    {
      backgroundColor: colors.bg,
      image: <EmptySlideImage />,
      title: (
        <OnboardingSlide
          kicker={t('onboarding.howKicker')}
          title={t('onboarding.howTitle')}
          body={t('onboarding.howBody')}
          illustration={findIllustration(OnboardingSlideEnum.HOW_IT_WORKS)}
          illustrationLabel={t('onboarding.howIllustration')}
        />
      ),
      subtitle: '',
    },
    {
      backgroundColor: colors.bg,
      image: <EmptySlideImage />,
      title: (
        <RulesSlide
          kicker={t('onboarding.rulesKicker')}
          title={t('onboarding.rulesTitle')}
          illustration={findIllustration(OnboardingSlideEnum.THE_RULES)}
          illustrationLabel={t('onboarding.rulesIllustration')}
        />
      ),
      subtitle: '',
    },
    {
      backgroundColor: colors.bg,
      image: <EmptySlideImage />,
      title: (
        <OnboardingSlide
          kicker={t('onboarding.privacyKicker')}
          title={t('onboarding.privacyTitle')}
          body={t('onboarding.privacyBody')}
          illustration={findIllustration(OnboardingSlideEnum.YOUR_DATA)}
          illustrationLabel={t('onboarding.privacyIllustration')}
        />
      ),
      subtitle: '',
    },
  ];

  return (
    <View style={styles.screen}>
      <Onboarding
        pages={pages}
        onSkip={goToStart}
        onDone={goToStart}
        showPagination={false}
        pageIndexCallback={setCurrentPage}
        ref={swiper}
        containerStyles={styles.container}
        titleStyles={styles.title}
        subTitleStyles={styles.subtitle}
      />
      <OnboardingBottomBar
        pageCount={pages.length}
        currentPage={currentPage}
        onSkip={goToStart}
        onNext={goToNextPage}
        onDone={goToStart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    backgroundColor: colors.bg,
  },
  title: {
    ...typography.greeting,
    color: colors.text,
  },
  subtitle: {
    ...typography.ruleMeta,
    color: colors.textSecondary,
  },
});
