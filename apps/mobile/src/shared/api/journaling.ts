/**
 * @fileoverview Journaling (diário emocional) API client.
 *
 * @module shared/api/journaling
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import { httpClient as api } from './http-client';

export interface JournalEntry {
  id: string;
  patient_id: string;
  /** 1 (muito mal) … 5 (muito bem) */
  mood: number;
  emotions: string[];
  text: string;
  source: 'app' | 'whatsapp';
  created_at: string;
}

export interface JournalInput {
  mood: number;
  emotions: string[];
  text: string;
}

export async function listJournal(patientId: string): Promise<JournalEntry[]> {
  const { data } = await api.get('/api/v1/journaling/history', { params: { patient_id: patientId } });
  return data;
}

export async function createJournalEntry(patientId: string, input: JournalInput): Promise<JournalEntry> {
  const { data } = await api.post('/api/v1/journaling', { patient_id: patientId, ...input });
  return data;
}

export async function updateJournalEntry(id: string, input: JournalInput): Promise<JournalEntry> {
  const { data } = await api.put(`/api/v1/journaling/${id}`, input);
  return data;
}

export async function deleteJournalEntry(id: string): Promise<void> {
  await api.delete(`/api/v1/journaling/${id}`);
}
