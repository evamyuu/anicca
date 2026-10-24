/**
 * @fileoverview Care team API client: caregivers and doctors linked to a patient.
 *
 * @module shared/api/care-team
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import { httpClient as api } from './http-client';

export interface CaregiverLink {
  id: string;
  name: string;
  email: string;
}

export interface DoctorLink {
  id: string;
  name: string;
  crm: string;
}

export async function listCaregivers(patientId: string): Promise<CaregiverLink[]> {
  const { data } = await api.get(`/api/v1/auth/caregivers/${patientId}`);
  return data;
}

export async function linkCaregiver(patientId: string, email: string): Promise<void> {
  await api.post('/api/v1/auth/link-caregiver', null, { params: { patient_id: patientId, email } });
}

export async function unlinkCaregiver(patientId: string, caregiverId: string): Promise<void> {
  await api.post('/api/v1/auth/unlink-caregiver', null, { params: { patient_id: patientId, caregiver_id: caregiverId } });
}

export async function listDoctors(patientId: string): Promise<DoctorLink[]> {
  const { data } = await api.get(`/api/v1/auth/doctors/${patientId}`);
  return data;
}

export async function linkDoctor(patientId: string, crm: string): Promise<void> {
  await api.post('/api/v1/auth/link-doctor', null, { params: { patient_id: patientId, crm } });
}

export async function unlinkDoctor(patientId: string, doctorId: string): Promise<void> {
  await api.post('/api/v1/auth/unlink-doctor', null, { params: { patient_id: patientId, doctor_id: doctorId } });
}
