import { StyleSheet, View } from 'react-native';

import { countHabitsForMode } from '@/domain/habits';
import { CHALLENGE_MODES, ChallengeMode } from '@/domain/modes';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';

import { ModeOption } from './ModeOption';

export type ModePickerProps = {
  selected: ChallengeMode;
  onSelect: (mode: ChallengeMode) => void;
};

/**
 * The three challenges. Hard is the rules image exactly; Easy and Medium are strict subsets of it
 * at lighter targets, so moving up is a step rather than a different challenge.
 */
export const ModePicker = ({ selected, onSelect }: ModePickerProps) => {
  const { t } = useTranslation();

  return (
    <View accessibilityRole="radiogroup" style={styles.picker}>
      {CHALLENGE_MODES.map((mode) => (
        <ModeOption
          key={mode}
          mode={mode}
          name={t(`modes.${mode}.name`)}
          summary={t(`modes.${mode}.summary`)}
          ruleCountLabel={t('modes.ruleCount', { count: countHabitsForMode(mode) })}
          isSelected={mode === selected}
          onSelect={onSelect}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  picker: {
    gap: spacing.sm,
  },
});
