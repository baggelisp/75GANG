import { StyleSheet, Text } from 'react-native';

import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type SectionLabelProps = {
  children: string;
};

export const SectionLabel = ({ children }: SectionLabelProps) => {
  return <Text style={styles.label}>{children}</Text>;
};

const styles = StyleSheet.create({
  label: {
    ...typography.sectionLabel,
    color: colors.text,
  },
});
