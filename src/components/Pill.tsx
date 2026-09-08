import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/tokens';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export type PillProps = {
  children: string;
};

export const Pill = ({ children }: PillProps) => {
  return (
    <View style={styles.pill}>
      <Text style={styles.label}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.md,
  },
  label: {
    ...typography.microLabel,
    color: colors.textSecondary,
  },
});
