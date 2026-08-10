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
  /** Patient's full name */
  name: string | null;
  /** Doctor's CRM number */
  crmNumber: string | null;
  /** Birth year */
  birthYear: string | null;
  /** Gender */
  gender: string | null;
  /** Cancer type */
  cancerType: string | null;
  /** Cancer stage */
  stage: string | null;
  /** Diagnosis date (month/year) */
  diagnosisDate: string | null;
  /** Treatment modality (SUS, etc) */
  careModality: string | null;
  /** Patient ZIP code */
  zipCode: string | null;
  /** Phase of journey */
  journeyPhase: string | null;
  /** Treatments selected */
  treatments: string[];
  /** Primary concerns (up to 2) */
  concerns: string[];
  /** Name of the patient the caregiver cares for */
  caregiverName: string | null;
  /** Caregiver's relationship/involvement */
  caregiverRelationship: string | null;
  /** Doctor's specialty */
  doctorSpecialty: string | null;
  /** Doctor's primary interests */
  doctorInterests: string[];
  /** WhatsApp intent flag */
  whatsappIntent: boolean | null;
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
  /** Whether the user consented to smartwatch access. */
  consentWatch: boolean;
  /** Whether the user consented to research data sharing. */
  lgpdResearchConsent: boolean;
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
   * Updates partial state details.
   */
  setDetails: (details: Partial<OnboardingState>) => void;
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
   */
  setConsent: (field: 'notifications' | 'camera' | 'calendar' | 'watch' | 'research', value: boolean) => void;
  /** Resets all onboarding state to initial values. */
  reset: () => void;
}

/** @internal Default values for the onboarding store. */
const initialOnboardingState: Omit<
  OnboardingState,
  'setStep' | 'nextStep' | 'prevStep' | 'setProfileType' | 'setCancerType' |
  'setTreatmentModality' | 'setAniPersonality' | 'setAvatarConfig' | 'setConsent' | 'reset' | 'setPatientDetails'
> = {
  currentStep: 1,
  totalSteps: 7, // Default, will be updated per profile
  profileType: null,
  name: null,
  crmNumber: null,
  birthYear: null,
  gender: null,
  cancerType: null,
  stage: null,
  diagnosisDate: null,
  careModality: null,
  zipCode: null,
  journeyPhase: null,
  treatments: [],
  concerns: [],
  caregiverName: null,
  caregiverRelationship: null,
  doctorSpecialty: null,
  doctorInterests: [],
  whatsappIntent: null,
  caregiverInviteCode: null,
  aniPersonality: null,
  avatarConfig: {},
  consentNotifications: true, // Default active
  consentCamera: false,
  consentCalendar: false,
  consentWatch: false,
  lgpdResearchConsent: false,
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
      setDetails: (details) => set((state) => ({ ...state, ...details })),
      setAvatarConfig: (config) => set({ avatarConfig: { ...get().avatarConfig, ...config } }),
      setConsent: (field, value) => {
        if (field === 'research') {
          set({ lgpdResearchConsent: value });
          return;
        }
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