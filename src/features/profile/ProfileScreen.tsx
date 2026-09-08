import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { SecondaryButton } from '@/components/SecondaryButton';
import { ChallengeMode } from '@/domain/modes';
import { Translate, useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';
import { formatLongDateWithYear } from '@/utils/DateUtility';

import { ProfileBody } from './_components/ProfileBody';
import { ProfileIdentityCard } from './_components/ProfileIdentityCard';
import { ProfileLoading } from './_components/ProfileLoading';
import { ProfileUnavailable } from './_components/ProfileUnavailable';
import { ProfileStatusEnum, ProfileView, useProfile } from './_hooks/useProfile';

/** Who you are, where your challenge stands, and the way through to everything you can change. */
export const ProfileScreen = () => {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const profile = useProfile();

  // The screen is the one place a challenge can be erased or restarted, and both happen on the
  // settings screen. Coming back to a stale identity card would show a challenge that is gone.
  const refresh = profile.refresh;
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  if (profile.status === ProfileStatusEnum.LOADING) {
    return <ProfileLoading />;
  }

  if (profile.status === ProfileStatusEnum.UNAVAILABLE) {
    return <ProfileUnavailable onRetry={profile.refresh} />;
  }

  const openSettings = () => router.push('/settings');
  const startChallenge = () => router.push('/onboarding/start');

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ProfileIdentityCard
          name={profile.name}
          displayName={decideDisplayName(profile.name, t)}
          caption={decideCaption(profile, t, locale)}
          badge={decideModeBadge(profile.mode, t)}
        />

        <ProfileBody profile={profile} onStartChallenge={startChallenge} />

        <View style={styles.actions}>
          <SecondaryButton
            label={t('profile.settings')}
            accessibilityLabel={t('profile.settingsAccessibility')}
            onPress={openSettings}
          />
        </View>
      </ScrollView>
    </Screen>
  );
};

const decideDisplayName = (name: string | null, t: Translate): string => {
  if (name === null || name.trim().length === 0) {
    return t('profile.anonymous');
  }

  return name;
};

const decideCaption = (profile: ProfileView, t: Translate, locale: string): string => {
  if (profile.startDate === null) {
    return t('profile.kicker');
  }

  return t('profile.startedOn', { date: formatLongDateWithYear(profile.startDate, locale) });
};

const decideModeBadge = (mode: ChallengeMode | null, t: Translate): string | null => {
  if (mode === null) {
    return null;
  }

  return t('profile.modeLabel', { mode: t(`modes.${mode}.name`) });
};

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingTop: spacing.giant,
    paddingBottom: spacing.massive,
  },
  actions: {
    marginTop: spacing.xs,
  },
});
