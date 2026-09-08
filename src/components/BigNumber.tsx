import { StyleSheet, Text } from 'react-native';

import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type BigNumberProps = {
  value: string;
  isOnAccent?: boolean;
};

/**
 * The hero figure on a card or tile. Tabular figures come from the type role, so a ticking timer
 * never shifts the layout.
 */
export const BigNumber = ({ value, isOnAccent = false }: BigNumberProps) => {
  const colorStyle = isOnAccent ? styles.onAccent : styles.onSurface;

  return <Text style={[styles.value, colorStyle]}>{value}</Text>;
};

const styles = StyleSheet.create({
  value: {
    ...typography.hero,
  },
  onSurface: {
    color: colors.text,
  },
  onAccent: {
    color: colors.ink,
  },
});
