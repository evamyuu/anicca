// ─────────────────────────────────────────────────────────────────────────────
// WhatsApp Types (Whatsmiau Cloud)
// Domain: WhatsApp webhook payloads, message templates
// Reference: https://whatsmiau.dev/docs
// ─────────────────────────────────────────────────────────────────────────────

/** Types of WhatsApp messages received via Whatsmiau webhook */
export type WhatsappMessageType =
  | 'text'
  | 'image'
  | 'document'
  | 'audio'
  | 'video'
  | 'location'
  | 'button_reply'
  | 'list_reply'
  | 'sticker'
  | 'reaction';

/** Whatsmiau Cloud webhook payload */
export interface WhatsmiaWebhookPayload {
  instanceId: string;
  event: 'message' | 'message_status' | 'call' | 'presence';
  data: WhatsappMessageData;
}

export interface WhatsappMessageData {
  messageId: string;
  /** Sender phone number in E.164 format (e.g. "+5511999999999") */
  from: string;
  /** Recipient phone number */
  to: string;
  timestamp: number; // Unix timestamp
  type: WhatsappMessageType;
  /** Text message content */
  text?: {
    body: string;
  };
  /** Image message content */
  image?: {
    url: string;
    mimeType: string;
    caption?: string;
  };
  /** Document message content */
  document?: {
    url: string;
    mimeType: string;
    fileName: string;
    caption?: string;
  };
  /** Button reply (interactive messages) */
  buttonReply?: {
    id: string;
    title: string;
  };
  /** List reply (interactive messages) */
  listReply?: {
    id: string;
    title: string;
    description?: string;
  };
}

/** WhatsApp message status update */
export interface WhatsappMessageStatus {
  messageId: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: number;
  errorCode?: number;
  errorMessage?: string;
}

/** Outgoing WhatsApp text message payload */
export interface SendWhatsappTextPayload {
  to: string; // E.164 phone number
  text: string;
  /** Whether to preview links in the message */
  previewUrl?: boolean;
}

/** Outgoing WhatsApp template message (for initial outreach) */
export interface SendWhatsappTemplatePayload {
  to: string;
  templateName: string;
  language: 'pt_BR';
  components?: WhatsappTemplateComponent[];
}

export interface WhatsappTemplateComponent {
  type: 'header' | 'body' | 'button';
  parameters: WhatsappTemplateParameter[];
}

export interface WhatsappTemplateParameter {
  type: 'text' | 'image' | 'document' | 'video';
  text?: string;
  image?: { url: string };
}

/** Outgoing WhatsApp interactive button message */
export interface SendWhatsappButtonsPayload {
  to: string;
  text: string;
  buttons: Array<{
    id: string;
    title: string; // max 20 chars
  }>;
}

/** Outgoing WhatsApp interactive list message */
export interface SendWhatsappListPayload {
  to: string;
  text: string;
  buttonText: string; // max 20 chars
  sections: Array<{
    title: string;
    rows: Array<{
      id: string;
      title: string; // max 24 chars
      description?: string; // max 72 chars
    }>;
  }>;
}

/** Whatsmiau API response */
export interface WhatsmiaApiResponse<T = unknown> {
  success: boolean;
  messageId?: string;
  error?: string;
  data?: T;
}
