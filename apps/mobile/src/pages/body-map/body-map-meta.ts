/**
 * @fileoverview Shared Body Map vocabulary: pain scale, symptom types, region labels
 * and record sources — used by the map and the details screen.
 *
 * @module pages/body-map/body-map-meta
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import { BRAND } from '@/shared/constants/brand-colors.const';

import type { BodyRegionId } from './BodyFigure';

export type BodySide = 'front' | 'back';
export type SymptomType = 'dor' | 'dormencia' | 'inchaco' | 'vermelhidao' | 'ferida' | 'formigamento' | 'outro';

export const SYMPTOM_TYPES: { id: SymptomType; label: string }[] = [
  { id: 'dor',          label: 'Dor' },
  { id: 'dormencia',    label: 'Dormência' },
  { id: 'inchaco',      label: 'Inchaço' },
  { id: 'vermelhidao',  label: 'Vermelhidão' },
  { id: 'ferida',       label: 'Ferida' },
  { id: 'formigamento', label: 'Formigamento' },
  { id: 'outro',        label: 'Outro' },
];

export const LEGEND = [
  { color: BRAND.PAIN.NONE, label: 'Sem dor' },
  { color: BRAND.PAIN.G1,   label: 'Grau 1' },
  { color: BRAND.PAIN.G2,   label: 'Grau 2' },
  { color: BRAND.PAIN.G3,   label: 'Grau 3' },
  { color: BRAND.PAIN.G4,   label: 'Grau 4' },
  { color: BRAND.PAIN.G5,   label: 'Grau 4+' },
];

export function intensityColor(v: number): string {
  return LEGEND[Math.max(0, Math.min(5, Math.round(v)))]?.color ?? BRAND.PAIN.NONE;
}

export function gradeLabel(v: number): string {
  return LEGEND[Math.max(0, Math.min(5, Math.round(v)))]?.label ?? `Grau ${v}`;
}

/* Region ids follow the artwork: "_dir" is the figure's right side as seen from the front. */
const FRONT_LABELS: Record<BodyRegionId, string> = {
  cabeca:          'Cabeça',
  trapezio:        'Pescoço / Trapézio',
  ombro_dir:       'Ombro direito',
  ombro_esq:       'Ombro esquerdo',
  peito_dir:       'Peito (lado direito)',
  peito_esq:       'Peito (lado esquerdo)',
  biceps_dir:      'Braço direito',
  biceps_esq:      'Braço esquerdo',
  antebraco_dir:   'Antebraço direito',
  antebraco_esq:   'Antebraço esquerdo',
  mao_dir:         'Mão direita',
  mao_esq:         'Mão esquerda',
  abdomen:         'Abdômen',
  obliquo_dir:     'Lateral do abdômen (direita)',
  obliquo_esq:     'Lateral do abdômen (esquerda)',
  coxa_dir:        'Coxa direita',
  coxa_esq:        'Coxa esquerda',
  panturrilha_dir: 'Perna direita',
  panturrilha_esq: 'Perna esquerda',
};

const BACK_LABELS: Record<BodyRegionId, string> = {
  cabeca:          'Nuca',
  trapezio:        'Cervical / Trapézio',
  ombro_dir:       'Ombro esquerdo (costas)',
  ombro_esq:       'Ombro direito (costas)',
  peito_dir:       'Costas superiores (esquerda)',
  peito_esq:       'Costas superiores (direita)',
  biceps_dir:      'Tríceps esquerdo',
  biceps_esq:      'Tríceps direito',
  antebraco_dir:   'Antebraço esquerdo (costas)',
  antebraco_esq:   'Antebraço direito (costas)',
  mao_dir:         'Dorso da mão esquerda',
  mao_esq:         'Dorso da mão direita',
  abdomen:         'Lombar',
  obliquo_dir:     'Flanco esquerdo',
  obliquo_esq:     'Flanco direito',
  coxa_dir:        'Posterior da coxa esquerda',
  coxa_esq:        'Posterior da coxa direita',
  panturrilha_dir: 'Panturrilha esquerda',
  panturrilha_esq: 'Panturrilha direita',
};

export function regionLabel(zoneId: string, side: BodySide): string {
  const labels = side === 'back' ? BACK_LABELS : FRONT_LABELS;
  return labels[zoneId as BodyRegionId] ?? zoneId;
}

export const SOURCE_LABEL: Record<string, string> = {
  whatsapp: 'via WhatsApp',
  app: 'via App',
  caregiver: 'pelo cuidador',
};
