import { StyleSheet, Text } from 'react-native';

import { useTranslation } from '@/i18n';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type StartErrorMessageProps = {
  errorKey: string | null;
};

export const StartErrorMessage = ({ errorKey }: StartErrorMessageProps) => {
  const { t } = useTranslation();

  if (errorKey === null) {
    return null;
  }

  return (
    <Text accessibilityRole="alert" style={styles.error}>
      {t(errorKey)}
    </Text>
  );
};

const styles = StyleSheet.create({
  error: {
    ...typography.ruleName,
    color: colors.coral,
  },
});
