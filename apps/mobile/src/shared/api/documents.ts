/**
 * @fileoverview Documents API client for fetching and uploading medical documents.
 *
 * @module shared/api/documents
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import { httpClient as api } from './http-client';

export interface DocumentResponse {
  id: string;
  patient_id: string;
  document_type: string;
  source_channel: string;
  summary: string;
  key_finding?: string;
  ai_questions: string[];
  file_url: string;
  created_at: string;
}

/**
 * List all documents for a patient.
 */
export async function listDocuments(
  patientId: string,
  documentType?: string,
  sourceChannel?: string
): Promise<DocumentResponse[]> {
  const params: Record<string, string> = {};
  if (documentType) params.document_type = documentType;
  if (sourceChannel) params.source_channel = sourceChannel;
  
  const { data } = await api.get(`/documents/${patientId}`, { params });
  return data;
}

/**
 * Upload a new document with FormData.
 */
export async function uploadDocument(
  patientId: string,
  fileUri: string,
  fileName: string,
  fileType: string,
  sourceChannel: string = 'upload'
): Promise<DocumentResponse> {
  const formData = new FormData();
  formData.append('patient_id', patientId);
  formData.append('source_channel', sourceChannel);
  formData.append('file', {
    uri: fileUri,
    name: fileName,
    type: fileType,
  } as any);

  const { data } = await api.post(`/documents/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
}