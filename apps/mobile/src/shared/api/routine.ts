/**
 * @fileoverview Routine API client for fetching and updating patient's daily routine.
 *
 * @module shared/api/routine
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import { httpClient as api } from './http-client';

export interface MedicationItem {
  name: string;
  period: string;
  taken: boolean;
  dose?: string;
  type?: string;
  /** How to take it, e.g. "Com o café da manhã". */
  instructions?: string;
  /** SOS medication ("se náusea") — not counted in the daily total on the Hub. */
  as_needed?: boolean;
}

export interface RoutineResponse {
  id: string;
  patient_id: string;
  date: string;
  temperature?: number;
  temperature_alert: boolean;
  hydration_glasses: number;
  sleep_hours?: number;
  sleep_quality?: number;
  medications: MedicationItem[];
  wearable_steps?: number;
  wearable_hrv?: number;
  updated_at: string;
}

/**
 * Fetches the routine for today.
 */
export async function getTodayRoutine(patientId: string): Promise<RoutineResponse> {
  const { data } = await api.get(`/api/v1/routine/today/${patientId}`);
  return data;
}

/**
 * Updates the temperature for today.
 */
export async function updateTemperature(patientId: string, temperature: number, date?: string): Promise<RoutineResponse> {
  const { data } = await api.post(`/api/v1/routine/temperature`, { patient_id: patientId, temperature, date });
  return data;
}

/**
 * Updates hydration glasses for today.
 */
export async function updateHydration(patientId: string, glasses: number, date?: string): Promise<RoutineResponse> {
  const { data } = await api.post(`/api/v1/routine/hydration`, { patient_id: patientId, glasses, date });
  return data;
}

/**
 * Updates sleep data for today.
 */
export async function updateSleep(patientId: string, hours: number, quality: number, date?: string): Promise<RoutineResponse> {
  const { data } = await api.post(`/api/v1/routine/sleep`, { patient_id: patientId, hours, quality, date });
  return data;
}

/**
 * Syncs smartwatch data (Health Connect / HealthKit) for today.
 */
export async function syncWearables(patientId: string, steps: number, hrv: number): Promise<RoutineResponse> {
  const { data } = await api.post(`/api/v1/routine/wearables`, { patient_id: patientId, steps, hrv });
  return data;
}

/**
 * Updates medications list.
 */
export async function updateMedications(patientId: string, medications: MedicationItem[], date?: string): Promise<RoutineResponse> {
  const { data } = await api.post(`/api/v1/routine/medications`, { patient_id: patientId, medications, date });
  return data;
}