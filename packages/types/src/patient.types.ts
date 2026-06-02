// ─────────────────────────────────────────────────────────────────────────────
// Patient Types
// Domain: Patient profile, cancer type, treatment modality, user profile
// ─────────────────────────────────────────────────────────────────────────────

/** Cancer types supported, based on INCA CID-10 mapping */
export type CancerType =
  | 'breast'
  | 'prostate'
  | 'colorectal'
  | 'lung'
  | 'cervical'
  | 'leukemia'
  | 'lymphoma'
  | 'skin_melanoma'
  | 'thyroid'
  | 'stomach'
  | 'liver'
  | 'pancreatic'
  | 'bladder'
  | 'kidney'
  | 'ovarian'
  | 'uterine'
  | 'brain'
  | 'bone'
  | 'other';

/** Treatment modality determines which services/routes are shown */
export type TreatmentModality = 'sus' | 'convenio' | 'particular';

/** Cancer stage classification */
export type CancerStage = 'I' | 'II' | 'III' | 'IV' | 'unknown';

/** Treatment type */
export type TreatmentType =
  | 'chemotherapy'
  | 'radiotherapy'
  | 'immunotherapy'
  | 'surgery'
  | 'hormone_therapy'
  | 'targeted_therapy'
  | 'bone_marrow_transplant'
  | 'watchful_waiting'
  | 'palliative'
  | 'other';

/** Current phase in the oncology journey */
export type JourneyPhase =
  | 'pre_diagnosis'
  | 'diagnosis'
  | 'staging'
  | 'treatment_planning'
  | 'active_treatment'
  | 'post_treatment'
  | 'survivorship'
  | 'palliative';

/** User profile type determines which UI/features are shown */
export type UserProfileType = 'patient' | 'caregiver' | 'doctor';

/** Ani personality styles */
export type AniPersonality = 'mentor' | 'realist' | 'optimist' | 'specialist';

/** Avatar customization options */
export interface AvatarConfig {
  skinTone: 'very_light' | 'light' | 'medium' | 'medium_dark' | 'dark' | 'very_dark';
  headAccessory:
    | 'hair_short'
    | 'hair_long'
    | 'bald'
    | 'turban'
    | 'scarf'
    | 'cap'
    | 'wig'
    | 'none';
  expression: 'happy' | 'determined' | 'calm' | 'brave';
  medicalAccessory: 'port_a_cath' | 'iv_bag' | 'cane' | 'none';
  backgroundColor: string; // HEX
}

/** Full patient entity */
export interface Patient {
  id: string; // UUID — NOT the real CPF/CNS
  /** Hash of CPF with unique salt — NEVER store raw CPF */
  cpfHash?: string;
  name: string;
  dateOfBirth: string; // ISO 8601 date
  cancerType: CancerType;
  cancerTypeLabel?: string; // CID-10 free text when cancerType = 'other'
  cancerStage: CancerStage;
  treatmentModality: TreatmentModality;
  treatmentTypes: TreatmentType[];
  journeyPhase: JourneyPhase;
  diagnosisDate?: string; // ISO 8601 — used for Law 60 Days calculation
  currentCycleNumber?: number;
  totalCycles?: number;
  oncologistName?: string;
  hospitalName?: string;
  avatarConfig: AvatarConfig;
  aniPersonality: AniPersonality;
  createdAt: string;
  updatedAt: string;
}

/** Caregiver entity */
export interface Caregiver {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  relationship: 'spouse' | 'parent' | 'child' | 'sibling' | 'friend' | 'other';
  patientId: string; // linked patient
  avatarConfig: AvatarConfig;
  aniPersonality: AniPersonality;
  createdAt: string;
  updatedAt: string;
}

/** Doctor entity */
export interface Doctor {
  id: string;
  name: string;
  crm: string; // Brazilian CRM registration
  specialty: string;
  institutionName: string;
  cnesCode?: string; // CNES code for RNDS integration
  createdAt: string;
}

/** Auth user session */
export interface UserSession {
  userId: string;
  profileType: UserProfileType;
  patientId?: string; // if patient or caregiver
  doctorId?: string; // if doctor
  token: string;
  refreshToken: string;
  expiresAt: string;
}
