/**
 * @fileoverview Auth route group layout with authenticated user redirection.
 *
 * @module app/(auth)/_layout
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import { Redirect, Stack } from 'expo-router';

import { useAuthStore } from '@/shared/lib/zustand-persist';

/**
 * Renders the authentication stack navigator.
 *
 * @remarks
 * Authenticated users are immediately redirected to `/(tabs)/hub` before
 * any auth screen is rendered.
 *
 * @returns A `Redirect` when the user is authenticated, otherwise the auth `Stack`.
 */
export default function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/hub" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
