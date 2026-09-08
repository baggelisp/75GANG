import { StyleSheet, Text } from 'react-native';

import { useTranslation } from '@/i18n';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type JournalSavedNoteProps = {
  isSaved: boolean;
  didFail: boolean;
};

/** Says plainly whether the entry is on the device, rather than leaving the user guessing. */
export const JournalSavedNote = ({ isSaved, didFail }: JournalSavedNoteProps) => {
  const { t } = useTranslation();

  if (didFail) {
    return (
      <Text accessibilityRole="alert" style={styles.failed}>
        {t('journal.saveFailed')}
      </Text>
    );
  }

  if (!isSaved) {
    return null;
  }

  return <Text style={styles.saved}>{t('journal.saved')}</Text>;
};

const styles = StyleSheet.create({
  saved: {
    ...typography.microLabel,
    color: colors.coral,
    textAlign: 'center',
  },
  failed: {
    ...typography.ruleName,
    color: colors.text,
    textAlign: 'center',
  },
});
