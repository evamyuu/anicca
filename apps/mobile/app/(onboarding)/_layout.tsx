/**
 * @fileoverview Onboarding group layout — shows the progress bar for steps 2–7
 * and manages the stack navigator for the guided onboarding flow.
 *
 * @module app/(onboarding)/_layout
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import { Stack, useSegments } from 'expo-router';
import { View } from 'react-native';

import { OnboardingProgressBar } from '@/pages/onboarding/OnboardingProgressBar';
import { useOnboardingViewModel } from '@/pages/onboarding/useOnboardingViewModel';
import { BRAND } from '@/shared/constants/brand-colors.const';

/**
 * Layout for the `(onboarding)` route group.
 *
 * @remarks
 * The progress bar is hidden on `step-1-welcome` (the welcome carousel) because
 * that screen has its own full-screen design. It appears from step 2 onwards.
 *
 * @returns The onboarding stack navigator with optional progress bar.
 */
export default function OnboardingLayout() {
  const { currentStep, totalSteps } = useOnboardingViewModel();
  const segments = useSegments();

  const isWelcome = segments[segments.length - 1] === 'step-1-welcome';

  return (
    <View style={{ flex: 1, backgroundColor: BRAND.BG.LIGHT }}>
      {!isWelcome && (
        <OnboardingProgressBar
          currentStep={currentStep}
          totalSteps={totalSteps}
        />
      )}
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="step-1-welcome" />
        <Stack.Screen name="step-2-profile" />
        <Stack.Screen name="step-3-info" />
        <Stack.Screen name="step-4-ani-personality" />
        <Stack.Screen name="step-5-avatar" />
        <Stack.Screen name="step-6-permissions" />
        <Stack.Screen name="step-7-hub" />
      </Stack>
    </View>
  );
}
