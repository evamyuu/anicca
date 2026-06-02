// ─────────────────────────────────────────────────────────────────────────────
// CTCAE Utilities
// Pure functions — no side effects, no platform dependencies
// ─────────────────────────────────────────────────────────────────────────────

import type { CtcaeGrade, CtcaeSymptomId } from '@anicca/types';

/** CTCAE grade → Tailwind color class (text) */
export const CTCAE_GRADE_TEXT_COLOR: Record<CtcaeGrade, string> = {
  0: 'text-ctcae-0',
  1: 'text-ctcae-1',
  2: 'text-ctcae-2',
  3: 'text-ctcae-3',
  4: 'text-ctcae-4',
};

/** CTCAE grade → Tailwind color class (background) */
export const CTCAE_GRADE_BG_COLOR: Record<CtcaeGrade, string> = {
  0: 'bg-ctcae-0-bg',
  1: 'bg-ctcae-1-bg',
  2: 'bg-ctcae-2-bg',
  3: 'bg-ctcae-3-bg',
  4: 'bg-ctcae-4-bg',
};

/** CTCAE grade → hex color value (for React Native StyleSheet) */
export const CTCAE_GRADE_HEX: Record<CtcaeGrade, string> = {
  0: '#22c55e', // green
  1: '#84cc16', // lime
  2: '#f59e0b', // amber
  3: '#ef4444', // red
  4: '#7c3aed', // violet (life-threatening)
};

/** CTCAE grade → pt-BR label */
export const CTCAE_GRADE_LABEL_PT_BR: Record<CtcaeGrade, string> = {
  0: 'Sem sintoma',
  1: 'Leve',
  2: 'Moderado',
  3: 'Grave',
  4: 'Risco de vida',
};

/** CTCAE symptom → emoji */
export const CTCAE_SYMPTOM_EMOJI: Record<CtcaeSymptomId, string> = {
  nausea: '🤢',
  fatigue: '😴',
  pain: '⚡',
  mucositis: '👄',
  peripheral_neuropathy: '🖐️',
  diarrhea: '🌀',
  appetite_loss: '🍽️',
};

/** CTCAE symptom → pt-BR label */
export const CTCAE_SYMPTOM_LABEL_PT_BR: Record<CtcaeSymptomId, string> = {
  nausea: 'Náusea',
  fatigue: 'Fadiga',
  pain: 'Dor',
  mucositis: 'Mucosite',
  peripheral_neuropathy: 'Neuropatia Periférica',
  diarrhea: 'Diarreia',
  appetite_loss: 'Falta de Apetite',
};

/** Get hex color for a given grade */
export function getCtcaeGradeColor(grade: CtcaeGrade): string {
  return CTCAE_GRADE_HEX[grade];
}

/** Get pt-BR label for a given grade */
export function getCtcaeGradeLabel(grade: CtcaeGrade): string {
  return CTCAE_GRADE_LABEL_PT_BR[grade];
}

/** Get emoji for a given symptom */
export function getCtcaeSymptomEmoji(symptomId: CtcaeSymptomId): string {
  return CTCAE_SYMPTOM_EMOJI[symptomId];
}

/** Get pt-BR label for a given symptom */
export function getCtcaeSymptomLabel(symptomId: CtcaeSymptomId): string {
  return CTCAE_SYMPTOM_LABEL_PT_BR[symptomId];
}

/**
 * Map a body map intensity (0–10) to a suggested CTCAE grade.
 * This is a SUGGESTION only — not a clinical classification.
 */
export function intensityToCtcaeGrade(intensity: number): CtcaeGrade {
  if (intensity === 0) return 0;
  if (intensity <= 3) return 1;
  if (intensity <= 5) return 2;
  if (intensity <= 8) return 3;
  return 4;
}
