import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChallengeMode } from '@/domain/modes';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type ModeOptionProps = {
  mode: ChallengeMode;
  name: string;
  summary: string;
  ruleCountLabel: string;
  isSelected: boolean;
  onSelect: (mode: ChallengeMode) => void;
};

export const ModeOption = ({
  mode,
  name,
  summary,
  ruleCountLabel,
  isSelected,
  onSelect,
}: ModeOptionProps) => {
  const selectedStyle = isSelected ? styles.selected : null;
  const nameStyle = isSelected ? styles.nameSelected : styles.name;
  const summaryStyle = isSelected ? styles.summarySelected : styles.summary;

  const select = () => {
    onSelect(mode);
  };

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={`${name}. ${ruleCountLabel}. ${summary}`}
      onPress={select}
      style={[styles.option, selectedStyle]}
    >
      <View style={styles.header}>
        <Text style={nameStyle}>{name}</Text>
        <Text style={summaryStyle}>{ruleCountLabel}</Text>
      </View>
      <Text style={summaryStyle}>{summary}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  option: {
    borderRadius: radii.ruleRow,
    backgroundColor: colors.card,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxxl,
    gap: spacing.xxs,
  },
  selected: {
    backgroundColor: colors.coral,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  name: {
    ...typography.sectionLabel,
    color: colors.text,
  },
  nameSelected: {
    ...typography.sectionLabel,
    color: colors.ink,
  },
  summary: {
    ...typography.ruleMeta,
    color: colors.textSecondary,
  },
  summarySelected: {
    ...typography.ruleMeta,
    color: colors.ink,
  },
});
