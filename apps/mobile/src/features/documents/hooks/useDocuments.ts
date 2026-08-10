/**
 * @fileoverview React Query hooks for the Documentos feature.
 * Handles listing patient documents and uploading new ones via OCR pipeline.
 *
 * @module features/documents/hooks/useDocuments
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/axios';
import { useAuthStore } from '@/shared/lib/zustand-persist';


export interface Document {
  id: string;
  patient_id: string;
  document_type: string;
  source_channel: string;
  summary: string;
  key_finding: string | null;
  ai_questions: string[];
  file_url: string;
  created_at: string;
}

export interface UploadDocumentPayload {
  uri: string;
  name: string;
  mimeType: string;
}


export const documentKeys = {
  all: ['documents'] as const,
  list: (patientId: string) => [...documentKeys.all, 'list', patientId] as const,
};


/**
 * Fetch all documents for the authenticated patient.
 */
export function useDocuments() {
  const patientId = useAuthStore((s) => s.userId);

  return useQuery<Document[]>({
    queryKey: documentKeys.list(patientId ?? ''),
    queryFn: async () => {
      if (!patientId) return [];
      const { data } = await api.get<Document[]>(`/documents/${patientId}`);
      return data;
    },
    enabled: !!patientId,
    staleTime: 1000 * 60 * 2, // 2 min
  });
}

/**
 * Upload a document (image or PDF) and trigger the OCR + LLM pipeline.
 * Uses multipart/form-data as required by the backend.
 */
export function useUploadDocument() {
  const queryClient = useQueryClient();
  const patientId = useAuthStore((s) => s.userId);

  return useMutation({
    mutationFn: async (payload: UploadDocumentPayload) => {
      const formData = new FormData();

      formData.append('file', {
        uri: payload.uri,
        name: payload.name,
        type: payload.mimeType,
      } as any);

      formData.append('patient_id', patientId ?? '');
      formData.append('source_channel', 'upload');

      const { data } = await api.post<Document>('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000, // OCR can take up to ~10s
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
    },
  });
}