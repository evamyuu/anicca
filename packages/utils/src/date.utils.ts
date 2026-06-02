// ─────────────────────────────────────────────────────────────────────────────
// Date Utilities — pt-BR formatting
// ─────────────────────────────────────────────────────────────────────────────

const PT_BR_MONTHS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

const PT_BR_MONTHS_SHORT = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
];

const PT_BR_WEEKDAYS = [
  'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira',
  'quinta-feira', 'sexta-feira', 'sábado',
];

const PT_BR_WEEKDAYS_SHORT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

/** Format ISO date to Brazilian format: "29/05/2026" */
export function formatDateShort(isoDate: string): string {
  const [year, month, day] = isoDate.split('T')[0]!.split('-');
  return `${day}/${month}/${year}`;
}

/** Format ISO date to long Brazilian format: "29 de maio de 2026" */
export function formatDateLong(isoDate: string): string {
  const date = new Date(isoDate);
  const day = date.getUTCDate();
  const month = PT_BR_MONTHS[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  return `${day} de ${month} de ${year}`;
}

/** Format ISO date to month + year: "maio de 2026" */
export function formatMonthYear(isoDate: string): string {
  const date = new Date(isoDate);
  const month = PT_BR_MONTHS[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  return `${month} de ${year}`;
}

/** Format ISO datetime to time: "14:30" */
export function formatTime(isoDatetime: string): string {
  const date = new Date(isoDatetime);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/** Get weekday name in pt-BR: "segunda-feira" */
export function getWeekdayName(isoDate: string, short = false): string {
  const date = new Date(isoDate + 'T12:00:00'); // Avoid TZ issues
  const index = date.getDay();
  return short ? (PT_BR_WEEKDAYS_SHORT[index] ?? '') : (PT_BR_WEEKDAYS[index] ?? '');
}

/** Get short month name in pt-BR: "mai" */
export function getMonthShort(isoDate: string): string {
  const date = new Date(isoDate);
  return PT_BR_MONTHS_SHORT[date.getUTCMonth()] ?? '';
}

/** Calculate the number of days between two ISO dates */
export function daysBetween(from: string, to: string): number {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((toDate.getTime() - fromDate.getTime()) / msPerDay);
}

/** Returns "Hoje", "Ontem", or the short date */
export function toRelativeDatePtBr(isoDate: string): string {
  const today = new Date();
  const date = new Date(isoDate + 'T12:00:00');
  const days = daysBetween(isoDate.split('T')[0]!, today.toISOString().split('T')[0]!);
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Ontem';
  if (days === -1) return 'Amanhã';
  return formatDateShort(isoDate);
}

/** Check if a date is today */
export function isToday(isoDate: string): boolean {
  const today = new Date().toISOString().split('T')[0]!;
  return isoDate.split('T')[0] === today;
}

/** Get current ISO date string (YYYY-MM-DD) */
export function today(): string {
  return new Date().toISOString().split('T')[0]!;
}
