import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { holdSplashScreen, shouldHoldRenderOnThisPlatform, useAppFonts } from '@/theme/fonts';
import { colors } from '@/theme/tokens';

const SCREEN_OPTIONS = {
  headerShown: false,
  contentStyle: { backgroundColor: colors.bg },
} as const;

holdSplashScreen();

const RootLayout = () => {
  const areFontsReady = useAppFonts();

  if (shouldHoldRenderOnThisPlatform(areFontsReady)) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={SCREEN_OPTIONS} />
    </SafeAreaProvider>
  );
};

export default RootLayout;
