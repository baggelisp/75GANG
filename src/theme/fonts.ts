import {
  Archivo_600SemiBold,
  Archivo_700Bold,
  Archivo_800ExtraBold,
} from '@expo-google-fonts/archivo';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform } from 'react-native';

const APP_FONTS = {
  Archivo_600SemiBold,
  Archivo_700Bold,
  Archivo_800ExtraBold,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
};

/**
 * Whether the app should paint nothing while the fonts load.
 *
 * On native the splash screen is still up, so holding costs the user nothing and avoids a reflow
 * from the fallback face. On web there is no splash to hold — holding there would export an empty
 * page under Expo's static rendering — so the tree paints immediately and the browser swaps the
 * real faces in.
 */
export const decideShouldHoldRender = (areFontsReady: boolean, platform: string): boolean => {
  if (platform === 'web') {
    return false;
  }

  return !areFontsReady;
};

export const holdSplashScreen = (): void => {
  SplashScreen.preventAutoHideAsync().catch(() => {
    // Already hidden on a fast reload. Nothing to recover from.
  });
};

/** Loads both families and releases the splash screen once they are ready. */
export const useAppFonts = (): boolean => {
  const [fontsLoaded, fontError] = useFonts(APP_FONTS);
  const isReady = fontsLoaded || fontError !== null;

  useEffect(() => {
    if (!isReady) {
      return;
    }

    SplashScreen.hideAsync().catch(() => {
      // Hiding twice is harmless; swallow rather than crash the first paint.
    });
  }, [isReady]);

  return isReady;
};

export const shouldHoldRenderOnThisPlatform = (areFontsReady: boolean): boolean =>
  decideShouldHoldRender(areFontsReady, Platform.OS);
