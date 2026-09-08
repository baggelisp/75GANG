import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors } from '@/theme/tokens';

/** Shown for the instant it takes to read the journal. */
export const JournalLoading = () => {
  return (
    <View style={styles.screen}>
      <ActivityIndicator color={colors.coral} />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
});
