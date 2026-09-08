import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { colors } from '@/theme/tokens';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const APP_NAME = '75 G-ANG';
const TAGLINE = '75 Days. 11 Rules. A Better You.';

/**
 * Temporary boot target, replaced by the Today screen in feature 07. It exists so the theme layer
 * has somewhere real to render while features 03 and 04 build the domain underneath it.
 */
export const PlaceholderScreen = () => {
  return (
    <Screen>
      <View style={styles.centre}>
        <Text style={styles.title}>{APP_NAME}</Text>
        <Text style={styles.tagline}>{TAGLINE}</Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  centre: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  title: {
    ...typography.greeting,
    color: colors.text,
  },
  tagline: {
    ...typography.ruleMeta,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
