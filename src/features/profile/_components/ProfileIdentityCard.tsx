import { StyleSheet, Text, View } from 'react-native';

import { Avatar, AVATAR_SIZE_LARGE } from '@/components/Avatar';
import { Card } from '@/components/Card';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

import { ProfileBadge } from './ProfileBadge';

export type ProfileIdentityCardProps = {
  name: string | null;
  displayName: string;
  caption: string;
  badge: string | null;
};

/** Who is doing the challenge, when it began, and which of the three it is. */
export const ProfileIdentityCard = ({
  name,
  displayName,
  caption,
  badge,
}: ProfileIdentityCardProps) => {
  return (
    <Card>
      <View style={styles.row}>
        <Avatar name={name} size={AVATAR_SIZE_LARGE} hasStatusDot={false} />
        <View style={styles.identity}>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.caption}>{caption}</Text>
        </View>
      </View>
      <ProfileBadge badge={badge} />
    </Card>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxxl,
  },
  identity: {
    flex: 1,
    gap: spacing.xxs,
  },
  name: {
    ...typography.greeting,
    color: colors.text,
  },
  caption: {
    ...typography.ruleMeta,
    color: colors.textSecondary,
  },
});
