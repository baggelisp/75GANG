import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '@/theme/tokens';

const SCREEN_OPTIONS = {
  headerShown: false,
  contentStyle: { backgroundColor: colors.bg },
} as const;

const RootLayout = () => {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={SCREEN_OPTIONS} />
    </SafeAreaProvider>
  );
};

export default RootLayout;
