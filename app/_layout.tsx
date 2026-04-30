import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { BackHandler, Platform } from 'react-native';
import 'react-native-reanimated';

import { AppStateProvider, useAppStateContext } from '@/src/context/AppStateContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <AppStateProvider>
      <RootNavigator />
    </AppStateProvider>
  );
}

function RootNavigator() {
  const { state } = useAppStateContext();
  const pathname = usePathname();
  const router = useRouter();
  const colorScheme = state.themeMode;

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (router.canGoBack()) {
        router.back();
        return true;
      }

      if (pathname !== '/' && pathname !== '/(tabs)') {
        router.replace('/(tabs)');
        return true;
      }

      return false;
    });

    return () => {
      sub.remove();
    };
  }, [pathname, router]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="listings/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="bookings/new" options={{ headerShown: false }} />
        <Stack.Screen name="owner/listings" options={{ headerShown: false }} />
        <Stack.Screen name="owner/listing/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="owner/inquiries" options={{ headerShown: false }} />
        <Stack.Screen name="owner/request" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
