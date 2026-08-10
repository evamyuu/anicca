/**
 * @fileoverview Route protection guard observing Zustand Auth State.
 * Navigates users away from protected areas if unauthorized.
 *
 * @module shared/hooks/useProtectedRoute
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../lib/zustand-persist';

export function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const profileType = useAuthStore((s) => s.profileType);

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';
    const inProtectedGroup = segments[0] === '(tabs)';

    if (segments.length === 0) return;

    if (!isAuthenticated) {
      if (inProtectedGroup) {
        router.replace('/(auth)/login');
      }
    } else {
      if (!profileType) {
        if (!inOnboardingGroup) {
          router.replace('/(onboarding)');
        }
      } else {
        if (inAuthGroup || inOnboardingGroup) {
          router.replace('/(tabs)');
        }
      }
    }
  }, [isAuthenticated, profileType, segments]);
}