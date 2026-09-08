import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme/tokens';
import { spacing } from '@/theme/spacing';

export type HairlineRowProps = {
  children: ReactNode;
  isFirst?: boolean;
};

/**
 * A row inside a card. Rows are separated by a hairline rather than by gaps or borders, and the
 * first row never carries a divider above it.
 */
export const HairlineRow = ({ children, isFirst = false }: HairlineRowProps) => {
  const dividerStyle = isFirst ? null : styles.divider;

  return <View style={[styles.row, dividerStyle]}>{children}</View>;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
  },
});
