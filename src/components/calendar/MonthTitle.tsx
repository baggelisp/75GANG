import { StyleSheet, Text } from 'react-native';

import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type MonthTitleProps = {
  children: string;
};

export const MonthTitle = ({ children }: MonthTitleProps) => {
  return <Text style={styles.title}>{children}</Text>;
};

const styles = StyleSheet.create({
  title: {
    ...typography.microLabel,
    color: colors.textSecondary,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
});
