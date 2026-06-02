// ─────────────────────────────────────────────────────────────────────────────
// Journey Types
// Domain: Patient journey milestones, Law 60 Days tracking
// ─────────────────────────────────────────────────────────────────────────────

/** Milestones in the oncology journey */
export type MilestoneType =
  | 'symptom_onset' // First symptom noticed
  | 'first_appointment' // First medical appointment
  | 'biopsy' // Biopsy performed
  | 'diagnosis_confirmed' // Pathological diagnosis confirmed (LAW 60 DAYS START)
  | 'staging_completed' // Staging workup completed
  | 'oncologist_first_visit' // First oncologist appointment
  | 'treatment_started' // First treatment session (LAW 60 DAYS END)
  | 'cycle_completed' // A treatment cycle completed
  | 'imaging_done' // Imaging result
  | 'lab_results' // Lab results received
  | 'hospitalization' // Hospitalization event
  | 'surgery' // Surgery performed
  | 'treatment_completed' // Treatment course completed
  | 'remission' // Remission declared
  | 'follow_up'; // Surveillance follow-up

/** A single milestone in the patient's journey */
export interface JourneyMilestone {
  id: string;
  patientId: string;
  type: MilestoneType;
  title: string;
  description?: string;
  date: string; // ISO 8601 date
  /** Whether this milestone was added by the user or extracted from RNDS/documents */
  source: 'user' | 'rnds_import' | 'document_ocr' | 'system';
  /** Reference to a linked document ID */
  linkedDocumentId?: string;
  createdAt: string;
}

/**
 * Lei n.º 12.732/2012 — Lei dos 60 Dias
 * Guarantees treatment must start within 60 days of pathological diagnosis.
 */
export interface Law60DaysStatus {
  /** ISO 8601 date of pathological diagnosis (start of 60-day clock) */
  diagnosisDate: string;
  /** ISO 8601 date treatment was started (stops the clock) */
  treatmentStartDate?: string;
  /** Days elapsed since diagnosis */
  daysElapsed: number;
  /** Days remaining until deadline (negative = overdue) */
  daysRemaining: number;
  /** Deadline date (ISO 8601) */
  deadlineDate: string;
  /**
   * Semaphore status:
   * green: > 15 days remaining
   * amber: 1–15 days remaining
   * red: overdue (daysRemaining < 0)
   * completed: treatment has started
   */
  semaphoreStatus: 'green' | 'amber' | 'red' | 'completed';
  /** Whether the law has been violated */
  isViolated: boolean;
  /** Whether a ticket has been opened for this violation */
  hasOpenTicket: boolean;
}
