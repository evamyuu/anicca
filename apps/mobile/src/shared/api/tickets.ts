/**
 * @fileoverview Tickets (chamados) API client — requests the patient opens with the
 * health system (SUS, convênio, hospital) and follows until they are resolved.
 *
 * @module shared/api/tickets
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import { httpClient as api } from './http-client';

export type TicketType = 'exame' | 'consulta' | 'medicamento' | 'transporte' | 'direitos' | 'outro';
export type TicketChannel = 'sus' | 'convenio' | 'hospital' | 'ouvidoria';
export type TicketStatus = 'aberto' | 'em_andamento' | 'resolvido';

export interface Ticket {
  id: string;
  patient_id: string;
  protocol: string;
  type: TicketType;
  channel: TicketChannel;
  title: string;
  description: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
}

export interface TicketInput {
  type: TicketType;
  channel: TicketChannel;
  title: string;
  description: string;
}

export async function listTickets(patientId: string): Promise<Ticket[]> {
  const { data } = await api.get('/api/v1/tickets', { params: { patient_id: patientId } });
  return data;
}

export async function createTicket(patientId: string, input: TicketInput): Promise<Ticket> {
  const { data } = await api.post('/api/v1/tickets', { patient_id: patientId, ...input });
  return data;
}

export async function updateTicket(id: string, patch: Partial<TicketInput> & { status?: TicketStatus }): Promise<Ticket> {
  const { data } = await api.patch(`/api/v1/tickets/${id}`, patch);
  return data;
}

export async function deleteTicket(id: string): Promise<void> {
  await api.delete(`/api/v1/tickets/${id}`);
}
