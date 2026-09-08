import { StyleSheet, Text, View } from 'react-native';

import { Avatar, AVATAR_SIZE_SMALL } from '@/components/Avatar';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type TodayHeaderProps = {
  kicker: string;
  greeting: string;
  name: string | null;
};

export const TodayHeader = ({ kicker, greeting, name }: TodayHeaderProps) => {
  return (
    <View style={styles.header}>
      <View style={styles.text}>
        <Text style={styles.kicker}>{kicker}</Text>
        <Text style={styles.greeting}>{greeting}</Text>
      </View>
      <Avatar name={name} size={AVATAR_SIZE_SMALL} hasStatusDot />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.xl,
    paddingVertical: spacing.xs,
  },
  text: {
    flex: 1,
    gap: spacing.xxs,
  },
  kicker: {
    ...typography.kicker,
    color: colors.textSecondary,
  },
  greeting: {
    ...typography.greeting,
    color: colors.text,
  },
});
