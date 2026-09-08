import { StyleSheet, View } from 'react-native';

import { Pill } from '@/components/Pill';
import { spacing } from '@/theme/spacing';

export type ProfileBadgeProps = {
  badge: string | null;
};

/** Which of the three challenges is running. Absent when none is. */
export const ProfileBadge = ({ badge }: ProfileBadgeProps) => {
  if (badge === null) {
    return null;
  }

  return (
    <View style={styles.badge}>
      <Pill>{badge}</Pill>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    marginTop: spacing.xxxl,
  },
});
