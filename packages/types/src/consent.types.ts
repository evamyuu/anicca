// ─────────────────────────────────────────────────────────────────────────────
// Consent Types
// Domain: LGPD consent management, audit trail
// Legal basis: LGPD art. 11, I; art. 8.º §5.º; art. 37
// ─────────────────────────────────────────────────────────────────────────────

/** Types of consent that must be explicitly granted */
export type ConsentType =
  | 'terms_of_service' // Main terms of service
  | 'privacy_policy' // Privacy policy
  | 'data_processing' // General health data processing (LGPD art. 11, I)
  | 'whatsapp_notifications' // WhatsApp message sending
  | 'push_notifications' // Push notification sending
  | 'camera_access' // Camera for document upload
  | 'calendar_access' // Calendar for appointment reminders
  | 'doctor_data_share' // Sharing data with linked doctor
  | 'research_data_share' // Sharing anonymized journey data for research (opt-in)
  | 'rnds_import' // Importing data from Meu SUS Digital / RNDS
  | 'health_connect'; // Google Health Connect wearable sync

/** Status of a consent */
export type ConsentStatus = 'granted' | 'denied' | 'revoked' | 'expired';

/** A single consent record */
export interface ConsentRecord {
  id: string;
  /** Anonymized patient ID (NOT the real CPF) */
  anonymousUserId: string;
  type: ConsentType;
  status: ConsentStatus;
  /** Version of the consent text shown to the user */
  consentTextVersion: string;
  /** Hash of the consent text shown (for audit) */
  consentTextHash: string;
  /** ISO 8601 — when this consent was first granted */
  grantedAt?: string;
  /** ISO 8601 — when this consent was revoked */
  revokedAt?: string;
  /** ISO 8601 — when this consent expires (if applicable) */
  expiresAt?: string;
  /** Channel where consent was given */
  channel: 'app' | 'web' | 'whatsapp';
  /** IP address (hashed for LGPD compliance) */
  ipHash?: string;
  /**
   * Blockchain transaction hash — proof on Hyperledger Fabric / Polygon PoS.
   * Allows cryptographic verification of consent for ANPD audits.
   */
  blockchainTxHash?: string;
}

/** Consent state for the UI */
export interface ConsentState {
  userId: string;
  consents: Record<ConsentType, ConsentRecord | null>;
  /** Whether minimum required consents are granted */
  hasMinimumConsent: boolean;
  lastUpdatedAt: string;
}

/** Consent history entry (for the user to view their history) */
export interface ConsentHistoryEntry {
  type: ConsentType;
  action: 'granted' | 'revoked' | 'denied';
  timestamp: string;
  consentTextVersion: string;
  channel: 'app' | 'web' | 'whatsapp';
}
