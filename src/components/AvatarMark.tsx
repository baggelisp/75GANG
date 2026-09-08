import AntDesign from '@expo/vector-icons/AntDesign';
import { StyleSheet, Text } from 'react-native';

import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type AvatarMarkProps = {
  initial: string | null;
  size: number;
};

const ICON_SCALE = 0.45;

/** The initial, or a person icon when no name was given — an empty circle reads as a failed load. */
export const AvatarMark = ({ initial, size }: AvatarMarkProps) => {
  if (initial === null) {
    return (
      <AntDesign name="user" size={Math.round(size * ICON_SCALE)} color={colors.textSecondary} />
    );
  }

  return <Text style={styles.initial}>{initial}</Text>;
};

const styles = StyleSheet.create({
  initial: {
    ...typography.statValue,
    color: colors.text,
  },
});
