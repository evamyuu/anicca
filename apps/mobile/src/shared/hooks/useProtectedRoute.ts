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
    // Determine which group the user is currently trying to access
    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';
    const inProtectedGroup = segments[0] === '(tabs)';

    // Wait until navigation is mounted (segments exist)
    if (segments.length === 0) return;

    if (!isAuthenticated) {
      // If not logged in and trying to access tabs or onboarding, kick to login
      if (inProtectedGroup || inOnboardingGroup) {
        router.replace('/(auth)/login');
      }
    } else {
      // If logged in
      if (!profileType) {
        // Logged in but no profile type selected -> must complete onboarding
        if (!inOnboardingGroup) {
          router.replace('/(onboarding)');
        }
      } else {
        // Logged in and onboarding finished -> direct to protected Hub, block from login/onboarding
        if (inAuthGroup || inOnboardingGroup) {
          router.replace('/(tabs)/');
        }
      }
    }
  }, [isAuthenticated, profileType, segments]);
}
