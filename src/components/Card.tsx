import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme/tokens';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

export type CardProps = {
  children: ReactNode;
};

export const Card = ({ children }: CardProps) => {
  return <View style={styles.card}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xxxl,
  },
});
