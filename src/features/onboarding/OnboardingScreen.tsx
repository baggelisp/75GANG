import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';

import { useTranslation } from '@/i18n';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

import { OnboardingSlide } from './_components/OnboardingSlide';
import { SwiperLabel } from './_components/SwiperLabel';
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

  const goToStart = () => {
    router.push('/onboarding/start');
  };

  const pages = [
    {
      backgroundColor: colors.bg,
      image: <View />,
      title: (
        <OnboardingSlide
          kicker={t('onboarding.welcomeKicker')}
          title={t('onboarding.welcomeTitle')}
          body={t('onboarding.welcomeBody')}
        />
      ),
      subtitle: '',
    },
    {
      backgroundColor: colors.bg,
      image: <View />,
      title: (
        <OnboardingSlide
          kicker={t('onboarding.howKicker')}
          title={t('onboarding.howTitle')}
          body={t('onboarding.howBody')}
        />
      ),
      subtitle: '',
    },
    {
      backgroundColor: colors.bg,
      image: <View />,
      title: <RulesSlide kicker={t('onboarding.rulesKicker')} title={t('onboarding.rulesTitle')} />,
      subtitle: '',
    },
    {
      backgroundColor: colors.bg,
      image: <View />,
      title: (
        <OnboardingSlide
          kicker={t('onboarding.privacyKicker')}
          title={t('onboarding.privacyTitle')}
          body={t('onboarding.privacyBody')}
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
        showSkip
        skipLabel={<SwiperLabel label={t('onboarding.skip')} />}
        nextLabel={<SwiperLabel label={t('onboarding.next')} />}
        doneLabel={<SwiperLabel label={t('onboarding.done')} />}
        bottomBarColor={colors.bg}
        bottomBarHighlight={false}
        containerStyles={styles.container}
        titleStyles={styles.title}
        subTitleStyles={styles.subtitle}
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
