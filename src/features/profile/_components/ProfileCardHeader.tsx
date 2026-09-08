import { StyleSheet, Text, View } from 'react-native';

import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type ProfileCardHeaderProps = {
  title: string;
  badge: string;
};

export const ProfileCardHeader = ({ title, badge }: ProfileCardHeaderProps) => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.badge}>{badge}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  title: {
    ...typography.sectionLabel,
    color: colors.text,
  },
  badge: {
    ...typography.microLabel,
    color: colors.textSecondary,
  },
});
