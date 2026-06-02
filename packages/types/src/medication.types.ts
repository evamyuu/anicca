// ─────────────────────────────────────────────────────────────────────────────
// Medication Types
// Domain: Medication tracking, periods, dose status
// ─────────────────────────────────────────────────────────────────────────────

/** Time period for medication administration */
export type MedicationPeriod = 'morning' | 'afternoon' | 'evening' | 'night' | 'as_needed';

/** Status of a single dose */
export type DoseStatus = 'pending' | 'taken' | 'skipped' | 'late';

/** A medication in the patient's regimen */
export interface Medication {
  id: string;
  patientId: string;
  name: string;
  /** Dosage string, e.g. "500mg" */
  dosage: string;
  unit: string;
  /** Which periods this medication is scheduled for */
  periods: MedicationPeriod[];
  /** Instructions (e.g. "take with food") */
  instructions?: string;
  /** Whether this is a chemotherapy agent */
  isChemoAgent: boolean;
  /** Start date of this medication (ISO 8601) */
  startDate: string;
  /** End date if known (ISO 8601) */
  endDate?: string;
  /** Linked ANVISA/DrugBank ID for interaction checking */
  anvisaId?: string;
  isActive: boolean;
}

/** A single dose record */
export interface DoseRecord {
  id: string;
  medicationId: string;
  patientId: string;
  period: MedicationPeriod;
  scheduledFor: string; // ISO 8601 datetime
  takenAt?: string; // ISO 8601 — when the patient marked it as taken
  status: DoseStatus;
  skippedReason?: string;
}

/** Daily medication schedule grouped by period */
export interface DailyMedicationSchedule {
  date: string; // ISO 8601 date (YYYY-MM-DD)
  byPeriod: Record<MedicationPeriod, MedicationWithDoseStatus[]>;
  /** Overall adherence for the day (0–100%) */
  adherencePercent: number;
}

export interface MedicationWithDoseStatus extends Medication {
  todayDoseStatus: DoseStatus;
  doseRecordId?: string;
}
