import { StyleSheet, Text, TextInput, View } from 'react-native';

import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type JournalFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
};

const FIELD_MIN_HEIGHT = 96;

export const JournalField = ({ label, placeholder, value, onChangeText }: JournalFieldProps) => {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        value={value}
        onChangeText={onChangeText}
        multiline
        textAlignVertical="top"
        style={styles.input}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  field: {
    gap: spacing.sm,
  },
  label: {
    ...typography.sectionLabel,
    color: colors.textSecondary,
  },
  input: {
    ...typography.ruleName,
    minHeight: FIELD_MIN_HEIGHT,
    color: colors.text,
    backgroundColor: colors.card,
    borderRadius: radii.ruleRow,
    padding: spacing.xxxl,
  },
});
