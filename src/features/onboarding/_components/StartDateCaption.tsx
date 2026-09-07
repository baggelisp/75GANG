import { StyleSheet, Text } from 'react-native';

import { useTranslation } from '@/i18n';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type StartDateCaptionProps = {
  isToday: boolean;
};

export const StartDateCaption = ({ isToday }: StartDateCaptionProps) => {
  const { t } = useTranslation();
  const key = isToday ? 'start.today' : 'start.alreadyStartedHint';

  return <Text style={styles.caption}>{t(key)}</Text>;
};

const styles = StyleSheet.create({
  caption: {
    ...typography.microLabel,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
