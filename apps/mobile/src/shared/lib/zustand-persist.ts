/**
 * @fileoverview Persisted Zustand stores for authentication and onboarding state.
 *
 * @module shared/lib/zustand-persist
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  AniPersonality,
  AvatarConfig,
  CancerType,
  TreatmentModality,
  UserProfileType,
} from '@anicca/types';

// ─── Auth Store ───────────────────────────────────────────────────────────────

/**
 * Shape of the persisted authentication store.
 */
export interface AuthState {
  /** `true` when a valid session token exists. */
  isAuthenticated: boolean;
  /** The server-assigned user identifier (pseudonymized). */
  userId: string | null;
  /** The profile type selected during onboarding. */
  profileType: 'patient' | 'caregiver' | 'doctor' | null;
  /** The JWT bearer token for API authorization. */
  token: string | null;
  /**
   * Persists a successful sign-in.
   * @param userId - The server-assigned user identifier.
   * @param profileType - The user's selected profile type.
   * @param token - The JWT bearer token.
   */
  signIn: (userId: string, profileType: AuthState['profileType'], token: string) => void;
  /** Clears all session data from the store and AsyncStorage. */
  signOut: () => void;
}

/**
 * Zustand store for authentication state, persisted to AsyncStorage.
 *
 * @remarks
 * Only data fields are persisted — action functions are excluded via `partialize`.
 *
 * @see {@link https://docs.pmnd.rs/zustand/integrations/persisting-store-data}
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      userId: null,
      profileType: null,
      token: null,
      signIn: (userId, profileType, token) =>
        set({ isAuthenticated: true, userId, profileType, token }),
      signOut: () =>
        set({ isAuthenticated: false, userId: null, profileType: null, token: null }),
    }),
    {
      name: 'anicca-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        userId: state.userId,
        profileType: state.profileType,
        token: state.token,
      }),
    }
  )
);

// ─── Onboarding Store ─────────────────────────────────────────────────────────

/**
 * Shape of the persisted onboarding store.
 */
export interface OnboardingState {
  /** The index of the currently active step (1-based). */
  currentStep: number;
  /** Total number of onboarding steps. */
  totalSteps: number;
  /** Profile type selected in step 2. */
  profileType: UserProfileType | null;
  /** Cancer type selected in step 3. */
  cancerType: CancerType | null;
  /** Treatment modality selected in step 3. */
  treatmentModality: TreatmentModality | null;
  /** Invite code for caregiver profile linking. */
  caregiverInviteCode: string | null;
  /** Ani personality selected in step 4. */
  aniPersonality: AniPersonality | null;
  /** Partial avatar configuration built in step 5. */
  avatarConfig: Partial<AvatarConfig>;
  /** Whether the user consented to push notifications. */
  consentNotifications: boolean;
  /** Whether the user consented to camera access. */
  consentCamera: boolean;
  /** Whether the user consented to calendar access. */
  consentCalendar: boolean;
  /**
   * Navigates directly to a specific step.
   * @param step - The target step index (1-based).
   */
  setStep: (step: number) => void;
  /** Advances to the next step, clamped to {@link OnboardingState.totalSteps}. */
  nextStep: () => void;
  /** Returns to the previous step, clamped to `1`. */
  prevStep: () => void;
  /**
   * Persists the selected profile type.
   * @param type - The selected {@link UserProfileType}.
   */
  setProfileType: (type: UserProfileType) => void;
  /**
   * Persists the selected cancer type.
   * @param type - The selected {@link CancerType}.
   */
  setCancerType: (type: CancerType) => void;
  /**
   * Persists the selected treatment modality.
   * @param modality - The selected {@link TreatmentModality}.
   */
  setTreatmentModality: (modality: TreatmentModality) => void;
  /**
   * Persists the selected Ani personality.
   * @param personality - The selected {@link AniPersonality}.
   */
  setAniPersonality: (personality: AniPersonality) => void;
  /**
   * Merges partial avatar configuration into the current state.
   * @param config - Partial {@link AvatarConfig} fields to merge.
   */
  setAvatarConfig: (config: Partial<AvatarConfig>) => void;
  /**
   * Sets a consent flag by key.
   * @param field - The consent key (`'notifications'`, `'camera'`, or `'calendar'`).
   * @param value - The consent value.
   */
  setConsent: (field: 'notifications' | 'camera' | 'calendar', value: boolean) => void;
  /** Resets all onboarding state to initial values. */
  reset: () => void;
}

/** @internal Default values for the onboarding store. */
const initialOnboardingState: Omit<
  OnboardingState,
  'setStep' | 'nextStep' | 'prevStep' | 'setProfileType' | 'setCancerType' |
  'setTreatmentModality' | 'setAniPersonality' | 'setAvatarConfig' | 'setConsent' | 'reset'
> = {
  currentStep: 1,
  totalSteps: 7,
  profileType: null,
  cancerType: null,
  treatmentModality: null,
  caregiverInviteCode: null,
  aniPersonality: null,
  avatarConfig: {},
  consentNotifications: false,
  consentCamera: false,
  consentCalendar: false,
};

/**
 * Zustand store for 7-step onboarding state, persisted to AsyncStorage.
 *
 * @remarks
 * Resumable across app restarts — the user continues from the last completed step.
 */
export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...initialOnboardingState,
      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set({ currentStep: Math.min(get().currentStep + 1, get().totalSteps) }),
      prevStep: () => set({ currentStep: Math.max(get().currentStep - 1, 1) }),
      setProfileType: (type) => set({ profileType: type }),
      setCancerType: (type) => set({ cancerType: type }),
      setTreatmentModality: (modality) => set({ treatmentModality: modality }),
      setAniPersonality: (personality) => set({ aniPersonality: personality }),
      setAvatarConfig: (config) => set({ avatarConfig: { ...get().avatarConfig, ...config } }),
      setConsent: (field, value) => {
        const key = `consent${field.charAt(0).toUpperCase() + field.slice(1)}` as keyof OnboardingState;
        set({ [key]: value } as Partial<OnboardingState>);
      },
      reset: () => set(initialOnboardingState as Partial<OnboardingState>),
    }),
    {
      name: 'anicca-onboarding',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
