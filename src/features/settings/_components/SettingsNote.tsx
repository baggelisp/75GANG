import { StyleSheet, Text } from 'react-native';

import { useTranslation } from '@/i18n';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type SettingsNoteProps = {
  savedKey: string | null;
  failedKey: string | null;
};

/**
 * What happened to the last change. A failure is never silent: a setting that looks applied but
 * was not written is the one thing worse than a visible error.
 */
export const SettingsNote = ({ savedKey, failedKey }: SettingsNoteProps) => {
  const { t } = useTranslation();

  if (failedKey !== null) {
    return <Text style={styles.failed}>{t(failedKey)}</Text>;
  }

  if (savedKey === null) {
    return null;
  }

  return <Text style={styles.saved}>{t(savedKey)}</Text>;
};

const styles = StyleSheet.create({
  saved: {
    ...typography.ruleMeta,
    color: colors.textSecondary,
  },
  failed: {
    ...typography.ruleMeta,
    color: colors.coral,
  },
});
