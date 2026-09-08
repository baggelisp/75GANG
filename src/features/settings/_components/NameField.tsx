import { StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { useTranslation } from '@/i18n';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

import { SettingsNote } from './SettingsNote';

export type NameFieldProps = {
  value: string;
  isSaved: boolean;
  didFail: boolean;
  onChangeText: (text: string) => void;
  onSave: () => void;
};

export const NameField = ({ value, isSaved, didFail, onChangeText, onSave }: NameFieldProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{t('settings.nameLabel')}</Text>
      <TextInput
        accessibilityLabel={t('settings.nameLabel')}
        placeholder={t('settings.namePlaceholder')}
        placeholderTextColor={colors.textTertiary}
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
      />
      <Text style={styles.hint}>{t('settings.nameHint')}</Text>
      <PrimaryButton
        label={t('common.save')}
        accessibilityLabel={t('settings.saveName')}
        onPress={onSave}
      />
      <SettingsNote
        savedKey={isSaved ? 'settings.nameSaved' : null}
        failedKey={didFail ? 'settings.saveFailed' : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  field: {
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  label: {
    ...typography.microLabel,
    color: colors.textSecondary,
  },
  input: {
    ...typography.ruleName,
    color: colors.text,
    backgroundColor: colors.raised,
    borderRadius: radii.ruleRow,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxxl,
  },
  hint: {
    ...typography.ruleMeta,
    color: colors.textTertiary,
  },
});
