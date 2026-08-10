/**
 * @fileoverview Root layout: registers all application-wide providers and
 * the Expo Router stack navigator. Overlays the in-app SplashPage while fonts load.
 *
 * @module app/_layout
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import '../global.css';
import React, { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

LogBox.ignoreLogs([
  '"shadow*" style props are deprecated',
  'Animated: `useNativeDriver` is not supported'
]);

import { FontProvider, useFontLoading } from '@/shared/providers/FontProvider';
import { QueryProvider } from '@/shared/providers/QueryProvider';
import { ThemeProvider } from '@/shared/providers/ThemeProvider';
import { AuthProvider } from '@/shared/providers/AuthProvider';
import { SplashPage } from '@/pages/splash/SplashPage';
import { useProtectedRoute } from '@/shared/hooks/useProtectedRoute';
import { useHubSync } from '@/shared/hooks/useHubSync';
import { useAuthStore } from '@/shared/lib/zustand-persist';

SplashScreen.preventAutoHideAsync();

/**
 * Inner content rendered inside all providers.
 *
 * @remarks
 * Separated from {@link RootLayout} so it can consume `useFontLoading`,
 * which requires being inside `FontProvider`.
 *
 * @returns Either the in-app splash or the full navigator stack.
 */
function AppContent() {
  const isLoading = useFontLoading();
  const userId = useAuthStore((s) => s.userId);
  const [minSplashTimePassed, setMinSplashTimePassed] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setMinSplashTimePassed(true);
    }, 2500); // Enforce a 2.5s minimum splash duration
    return () => clearTimeout(timer);
  }, []);
  
  useProtectedRoute();

  useHubSync({ userId });

  if (isLoading || !minSplashTimePassed) {
    return <SplashPage />;
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="body-map/index" options={{ presentation: 'modal' }} />
        <Stack.Screen name="symptom/ctcae" options={{ presentation: 'modal' }} />
        <Stack.Screen name="journaling/index" options={{ presentation: 'modal' }} />
        <Stack.Screen name="tickets/index" />
        <Stack.Screen name="tickets/new" options={{ presentation: 'modal' }} />
        <Stack.Screen name="settings/index" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}

/**
 * Mounts the provider tree and the top-level Expo Router stack.
 *
 * @remarks
 * Provider order (outer → inner): `FontProvider` → `ThemeProvider` →
 * `QueryProvider` → `AuthProvider`. The font provider is outermost because
 * all descendants depend on Nunito being resolved before rendering.
 *
 * @returns The application root element.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <FontProvider onFontsLoaded={() => setTimeout(() => SplashScreen.hideAsync(), 2000)}>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </FontProvider>
    </SafeAreaProvider>
  );
}