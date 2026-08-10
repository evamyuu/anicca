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
}

export interface RoutineResponse {
  id: string;
  patient_id: string;
  date: string;
  temperature?: float;
  temperature_alert: boolean;
  hydration_glasses: number;
  sleep_hours?: float;
  sleep_quality?: number;
  medications: MedicationItem[];
  wearable_steps?: number;
  wearable_hrv?: float;
  updated_at: string;
}

/**
 * Fetches the routine for today.
 */
export async function getTodayRoutine(patientId: string): Promise<RoutineResponse> {
  const { data } = await api.get(`/routine/today/${patientId}`);
  return data;
}

/**
 * Updates the temperature for today.
 */
export async function updateTemperature(patientId: string, temperature: number, date?: string): Promise<RoutineResponse> {
  const { data } = await api.post(`/routine/temperature`, { patient_id: patientId, temperature, date });
  return data;
}

/**
 * Updates hydration glasses for today.
 */
export async function updateHydration(patientId: string, glasses: number, date?: string): Promise<RoutineResponse> {
  const { data } = await api.post(`/routine/hydration`, { patient_id: patientId, glasses, date });
  return data;
}

/**
 * Updates sleep data for today.
 */
export async function updateSleep(patientId: string, hours: number, quality: number, date?: string): Promise<RoutineResponse> {
  const { data } = await api.post(`/routine/sleep`, { patient_id: patientId, hours, quality, date });
  return data;
}

/**
 * Updates medications list.
 */
export async function updateMedications(patientId: string, medications: MedicationItem[], date?: string): Promise<RoutineResponse> {
  const { data } = await api.post(`/routine/medications`, { patient_id: patientId, medications, date });
  return data;
}