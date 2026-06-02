// ─────────────────────────────────────────────────────────────────────────────
// Agent Types (GenUI)
// Domain: Ani AI responses, GenUI cards, multi-agent system outputs
// ─────────────────────────────────────────────────────────────────────────────

/** Types of GenUI cards that Ani can render */
export type GenUiCardType =
  | 'ctcae_grade' // CTCAE symptom grade display
  | 'body_map' // Mini body map preview
  | 'timeline' // Journey timeline (Law 60 Days)
  | 'medication' // Medication list/schedule
  | 'law_60_days' // Law 60 Days semaphore
  | 'wearable_data' // Wearable data summary
  | 'mood_chart' // Mood trend chart
  | 'clinical_trial' // Matching clinical trial
  | 'pubmed_article' // PubMed article summary
  | 'guidelines' // Clinical guideline excerpt
  | 'oncokb' // OncoKB genomic variant
  | 'lab_trend' // Lab values trend
  | 'cta_body_map' // CTA to open body map
  | 'cta_ticket' // CTA to open a ticket
  | 'cta_document_upload' // CTA to upload document
  | 'text'; // Plain text card

/** A single GenUI card returned by Ani */
export interface GenUiCard {
  id: string;
  type: GenUiCardType;
  /** Card-specific payload — typed by card type */
  payload: Record<string, unknown>;
  /** Whether this card requires user action */
  isInteractive: boolean;
  /** Accessibility label for screen readers */
  accessibilityLabel: string;
}

/** Message in the conversation (either user or Ani) */
export interface ConversationMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'ani';
  /** Text content of the message */
  text: string;
  /** GenUI cards attached to this message (Ani only) */
  cards: GenUiCard[];
  /** Which agents were invoked (for transparency — doctor panel only) */
  agentsInvoked?: string[];
  /** Whether Ani is currently generating this message */
  isStreaming: boolean;
  channel: 'app' | 'web' | 'whatsapp';
  createdAt: string;
}

/** Full Ani response from the BFF */
export interface AniResponse {
  messageId: string;
  text: string;
  cards: GenUiCard[];
  agentsInvoked?: string[];
  /** Ani animation to play with this response */
  animation?: 'wave' | 'thinking' | 'celebrate' | 'empathy' | 'sleeping';
  /** Whether this response ends the current conversation flow */
  isFlowComplete: boolean;
}

/** Conversation session */
export interface ConversationSession {
  sessionId: string;
  patientId: string;
  channel: 'app' | 'web' | 'whatsapp';
  messages: ConversationMessage[];
  isActive: boolean;
  startedAt: string;
  lastActivityAt: string;
}

/** Payload for CTCAE GenUI card */
export interface GenUiCtcaeCardPayload {
  symptomId: string;
  symptomLabel: string;
  symptomEmoji: string;
  currentGrade: 0 | 1 | 2 | 3 | 4;
  gradeDescription: string;
  trend?: 'improving' | 'stable' | 'worsening';
}

/** Payload for Law 60 Days GenUI card */
export interface GenUiLaw60DaysCardPayload {
  diagnosisDate: string;
  deadlineDate: string;
  daysElapsed: number;
  daysRemaining: number;
  semaphoreStatus: 'green' | 'amber' | 'red' | 'completed';
  isViolated: boolean;
  cta?: {
    label: string;
    action: 'open_ticket' | 'view_rights';
  };
}

/** Payload for clinical trial GenUI card */
export interface GenUiClinicalTrialCardPayload {
  nctId: string;
  title: string;
  phase: string;
  status: string;
  condition: string;
  location?: string;
  distance?: number; // km from patient
  contactEmail?: string;
  contactPhone?: string;
  clinicalTrialsUrl: string;
}
