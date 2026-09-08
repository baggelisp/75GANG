import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme/tokens';

const APP_NAME = '75 G-ANG';
const TAGLINE = '75 Days. 11 Rules. A Better You.';

/**
 * Temporary boot target for feature 01, replaced by the Today screen in feature 07.
 *
 * Its spacing and type sizes are raw numbers on purpose: `spacing.ts` and `typography.ts` arrive
 * in feature 02, and this screen is deleted before they matter.
 */
export const PlaceholderScreen = () => {
  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>{APP_NAME}</Text>
      <Text style={styles.tagline}>{TAGLINE}</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    gap: 12,
    padding: 24,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
});
