import { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme/tokens';
import { spacing } from '@/theme/spacing';

export type ScreenProps = {
  children: ReactNode;
};

/** The bottom edge belongs to the tab bar, which arrives in feature 07. */
const SAFE_AREA_EDGES = ['top', 'left', 'right'] as const;

export const Screen = ({ children }: ScreenProps) => {
  return (
    <SafeAreaView edges={SAFE_AREA_EDGES} style={styles.screen}>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.giant,
  },
});
