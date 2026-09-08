import { StyleSheet, Text, View } from 'react-native';

import { Achievement } from '@/domain/achievements';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

import { BadgeMark } from './BadgeMark';

export type BadgeRowProps = {
  achievement: Achievement;
  isFirst: boolean;
};

/**
 * One badge, earned or still to come.
 *
 * Three things separate the two states and only one of them is colour: an earned badge carries a
 * check mark, its name is at full strength, and it says so in words. A colour-blind user, or one
 * looking at a greyscale screenshot, can still tell them apart.
 */
export const BadgeRow = ({ achievement, isFirst }: BadgeRowProps) => {
  const { t } = useTranslation();
  const dividerStyle = isFirst ? null : styles.divider;
  const stateKey = achievement.isEarned ? 'badges.earnedState' : 'badges.lockedState';
  const nameStyle = achievement.isEarned ? styles.name : styles.lockedName;
  const name = t(`badges.${achievement.id}.name`);

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`${name}, ${t(stateKey)}`}
      style={[styles.row, dividerStyle]}
    >
      <BadgeMark isEarned={achievement.isEarned} />
      <View style={styles.text}>
        <Text style={nameStyle}>{name}</Text>
        <Text style={styles.requirement}>{t(`badges.${achievement.id}.requirement`)}</Text>
      </View>
      <Text style={styles.state}>{t(stateKey)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    paddingVertical: spacing.lg,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
  },
  text: {
    flex: 1,
    gap: spacing.hair,
  },
  name: {
    ...typography.ruleName,
    color: colors.text,
  },
  /**
   * `textSecondary` at full strength, not dimmed further. An unearned badge is something to aim
   * at, and the mark, the weight and the words already separate it from an earned one — dimming
   * it as well took it below the contrast a person can read.
   */
  lockedName: {
    ...typography.ruleName,
    color: colors.textSecondary,
  },
  requirement: {
    ...typography.ruleMeta,
    color: colors.textTertiary,
  },
  state: {
    ...typography.microLabel,
    color: colors.textSecondary,
  },
});
