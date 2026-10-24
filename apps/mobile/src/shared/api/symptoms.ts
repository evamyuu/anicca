/**
 * @fileoverview CTCAE symptom grading API client (NCI CTCAE v5.0).
 *
 * @module shared/api/symptoms
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import { httpClient as api } from './http-client';

export interface SymptomRecord {
  id: string;
  patient_id: string;
  symptom_id: string;
  symptom_label: string;
  /** CTCAE grade 0–4 */
  grade: number;
  notes: string;
  registered_at: string;
}

export interface SymptomInput {
  symptom_id: string;
  symptom_label: string;
  grade: number;
  notes?: string;
}

export async function listSymptoms(patientId: string): Promise<SymptomRecord[]> {
  const { data } = await api.get(`/api/v1/symptoms/${patientId}/history`);
  return data;
}

export async function createSymptoms(patientId: string, items: SymptomInput[]): Promise<SymptomRecord[]> {
  const { data } = await api.post('/api/v1/symptoms', { patient_id: patientId, items });
  return data;
}

export async function deleteSymptom(id: string): Promise<void> {
  await api.delete(`/api/v1/symptoms/${id}`);
}
