/**
 * @fileoverview ViewModel hook for the 7-step onboarding flow.
 *
 * @module pages/onboarding/useOnboardingViewModel
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import { useOnboardingStore } from '@/shared/lib/zustand-persist';

/**
 * Exposes onboarding navigation state and derived progress metrics.
 *
 * @remarks
 * This hook is the single source of truth for the onboarding layout and
 * the {@link OnboardingProgressBar} component. It delegates all state
 * mutations to the {@link useOnboardingStore} Zustand store.
 *
 * @returns An object containing the current step, total steps, navigation
 * actions, and a `progress` ratio (0–1) for the progress bar.
 *
 * @example
 * ```ts
 * const { currentStep, totalSteps, nextStep } = useOnboardingViewModel();
 * ```
 */
export function useOnboardingViewModel() {
  const currentStep = useOnboardingStore((s) => s.currentStep);
  const totalSteps = useOnboardingStore((s) => s.totalSteps);
  const nextStep = useOnboardingStore((s) => s.nextStep);
  const prevStep = useOnboardingStore((s) => s.prevStep);

  return {
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    /** Completion ratio in the range [0, 1] for use with progress indicators. */
    progress: currentStep / totalSteps,
  };
}
