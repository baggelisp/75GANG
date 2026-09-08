import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SecondaryButton } from '@/components/SecondaryButton';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type MarkDoneCardProps = {
  isMarkedDone: boolean;
  onMark: () => void;
  onUnmark: () => void;
};

/**
 * Marking a rule done without the counter reaching its target.
 *
 * Some rules cannot be caught up: you cannot retroactively start the morning detox at seven, and
 * a day that was lived but not logged would otherwise cost a perfect day for a missed button
 * rather than a missed habit. The card says plainly which of the two happened, so nothing here
 * pretends the counter did the work.
 */
export const MarkDoneCard = ({ isMarkedDone, onMark, onUnmark }: MarkDoneCardProps) => {
  const { t } = useTranslation();

  if (isMarkedDone) {
    return (
      <Card>
        <View style={styles.content}>
          <Text style={styles.marked}>{t('markDone.marked')}</Text>
          <SecondaryButton
            label={t('markDone.undo')}
            accessibilityLabel={t('markDone.undoAccessibility')}
            onPress={onUnmark}
          />
        </View>
      </Card>
    );
  }

  return (
    <Card>
      <View style={styles.content}>
        <Text style={styles.hint}>{t('markDone.hint')}</Text>
        <PrimaryButton
          label={t('markDone.mark')}
          accessibilityLabel={t('markDone.markAccessibility')}
          onPress={onMark}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: spacing.xxxl,
  },
  hint: {
    ...typography.ruleMeta,
    color: colors.textSecondary,
  },
  marked: {
    ...typography.ruleName,
    color: colors.coral,
  },
});
