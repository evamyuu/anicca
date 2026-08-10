/**
 * @fileoverview Body Map API client for fetching and saving symptom entries.
 *
 * @module shared/api/body-map
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import { httpClient as api } from './http-client';

export interface BodyMapEntryCreate {
  patient_id: string;
  body_region: string;
  body_view: string;
  intensity: number;
  symptom_types: string[];
  description?: string;
}

export interface BodyMapEntryResponse {
  id: string;
  patient_id: string;
  body_region: string;
  body_view: string;
  intensity: number;
  symptom_types: string[];
  description?: string;
  suggested_ctcae_grade?: number;
  registered_at: string;
}

/**
 * Record a new symptom pin on the patient's body map.
 */
export async function createBodyMapEntry(data: BodyMapEntryCreate): Promise<BodyMapEntryResponse> {
  const response = await api.post('/body-map', data);
  return response.data;
}

/**
 * Get body map history for a patient.
 */
export async function getBodyMapHistory(patientId: string, limit: number = 50): Promise<BodyMapEntryResponse[]> {
  const { data } = await api.get(`/body-map/${patientId}/history`, {
    params: { limit },
  });
  return data;
}