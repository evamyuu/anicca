/**
 * @fileoverview Demo personas (paciente, cuidador e médica) and the clinical
 * context shown on the Hub screens during presentations.
 *
 * @remarks
 * Every date is computed relative to "today", so the journey timeline, lab
 * results and next appointment always look current on the day of the demo.
 * Live data (medications, temperature, hydration, body map) comes from the API
 * — or from the offline demo server in `scripts/demo`.
 *
 * @module shared/mocks/demo-data
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import type { ImageSourcePropType } from 'react-native';

const DAY_MS = 86_400_000;

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const WEEKDAYS_LONG = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(base: Date, days: number): Date {
  return new Date(base.getTime() + days * DAY_MS);
}

function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / DAY_MS);
}

/** `01 Mar` */
export function formatDayMonth(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]}`;
}

/** `Qui, 29 Mai` (short) or `Sexta, 23 Mai` (long). */
export function formatWeekday(d: Date, long = false): string {
  const weekday = (long ? WEEKDAYS_LONG : WEEKDAYS_SHORT)[d.getDay()];
  return `${weekday}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** `em 6 dias` / `amanhã` / `hoje` */
export function formatDistance(d: Date): string {
  const diff = daysBetween(startOfToday(), d);
  if (diff === 0) return 'hoje';
  if (diff === 1) return 'amanhã';
  return `em ${diff} dias`;
}

const today = startOfToday();

/** Server-side identifier shared by the app, the demo server and the doctor panel. */
export const DEMO_PATIENT_ID = '7f3c2a10-5b8e-4d21-9c6a-2e4f8b1d0a37';

export interface DemoPatient {
  id: string;
  firstName: string;
  fullName: string;
  age: number;
  city: string;
  careModality: 'SUS' | 'Convênio';
  cancerType: string;
  diagnosis: string;
  stage: string;
  protocol: string;
  protocolDescription: string;
  cycle: { current: number; total: number; day: number; length: number };
  avatar: ImageSourcePropType;
}

export const DEMO_PATIENT: DemoPatient = {
  id: DEMO_PATIENT_ID,
  firstName: 'Rosa',
  fullName: 'Rosa Maria Andrade',
  age: 52,
  city: 'Osasco – SP',
  careModality: 'SUS',
  cancerType: 'Câncer de mama',
  diagnosis: 'Carcinoma ductal invasivo — RH+ / HER2−',
  stage: 'IIB',
  protocol: 'AC-T',
  protocolDescription: 'Doxorrubicina + Ciclofosfamida → Paclitaxel',
  cycle: { current: 2, total: 6, day: 8, length: 21 },
  avatar: require('../../../assets/images/demo/rosa-avatar.png'),
};

export interface DemoCaregiver {
  firstName: string;
  fullName: string;
  relationship: string;
  initials: string;
}

export const DEMO_CAREGIVER: DemoCaregiver = {
  firstName: 'Lucas',
  fullName: 'Lucas Andrade',
  relationship: 'Filho',
  initials: 'LA',
};

export const DEMO_DOCTOR = {
  name: 'Dra. Sandra Motta',
  specialty: 'Oncologia Clínica',
  clinic: 'Ambulatório de Oncologia — Centro Oncológico de Osasco',
};

/* ─── Jornada (Lei dos 60 dias — Lei 12.732/2012) ─── */

const diagnosisDate = addDays(today, -83);
const treatmentStartDate = addDays(diagnosisDate, 42);
const legalDeadlineDate = addDays(diagnosisDate, 60);

export interface JourneyStep {
  id: 'diagnosis' | 'treatment' | 'deadline' | 'today';
  label: string;
  date: string;
  badge?: string;
}

export const DEMO_JOURNEY = {
  onTime: treatmentStartDate <= legalDeadlineDate,
  steps: [
    { id: 'diagnosis', label: 'Diagnóstico', date: formatDayMonth(diagnosisDate) },
    {
      id: 'treatment',
      label: 'Início trat.',
      date: formatDayMonth(treatmentStartDate),
      badge: `Dia ${daysBetween(diagnosisDate, treatmentStartDate)}`,
    },
    { id: 'deadline', label: 'Prazo legal', date: formatDayMonth(legalDeadlineDate), badge: '60 dias' },
    { id: 'today', label: 'Hoje', date: formatDayMonth(today) },
  ] as JourneyStep[],
};

/* ─── Exames ─── */

const hemogramDate = addDays(today, -1);

export const DEMO_LABS = {
  neutrophils: {
    label: 'Neutrófilos',
    value: '1.200',
    unit: '/mm³',
    date: formatDayMonth(hemogramDate),
    range: '1.800–7.500',
    status: 'BAIXO',
    advice: 'Evite aglomerações e use máscara em ambientes fechados.',
  },
  lastExamSummary: `${formatDayMonth(hemogramDate)} • Neutróf. ↓`,
};

/* ─── Consultas e chamados ─── */

const nextAppointmentDate = addDays(today, 6);

export const DEMO_APPOINTMENT = {
  when: `${formatWeekday(nextAppointmentDate)} • ${formatDistance(nextAppointmentDate)}`,
  dateLabel: formatDayMonth(nextAppointmentDate),
  doctor: DEMO_DOCTOR.name,
  specialty: DEMO_DOCTOR.specialty,
};

export const DEMO_TICKETS = { open: 1, resolved: 2 };

/* ─── Rotina (texto do cabeçalho) ─── */

export const DEMO_ROUTINE_SUBTITLE = `${formatWeekday(today, true)} • Ciclo ${DEMO_PATIENT.cycle.current}, Dia ${DEMO_PATIENT.cycle.day}`;

/* ─── Cuidador ─── */

export interface CaregiverTask {
  id: string;
  title: string;
  tag: 'Médico' | 'IA' | 'Rotina';
  when: string;
  done: boolean;
}

export const DEMO_CAREGIVER_TASKS: CaregiverTask[] = [
  {
    id: 'consulta',
    title: `Levar ${DEMO_PATIENT.firstName} à consulta da Dra. Sandra`,
    tag: 'Médico',
    when: DEMO_APPOINTMENT.dateLabel,
    done: false,
  },
  {
    id: 'ondansetrona',
    title: `Confirmar se ${DEMO_PATIENT.firstName} tomou Ondansetrona 08h`,
    tag: 'IA',
    when: 'Hoje',
    done: false,
  },
  {
    id: 'hemograma',
    title: 'Buscar resultado do hemograma (Fleury)',
    tag: 'Rotina',
    when: formatDayMonth(hemogramDate),
    done: true,
  },
];

export interface CaregiverTip {
  id: string;
  icon: 'calendar-month' | 'local-shipping' | 'favorite';
  text: string;
  action?: string;
}

export const DEMO_CAREGIVER_TIPS: CaregiverTip[] = [
  {
    id: 'perguntas',
    icon: 'calendar-month',
    text: `${DEMO_PATIENT.firstName} tem consulta ${formatDistance(nextAppointmentDate)}. Prepare uma lista de perguntas sobre neutrófilos e a dor no tórax.`,
    action: 'Preparar perguntas',
  },
  {
    id: 'tfd',
    icon: 'local-shipping',
    text: `${DEMO_PATIENT.firstName} pode ter direito ao TFD — transporte gratuito para tratamentos em outro município.`,
    action: 'Ver como solicitar',
  },
  {
    id: 'autocuidado',
    icon: 'favorite',
    text: 'Cuidar de alguém esgota. Reserve um momento para você também — isso te torna um cuidador mais forte.',
  },
];
