import { PrimaryButton } from '@/components/PrimaryButton';
import { useTranslation } from '@/i18n';

export type WorkoutPrimaryControlProps = {
  isRunning: boolean;
  onStart: () => void;
  onFinish: () => void;
};

/** Starts the next workout, or ends the one being timed and records it as a session. */
export const WorkoutPrimaryControl = ({
  isRunning,
  onStart,
  onFinish,
}: WorkoutPrimaryControlProps) => {
  const { t } = useTranslation();

  if (isRunning) {
    return (
      <PrimaryButton
        label={t('timer.finishWorkout')}
        accessibilityLabel={t('timer.finishWorkout')}
        onPress={onFinish}
      />
    );
  }

  return (
    <PrimaryButton
      label={t('timer.startWorkout')}
      accessibilityLabel={t('timer.startWorkout')}
      onPress={onStart}
    />
  );
};
