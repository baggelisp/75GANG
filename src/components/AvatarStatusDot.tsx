import { StyleSheet, View } from 'react-native';

import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';

export type AvatarStatusDotProps = {
  isVisible: boolean;
};

const DOT_SIZE = 12;

/** The butter dot from the mockup, on the Today header's avatar and nowhere else. */
export const AvatarStatusDot = ({ isVisible }: AvatarStatusDotProps) => {
  if (!isVisible) {
    return null;
  }

  return <View style={styles.dot} />;
};

const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: radii.pill,
    backgroundColor: colors.butter,
    borderWidth: spacing.hair,
    borderColor: colors.bg,
  },
});
