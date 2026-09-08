import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SecondaryButton } from '@/components/SecondaryButton';
import { HabitRecord } from '@/domain/types';
import { decideHasPhoto } from '@/domain/weighIn';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';

import { CounterCompleteLabel } from './CounterCompleteLabel';
import { ProgressPhoto } from './ProgressPhoto';
import { WeightStepper } from './WeightStepper';

export type WeighInCardProps = {
  record: HabitRecord;
  isComplete: boolean;
  weightText: string;
  photoUri: string | null;
  onChangeWeight: (text: string) => void;
  onStepDown: () => void;
  onStepUp: () => void;
  onTakePhoto: () => void;
  onChoosePhoto: () => void;
};

/** Rule 9: a weight and a mirror photo, both needed before the day counts it. */
export const WeighInCard = ({
  record,
  isComplete,
  weightText,
  photoUri,
  onChangeWeight,
  onStepDown,
  onStepUp,
  onTakePhoto,
  onChoosePhoto,
}: WeighInCardProps) => {
  const { t } = useTranslation();
  const hasPhoto = decideHasPhoto(record);

  return (
    <Card>
      <View style={styles.body}>
        <WeightStepper
          weight={weightText}
          onChangeWeight={onChangeWeight}
          onStepDown={onStepDown}
          onStepUp={onStepUp}
        />

        <ProgressPhoto uri={photoUri} />

        <View style={styles.controls}>
          <PrimaryButton
            label={hasPhoto ? t('weighIn.retakePhoto') : t('weighIn.takePhoto')}
            accessibilityLabel={hasPhoto ? t('weighIn.retakePhoto') : t('weighIn.takePhoto')}
            onPress={onTakePhoto}
          />
          <SecondaryButton
            label={t('weighIn.choosePhoto')}
            accessibilityLabel={t('weighIn.choosePhoto')}
            onPress={onChoosePhoto}
          />
        </View>

        <CounterCompleteLabel isComplete={isComplete} />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  body: {
    gap: spacing.giant,
  },
  controls: {
    gap: spacing.lg,
  },
});
