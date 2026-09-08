import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';

import { TodayAvatarInitial } from './TodayAvatarInitial';

export type TodayAvatarProps = {
  initial: string | null;
};

const AVATAR_SIZE = 40;
const DOT_SIZE = 12;

/** The avatar from the mockup: a circle with the user's initial and a butter status dot. */
export const TodayAvatar = ({ initial }: TodayAvatarProps) => {
  return (
    <View style={styles.avatar}>
      <TodayAvatarInitial initial={initial} />
      <View style={styles.dot} />
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.raised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.butter,
    borderWidth: spacing.hair,
    borderColor: colors.bg,
  },
});
