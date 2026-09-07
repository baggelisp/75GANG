import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { createRepositories, RepositoryProvider } from '@/storage/bootstrap';
import { holdSplashScreen, shouldHoldRenderOnThisPlatform, useAppFonts } from '@/theme/fonts';
import { colors } from '@/theme/tokens';

const SCREEN_OPTIONS = {
  headerShown: false,
  contentStyle: { backgroundColor: colors.bg },
} as const;

holdSplashScreen();

const RootLayout = () => {
  const areFontsReady = useAppFonts();
  const repositories = useMemo(() => createRepositories(), []);

  if (shouldHoldRenderOnThisPlatform(areFontsReady)) {
    return null;
  }

  return (
    <RepositoryProvider repositories={repositories}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack screenOptions={SCREEN_OPTIONS} />
      </SafeAreaProvider>
    </RepositoryProvider>
  );
};

export default RootLayout;
