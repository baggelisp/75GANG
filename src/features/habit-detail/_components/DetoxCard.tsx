import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SecondaryButton } from '@/components/SecondaryButton';
import { calculateDetoxProgress, decideHasWokenUp } from '@/domain/detox';
import { decideShownProgress } from '@/domain/progress';
import { HabitRecord } from '@/domain/types';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

import { formatDuration } from '../formatDuration';
import { useTicker } from '../_hooks/useTicker';
import { CounterCompleteLabel } from './CounterCompleteLabel';
import { DetoxWindowRow } from './DetoxWindowRow';

export type DetoxCardProps = {
  record: HabitRecord;
  isComplete: boolean;
  onWakeUp: () => void;
  onClear: () => void;
};

/**
 * Rule 7: on waking, one hour with no phone and three hours with no content.
 *
 * Both windows run in parallel from the single moment the user woke up, and both keep elapsing
 * while the app is closed. It is an honesty timer: the app blocks nothing and watches nothing, it
 * only keeps count — which the card says out loud rather than leaving to a code comment.
 */
export const DetoxCard = ({ record, isComplete, onWakeUp, onClear }: DetoxCardProps) => {
  const { t } = useTranslation();
  const hasWokenUp = decideHasWokenUp(record);
  const now = useTicker(hasWokenUp && !isComplete);
  const progress = calculateDetoxProgress(record, now);
  const phoneMinutes = decideShownProgress(
    record,
    progress.phone.elapsedMinutes,
    progress.phone.requiredMinutes,
  );
  const contentMinutes = decideShownProgress(
    record,
    progress.content.elapsedMinutes,
    progress.content.requiredMinutes,
  );

  if (!hasWokenUp) {
    return (
      <Card>
        <View style={styles.body}>
          <PrimaryButton
            label={t('detox.wokeUp')}
            accessibilityLabel={t('detox.wokeUpAccessibility')}
            onPress={onWakeUp}
          />
          <Text style={styles.honesty}>{t('detox.honesty')}</Text>
        </View>
      </Card>
    );
  }

  return (
    <Card>
      <View style={styles.body}>
        <DetoxWindowRow
          label={t('detox.phoneWindow')}
          reading={t('detox.reading', {
            elapsed: formatDuration(phoneMinutes),
            target: formatDuration(progress.phone.requiredMinutes),
          })}
          isDone={progress.phone.isDone}
          isFirst
        />
        <DetoxWindowRow
          label={t('detox.contentWindow')}
          reading={t('detox.reading', {
            elapsed: formatDuration(contentMinutes),
            target: formatDuration(progress.content.requiredMinutes),
          })}
          isDone={progress.content.isDone}
          isFirst={false}
        />
        <CounterCompleteLabel isComplete={isComplete} />
        <View style={styles.controls}>
          <SecondaryButton
            label={t('detox.clear')}
            accessibilityLabel={t('detox.clearAccessibility')}
            onPress={onClear}
          />
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  body: {
    gap: 0,
  },
  controls: {
    marginTop: spacing.giant,
  },
  honesty: {
    ...typography.ruleMeta,
    color: colors.textTertiary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
});
