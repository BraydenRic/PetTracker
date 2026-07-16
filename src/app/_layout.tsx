import {
  Fraunces_600SemiBold,
  Fraunces_700Bold,
  useFonts,
} from '@expo-google-fonts/fraunces';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { AuthProvider, useAuth } from '@/lib/auth-context';
import { DataProvider } from '@/lib/data-context';
import { colors } from '@/theme';

// Show routine reminders as a quiet banner even while the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function LoadingScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <Text style={{ fontSize: 52 }}>🐾</Text>
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}

/** Routes every navigation state to the right place:
 * signed out → auth flow, unverified email → verification gate, otherwise → app. */
function RootNavigator() {
  const { user, initializing, needsVerification } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (initializing) return;
    const inAuthGroup = segments[0] === '(auth)';
    const onVerifyScreen = segments[0] === 'verify-email';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/welcome');
    } else if (user && needsVerification && !onVerifyScreen) {
      router.replace('/verify-email');
    } else if (user && !needsVerification && (inAuthGroup || onVerifyScreen)) {
      router.replace('/(tabs)');
    }
  }, [user, initializing, needsVerification, segments, router]);

  if (initializing) return <LoadingScreen />;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="verify-email" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="new-pet" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Fraunces_600SemiBold, Fraunces_700Bold });
  if (!fontsLoaded) return <LoadingScreen />;

  return (
    <AuthProvider>
      <DataProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </DataProvider>
    </AuthProvider>
  );
}
