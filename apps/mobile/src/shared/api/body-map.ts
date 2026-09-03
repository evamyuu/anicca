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

export interface BodyMapEntryUpdate {
  intensity?: number;
  symptom_types?: string[];
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
  const response = await api.post('/api/v1/body-map', data);
  return response.data;
}

export async function updateBodyMapEntry(id: string, data: BodyMapEntryUpdate): Promise<BodyMapEntryResponse> {
  const response = await api.put(`/api/v1/body-map/${id}`, data);
  return response.data;
}

export async function deleteBodyMapEntry(id: string): Promise<void> {
  await api.delete(`/api/v1/body-map/${id}`);
}

/**
 * Get body map history for a patient.
 */
export async function getBodyMapHistory(patientId: string, limit: number = 50): Promise<BodyMapEntryResponse[]> {
  const { data } = await api.get(`/api/v1/body-map/${patientId}/history`, {
    params: { limit },
  });
  return data;
}
/**
 * Upload a photo for a body map entry.
 */
export async function uploadBodyMapPhoto(entryId: string, imageUri: string): Promise<any> {
  const formData = new FormData();
  const filename = imageUri.split('/').pop() || 'photo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  if (typeof window !== 'undefined' && (imageUri.startsWith('blob:') || imageUri.startsWith('data:'))) {
    const res = await fetch(imageUri);
    const blob = await res.blob();
    const file = new File([blob], filename, { type: blob.type || type });
    formData.append('file', file);
  } else {
    formData.append('file', { uri: imageUri, name: filename, type } as any);
  }

  const response = await api.post(`/api/v1/body-map/${entryId}/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}
