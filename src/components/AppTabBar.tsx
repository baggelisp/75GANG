import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';

export type AppTabBarProps = {
  children?: ReactNode;
};

/**
 * The bar the tab buttons sit in: a hairline above, no shadow, and the home indicator's inset
 * respected. Depth comes from the surface colour alone, as the design system requires.
 */
export const AppTabBar = ({ children }: AppTabBarProps) => {
  const insets = useSafeAreaInsets();
  const insetStyle = { paddingBottom: insets.bottom + spacing.lg };

  return <View style={[styles.bar, insetStyle]}>{children}</View>;
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
  },
});
