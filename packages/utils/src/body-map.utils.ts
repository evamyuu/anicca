// ─────────────────────────────────────────────────────────────────────────────
// Body Map Utilities
// Region labels, intensity mapping, display helpers
// ─────────────────────────────────────────────────────────────────────────────

import type { BodyRegion, BodySymptomType } from '@anicca/types';

/** Body region → pt-BR label */
export const BODY_REGION_LABEL_PT_BR: Record<BodyRegion, string> = {
  head: 'Cabeça',
  neck: 'Pescoço',
  chest_left: 'Tórax Esquerdo',
  chest_right: 'Tórax Direito',
  abdomen_upper: 'Abdômen Superior',
  abdomen_lower: 'Abdômen Inferior',
  pelvis: 'Pelve',
  arm_left: 'Braço Esquerdo',
  arm_right: 'Braço Direito',
  leg_left: 'Perna Esquerda',
  leg_right: 'Perna Direita',
  back_upper: 'Costas Superiores',
  back_lower: 'Costas Inferiores',
  shoulder_left: 'Ombro Esquerdo',
  shoulder_right: 'Ombro Direito',
};

/** Body symptom type → pt-BR label */
export const BODY_SYMPTOM_LABEL_PT_BR: Record<BodySymptomType, string> = {
  pain: 'Dor',
  numbness: 'Dormência',
  swelling: 'Inchaço',
  redness: 'Vermelhidão',
  wound: 'Ferida',
  burning: 'Queimação',
  itching: 'Coceira',
  heaviness: 'Peso',
  other: 'Outro',
};

/** Body symptom type → emoji */
export const BODY_SYMPTOM_EMOJI: Record<BodySymptomType, string> = {
  pain: '⚡',
  numbness: '😶',
  swelling: '💧',
  redness: '🔴',
  wound: '🩹',
  burning: '🔥',
  itching: '😣',
  heaviness: '🏋️',
  other: '❓',
};

/** Get pt-BR label for a body region */
export function getBodyRegionLabel(region: BodyRegion): string {
  return BODY_REGION_LABEL_PT_BR[region];
}

/** Get pt-BR label for a symptom type */
export function getBodySymptomLabel(type: BodySymptomType): string {
  return BODY_SYMPTOM_LABEL_PT_BR[type];
}

/**
 * Get intensity color (hex) based on 0–10 scale.
 * Used for body map region heat mapping.
 */
export function getIntensityColor(intensity: number): string {
  if (intensity === 0) return '#e5e7eb'; // gray-200
  if (intensity <= 2) return '#bbf7d0'; // green-200
  if (intensity <= 4) return '#fef08a'; // yellow-200
  if (intensity <= 6) return '#fed7aa'; // orange-200
  if (intensity <= 8) return '#fca5a5'; // red-300
  return '#f87171'; // red-400
}

/** Determine which body regions are in the front view */
export const FRONT_VIEW_REGIONS: BodyRegion[] = [
  'head', 'neck', 'chest_left', 'chest_right',
  'abdomen_upper', 'abdomen_lower', 'pelvis',
  'arm_left', 'arm_right', 'leg_left', 'leg_right',
];

/** Determine which body regions are in the back view */
export const BACK_VIEW_REGIONS: BodyRegion[] = [
  'head', 'neck', 'back_upper', 'back_lower',
  'shoulder_left', 'shoulder_right',
  'arm_left', 'arm_right', 'leg_left', 'leg_right',
];

/** Check if a region belongs to the front view */
export function isFrontViewRegion(region: BodyRegion): boolean {
  return FRONT_VIEW_REGIONS.includes(region);
}
