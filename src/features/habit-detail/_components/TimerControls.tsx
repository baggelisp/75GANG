import { StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { SecondaryButton } from '@/components/SecondaryButton';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';

export type TimerControlsProps = {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
};

export const TimerControls = ({ isRunning, onStart, onPause }: TimerControlsProps) => {
  const { t } = useTranslation();

  if (isRunning) {
    return (
      <View style={styles.controls}>
        <SecondaryButton
          label={t('timer.pause')}
          accessibilityLabel={t('timer.pause')}
          onPress={onPause}
        />
      </View>
    );
  }

  return (
    <View style={styles.controls}>
      <PrimaryButton
        label={t('timer.start')}
        accessibilityLabel={t('timer.start')}
        onPress={onStart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  controls: {
    gap: spacing.lg,
    marginTop: spacing.giant,
  },
});
