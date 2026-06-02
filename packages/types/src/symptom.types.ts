// ─────────────────────────────────────────────────────────────────────────────
// Symptom Types
// Domain: Body Map entries, CTCAE grading, symptom tracking
// ─────────────────────────────────────────────────────────────────────────────

/**
 * CTCAE Grade (NCI Common Terminology Criteria for Adverse Events v5.0)
 * Grade 0: None / resolved
 * Grade 1: Mild — asymptomatic or mild symptoms
 * Grade 2: Moderate — minimal intervention indicated
 * Grade 3: Severe — hospitalization indicated
 * Grade 4: Life-threatening — urgent intervention required
 * Grade 5: Death (not represented in app — triggers emergency protocol)
 */
export type CtcaeGrade = 0 | 1 | 2 | 3 | 4;

/**
 * The 7 primary CTCAE symptoms tracked in the app.
 * Based on the most prevalent adverse events in systemic oncology treatment.
 */
export type CtcaeSymptomId =
  | 'nausea' // Náusea
  | 'fatigue' // Fadiga
  | 'pain' // Dor
  | 'mucositis' // Mucosite
  | 'peripheral_neuropathy' // Neuropatia Periférica
  | 'diarrhea' // Diarreia
  | 'appetite_loss'; // Perda de Apetite

/** Definition of a CTCAE symptom with display metadata */
export interface CtcaeSymptom {
  id: CtcaeSymptomId;
  /** Display label in pt-BR */
  labelPtBr: string;
  /** Emoji identifier for visual recognition */
  emoji: string;
  /** Grade-level descriptions in pt-BR (CEFR A2 language) */
  gradeDescriptions: Record<CtcaeGrade, string>;
}

/** A single symptom registration via the Body Map */
export interface BodyMapEntry {
  id: string; // UUID
  patientId: string;
  /** ISO 8601 timestamp of registration */
  registeredAt: string;
  /** Anatomical region tapped on the SVG body map */
  bodyRegion: BodyRegion;
  /** View (front/back) of the body map */
  bodyView: 'front' | 'back';
  /** Intensity 0–10 (patient-reported subjective scale) */
  intensity: number;
  /** Types of symptoms reported for this region */
  symptomTypes: BodySymptomType[];
  /** Free text description by the patient */
  description?: string;
  /** CTCAE grade auto-suggested by the system (not the patient's input) */
  suggestedCtcaeGrade?: CtcaeGrade;
  /** CTCAE symptom linked (if applicable) */
  linkedCtcaeSymptomId?: CtcaeSymptomId;
}

/** Symptom types available in the Body Map registration modal */
export type BodySymptomType =
  | 'pain'
  | 'numbness'
  | 'swelling'
  | 'redness'
  | 'wound'
  | 'burning'
  | 'itching'
  | 'heaviness'
  | 'other';

/** All anatomical regions in the SVG body map */
export type BodyRegion =
  | 'head'
  | 'neck'
  | 'chest_left'
  | 'chest_right'
  | 'abdomen_upper'
  | 'abdomen_lower'
  | 'pelvis'
  | 'arm_left'
  | 'arm_right'
  | 'leg_left'
  | 'leg_right'
  | 'back_upper'
  | 'back_lower'
  | 'shoulder_left'
  | 'shoulder_right';

/** A single CTCAE symptom check-in (via the 7-symptom CTCAE module) */
export interface CtcaeCheckin {
  id: string;
  patientId: string;
  registeredAt: string;
  symptomId: CtcaeSymptomId;
  grade: CtcaeGrade;
  patientNote?: string;
}

/** Aggregated symptom history for a body region */
export interface BodyRegionHistory {
  region: BodyRegion;
  entries: BodyMapEntry[];
  /** Most recent intensity */
  currentIntensity: number;
  /** Trend vs. previous registration */
  trend: 'improving' | 'stable' | 'worsening' | 'no_data';
}
