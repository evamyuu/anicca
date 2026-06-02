// ─────────────────────────────────────────────────────────────────────────────
// Law 60 Days Utilities
// Lei n.º 12.732/2012 — Right to treatment within 60 days of diagnosis
// ─────────────────────────────────────────────────────────────────────────────

import type { Law60DaysStatus } from '@anicca/types';

/** Number of days guaranteed by law */
export const LAW_60_DAYS_LIMIT = 60;

/** Threshold (days remaining) for amber warning */
export const LAW_60_DAYS_AMBER_THRESHOLD = 15;

/**
 * Calculate the Law 60 Days status for a patient.
 * @param diagnosisDate ISO 8601 date of pathological diagnosis (start of clock)
 * @param treatmentStartDate ISO 8601 date treatment started (stops clock) — optional
 * @param hasOpenTicket Whether a ticket has been opened for this violation
 */
export function calculateLaw60DaysStatus(
  diagnosisDate: string,
  treatmentStartDate?: string,
  hasOpenTicket = false
): Law60DaysStatus {
  const diagnosis = new Date(diagnosisDate);
  const now = new Date();
  const deadlineDate = new Date(diagnosis);
  deadlineDate.setDate(deadlineDate.getDate() + LAW_60_DAYS_LIMIT);

  const msPerDay = 1000 * 60 * 60 * 24;

  if (treatmentStartDate) {
    const treatmentStart = new Date(treatmentStartDate);
    const daysElapsed = Math.floor(
      (treatmentStart.getTime() - diagnosis.getTime()) / msPerDay
    );
    const daysRemaining = LAW_60_DAYS_LIMIT - daysElapsed;
    const isViolated = daysElapsed > LAW_60_DAYS_LIMIT;

    return {
      diagnosisDate,
      treatmentStartDate,
      daysElapsed,
      daysRemaining,
      deadlineDate: deadlineDate.toISOString().split('T')[0]!,
      semaphoreStatus: 'completed',
      isViolated,
      hasOpenTicket,
    };
  }

  const daysElapsed = Math.floor((now.getTime() - diagnosis.getTime()) / msPerDay);
  const daysRemaining = LAW_60_DAYS_LIMIT - daysElapsed;
  const isViolated = daysRemaining < 0;

  let semaphoreStatus: Law60DaysStatus['semaphoreStatus'];
  if (isViolated) {
    semaphoreStatus = 'red';
  } else if (daysRemaining <= LAW_60_DAYS_AMBER_THRESHOLD) {
    semaphoreStatus = 'amber';
  } else {
    semaphoreStatus = 'green';
  }

  return {
    diagnosisDate,
    treatmentStartDate: undefined,
    daysElapsed,
    daysRemaining,
    deadlineDate: deadlineDate.toISOString().split('T')[0]!,
    semaphoreStatus,
    isViolated,
    hasOpenTicket,
  };
}

/** Get a pt-BR human-readable description of the semaphore status */
export function getLaw60DaysStatusDescription(status: Law60DaysStatus): string {
  if (status.semaphoreStatus === 'completed') {
    if (status.isViolated) {
      return `Tratamento iniciado com ${Math.abs(status.daysRemaining)} dias de atraso.`;
    }
    return 'Tratamento iniciado dentro do prazo legal.';
  }
  if (status.semaphoreStatus === 'red') {
    return `Prazo vencido há ${Math.abs(status.daysRemaining)} dias. Seu direito foi violado.`;
  }
  if (status.semaphoreStatus === 'amber') {
    return `Faltam ${status.daysRemaining} dia(s) para o vencimento do prazo de 60 dias.`;
  }
  return `Faltam ${status.daysRemaining} dias para o vencimento do prazo legal.`;
}

/** Format a date in Brazilian format (dd/mm/aaaa) */
export function formatDatePtBr(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}
