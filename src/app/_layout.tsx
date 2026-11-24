import { ZenMaruGothic_500Medium } from '@expo-google-fonts/zen-maru-gothic/500Medium';
import { ZenMaruGothic_700Bold } from '@expo-google-fonts/zen-maru-gothic/700Bold';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Platform, Text, useColorScheme, View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AppFont, SearchColors } from '@/constants/theme';
import { FavoritesProvider } from '@/hooks/favorites-context';
import { MemoriesProvider } from '@/hooks/memories-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts([{
    fontFamily: AppFont,
    fontDefinitions: [
      { path: ZenMaruGothic_500Medium, weight: 500, style: 'normal' },
      { path: ZenMaruGothic_700Bold, weight: 700, style: 'normal' },
    ],
  }]);
  const [webFontsReady, setWebFontsReady] = useState(Platform.OS !== 'web');
  const [webFontError, setWebFontError] = useState<Error | null>(null);
  const loadingError = fontError ?? webFontError;

  useEffect(() => {
    if (Platform.OS !== 'web' || !fontsLoaded || fontError) return;
    let active = true;
    const timer = setTimeout(() => {
      if (active) setWebFontError(new Error('Timed out loading app fonts'));
    }, 12000);

    if (!document.fonts?.load) {
      setWebFontError(new Error('Browser font loading API is unavailable'));
    } else {
      Promise.all([
        document.fonts.load(`500 16px "${AppFont}"`, '日本語'),
        document.fonts.load(`700 16px "${AppFont}"`, '日本語'),
      ]).then((faces) => {
        if (faces.some((face) => face.length === 0)) throw new Error('App font faces not found');
        if (active) {
          clearTimeout(timer);
          setWebFontsReady(true);
        }
      }).catch((error: unknown) => {
        if (active) {
          clearTimeout(timer);
          setWebFontError(error instanceof Error ? error : new Error(String(error)));
        }
      });
    }

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (loadingError) {
      console.error('Failed to load app fonts:', loadingError);
      SplashScreen.hideAsync().catch((error: unknown) => console.error('Failed to hide splash screen:', error));
    }
  }, [loadingError]);

  if (loadingError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: SearchColors.background }}>
        <Text accessibilityRole="alert" style={{ color: SearchColors.text }}>
          フォントを読み込めませんでした。アプリを再起動してください。
        </Text>
      </View>
    );
  }

  if (!fontsLoaded || !webFontsReady) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <FavoritesProvider>
        <MemoriesProvider>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: SearchColors.background } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="memories/[songId]" />
          </Stack>
        </MemoriesProvider>
      </FavoritesProvider>
    </ThemeProvider>
  );
}
