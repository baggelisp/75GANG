import { StyleSheet, Text } from 'react-native';

import { useTranslation } from '@/i18n';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type WorkoutOutdoorTagProps = {
  isOutdoor: boolean;
};

/** Lavender, the accent this design system gives workouts. */
export const WorkoutOutdoorTag = ({ isOutdoor }: WorkoutOutdoorTagProps) => {
  const { t } = useTranslation();

  if (!isOutdoor) {
    return null;
  }

  return <Text style={styles.tag}>{t('timer.outdoor')}</Text>;
};

const styles = StyleSheet.create({
  tag: {
    ...typography.microLabel,
    color: colors.lavender,
  },
});
