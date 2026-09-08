import { StyleSheet, Text, View } from 'react-native';

import { BackButton } from '@/components/BackButton';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type HabitDetailUnavailableProps = {
  messageKey: string;
  onBack: () => void;
};

/** Shown when the habit is not part of this challenge, or the day could not be read. */
export const HabitDetailUnavailable = ({ messageKey, onBack }: HabitDetailUnavailableProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{t(messageKey)}</Text>
      <BackButton
        label={t('counter.back')}
        accessibilityLabel={t('counter.backAccessibility')}
        onPress={onBack}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.giant,
    padding: spacing.massive,
    backgroundColor: colors.bg,
  },
  title: {
    ...typography.greeting,
    color: colors.text,
    textAlign: 'center',
  },
});
