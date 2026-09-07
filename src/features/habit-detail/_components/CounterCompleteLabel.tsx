import { StyleSheet, Text } from 'react-native';

import { useTranslation } from '@/i18n';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type CounterCompleteLabelProps = {
  isComplete: boolean;
};

/** Completion is said in words as well as colour, so it survives greyscale and colour blindness. */
export const CounterCompleteLabel = ({ isComplete }: CounterCompleteLabelProps) => {
  const { t } = useTranslation();

  if (!isComplete) {
    return null;
  }

  return <Text style={styles.status}>{t('counter.done')}</Text>;
};

const styles = StyleSheet.create({
  status: {
    ...typography.microLabel,
    color: colors.coral,
  },
});
