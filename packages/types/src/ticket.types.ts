// ─────────────────────────────────────────────────────────────────────────────
// Ticket Types
// Domain: Support tickets, ouvidoria, complaint routing
// ─────────────────────────────────────────────────────────────────────────────

/** Category/type of support ticket */
export type TicketType =
  | 'law_60_days' // Lei dos 60 Dias violation
  | 'appointment_scheduling' // Difficulty scheduling appointment
  | 'report_delay' // Medical report delay
  | 'authorization_denial' // Treatment authorization denied
  | 'medication_access' // Medication access issue
  | 'transportation_tfd' // TFD (Tratamento Fora de Domicílio) logistics
  | 'insurance_dispute' // Convênio dispute
  | 'communication_issue' // Contradictory communication from clinic/insurer
  | 'financial_support' // Financial assistance request
  | 'other';

/** Current status of the ticket */
export type TicketStatus =
  | 'draft' // Being filled in by user
  | 'submitted' // Sent
  | 'in_progress' // Being handled
  | 'awaiting_response' // Waiting for institution's response
  | 'resolved' // Issue resolved
  | 'closed' // Closed without resolution
  | 'escalated'; // Escalated to Defensoria/MP

/**
 * Channel for routing the ticket.
 * Determined automatically based on:
 * - Patient's treatmentModality (sus/convenio/particular)
 * - Ticket type
 */
export type TicketChannel =
  | 'cacon_ouvidoria' // CACON/UNACON internal ombudsman
  | 'sus_municipal' // Municipal health secretary
  | 'sus_state' // State health secretary
  | 'datasus_sisreg' // SISREG scheduling system
  | 'ans_complaint' // ANS (Agência Nacional de Saúde)
  | 'procon' // Consumer protection
  | 'defensoria_publica' // Public defender's office
  | 'ministerio_publico' // Public prosecutor's office
  | 'email_institution'; // Direct email to institution (no API)

/** A support ticket */
export interface Ticket {
  id: string;
  patientId: string;
  type: TicketType;
  status: TicketStatus;
  channel: TicketChannel;
  title: string;
  description: string;
  /** AI-suggested improvement to the description */
  aiSuggestedDescription?: string;
  /** Institution being addressed */
  institutionName?: string;
  institutionEmail?: string;
  /** Protocol number returned by the institution */
  protocolNumber?: string;
  /** Expected response deadline (ISO 8601) */
  responseDeadline?: string;
  /** Whether notifications are active for this ticket */
  notificationsEnabled: boolean;
  attachments: TicketAttachment[];
  statusHistory: TicketStatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketAttachment {
  id: string;
  fileName: string;
  fileType: string;
  url: string; // Signed S3 URL
  uploadedAt: string;
}

export interface TicketStatusHistoryEntry {
  status: TicketStatus;
  changedAt: string;
  changedBy: 'user' | 'system' | 'institution';
  note?: string;
}
