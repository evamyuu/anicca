/* Shared types and helpers for the doctor panel views (Agenda / Alertas). */

export type AppointmentType = 'consulta' | 'retorno' | 'quimioterapia' | 'exame' | 'teleconsulta';
export type AppointmentStatus = 'agendado' | 'confirmado' | 'realizado' | 'cancelado' | 'falta';

export interface Appointment {
  id: string;
  patient_id: string;
  patient_name: string;
  type: AppointmentType;
  title: string;
  start: string;
  duration_min: number;
  location: string;
  status: AppointmentStatus;
  confirmed_via: string | null;
  notes: string;
}

export type AppointmentInput = Pick<Appointment, 'patient_id' | 'type' | 'title' | 'start' | 'duration_min' | 'location' | 'notes'>;

export type AlertSeverity = 'critica' | 'alta' | 'media' | 'baixa';
export type AlertStatus = 'novo' | 'em_analise' | 'resolvido';

export interface ClinicalAlert {
  id: string;
  patient_id: string;
  patient_name: string;
  severity: AlertSeverity;
  category: 'sintoma' | 'sinal_vital' | 'adesao' | 'emocional' | 'exame' | 'abandono';
  title: string;
  description: string;
  source: string;
  created_at: string;
  status: AlertStatus;
  note: string;
  photo_url?: string;
  clinical_note?: string;
}

export interface PatientOption {
  id: string;
  name: string;
}

export const SEVERITY_CFG: Record<AlertSeverity, { label: string; bar: string; badge: string }> = {
  critica: { label: 'Crítico', bar: 'bg-[#dc2626]', badge: 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]' },
  alta:    { label: 'Alto',    bar: 'bg-[#f97316]', badge: 'bg-[#fff7ed] text-[#c2410c] border-[#fed7aa]' },
  media:   { label: 'Médio',   bar: 'bg-[#facc15]', badge: 'bg-[#fefce8] text-[#a16207] border-[#fde68a]' },
  baixa:   { label: 'Baixo',   bar: 'bg-[#a3988e]', badge: 'bg-[#faf7f4] text-[#8c8078] border-[#e5e0dc]' },
};

export const TYPE_CFG: Record<AppointmentType, { label: string; badge: string }> = {
  consulta:      { label: 'Consulta',      badge: 'bg-[#fde8d9] text-[#c2410c]' },
  retorno:       { label: 'Retorno',       badge: 'bg-[#f3ece5] text-[#5a4a42]' },
  quimioterapia: { label: 'Quimioterapia', badge: 'bg-[#ede9fe] text-[#6d28d9]' },
  exame:         { label: 'Exame',         badge: 'bg-[#e0f2fe] text-[#0369a1]' },
  teleconsulta:  { label: 'Teleconsulta',  badge: 'bg-[#dcfce7] text-[#15803d]' },
};

export const STATUS_CFG: Record<AppointmentStatus, { label: string; badge: string }> = {
  agendado:   { label: 'Agendado',   badge: 'bg-[#faf7f4] text-[#8c8078] border-[#e5e0dc]' },
  confirmado: { label: 'Confirmado', badge: 'bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]' },
  realizado:  { label: 'Realizado',  badge: 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]' },
  cancelado:  { label: 'Cancelado',  badge: 'bg-[#f5f5f4] text-[#78716c] border-[#e7e5e4]' },
  falta:      { label: 'Faltou',     badge: 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]' },
};

export function initials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

export function timeAgo(iso: string) {
  const diffMin = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `há ${diffMin} min`;
  const h = Math.round(diffMin / 60);
  if (h < 24) return `há ${h} h`;
  if (h < 48) return 'ontem';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const hhmm = (iso: string) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
