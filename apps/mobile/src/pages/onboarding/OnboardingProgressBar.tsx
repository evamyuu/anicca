/**
 * @fileoverview Animated progress bar for the onboarding step flow.
 *
 * @module pages/onboarding/OnboardingProgressBar
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import React from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { BRAND } from '@/shared/constants/brand-colors.const';

/** @internal Animation duration in milliseconds for step transitions. */
const PROGRESS_ANIMATION_DURATION_MS = 300;

/**
 * Props for {@link OnboardingProgressBar}.
 */
export interface OnboardingProgressBarProps {
  /**
   * The index of the currently active step (1-based).
   * @remarks Must be in the range [1, {@link OnboardingProgressBarProps.totalSteps}].
   */
  currentStep: number;
  /** Total number of onboarding steps. */
  totalSteps: number;
}

/**
 * Renders an animated horizontal progress bar for the onboarding flow.
 *
 * @remarks
 * Uses `react-native-reanimated` shared values for smooth, native-thread
 * animation. Complies with WCAG 2.1 AA via the `progressbar` accessibility
 * role and a computed `accessibilityValue`.
 *
 * @param props - See {@link OnboardingProgressBarProps}.
 * @returns The animated progress bar component.
 */
export function OnboardingProgressBar({
  currentStep,
  totalSteps,
}: OnboardingProgressBarProps) {
  const progress = useSharedValue(currentStep / totalSteps);

  React.useEffect(() => {
    progress.value = withTiming(currentStep / totalSteps, {
      duration: PROGRESS_ANIMATION_DURATION_MS,
    });
  }, [currentStep, totalSteps, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View
      style={{
        height: 4,
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 4,
        borderRadius: 2,
        backgroundColor: BRAND.PRIMARY[300],
      }}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: totalSteps,
        now: currentStep,
        text: `Step ${currentStep} of ${totalSteps}`,
      }}
    >
      <Animated.View
        style={[
          { height: 4, borderRadius: 2, backgroundColor: BRAND.SECONDARY.DEFAULT },
          animatedStyle,
        ]}
      />
    </View>
  );
}
