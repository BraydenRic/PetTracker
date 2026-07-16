import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { Platform, type ColorValue } from 'react-native';

import { useAuth } from '@/lib/auth-context';
import { colors, shadow } from '@/theme';

const icon =
  (name: keyof typeof Ionicons.glyphMap, activeName: keyof typeof Ionicons.glyphMap) =>
  ({ color, focused }: { color: ColorValue; focused: boolean }) => (
    <Ionicons name={focused ? activeName : name} size={23} color={color} />
  );

export default function TabsLayout() {
  const { user, initializing, needsVerification } = useAuth();

  // Guard synchronously during render: on a cold start the router mounts this
  // group before the root layout's redirect effect runs, which used to flash
  // the empty-den home screen at signed-out users for one frame.
  if (!initializing) {
    if (!user) return <Redirect href="/(auth)/welcome" />;
    if (needsVerification) return <Redirect href="/verify-email" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.faint,
        sceneStyle: { backgroundColor: colors.bg },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.line,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingTop: 6,
          ...shadow.card,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: icon('paw-outline', 'paw') }}
      />
      <Tabs.Screen
        name="routines"
        options={{ title: 'Routines', tabBarIcon: icon('repeat-outline', 'repeat') }}
      />
      <Tabs.Screen
        name="journal"
        options={{ title: 'Journal', tabBarIcon: icon('book-outline', 'book') }}
      />
      <Tabs.Screen
        name="shop"
        options={{ title: 'Shop', tabBarIcon: icon('bag-outline', 'bag') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: icon('person-outline', 'person') }}
      />
    </Tabs>
  );
}
