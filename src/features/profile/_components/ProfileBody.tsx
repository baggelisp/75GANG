import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme/spacing';

import { ProfileView } from '../_hooks/useProfile';
import { BadgesCard } from './BadgesCard';
import { NoChallengeCard } from './NoChallengeCard';
import { ProfileStatsCard } from './ProfileStatsCard';

export type ProfileBodyProps = {
  profile: ProfileView;
  onStartChallenge: () => void;
};

/** The scoreboard, or the offer to start one. */
export const ProfileBody = ({ profile, onStartChallenge }: ProfileBodyProps) => {
  if (profile.startDate === null) {
    return <NoChallengeCard onStart={onStartChallenge} />;
  }

  return (
    <View style={styles.body}>
      <ProfileStatsCard
        currentDay={profile.currentDay}
        daysRemaining={profile.daysRemaining}
        perfectDays={profile.perfectDays}
        currentStreak={profile.currentStreak}
        longestStreak={profile.longestStreak}
      />
      <BadgesCard achievements={profile.achievements} />
    </View>
  );
};

const styles = StyleSheet.create({
  body: {
    gap: spacing.lg,
  },
});
