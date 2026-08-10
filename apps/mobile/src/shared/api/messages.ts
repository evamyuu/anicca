/**
 * @fileoverview Implementation of messages.
 *
 * @module shared/api/messages
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import { httpClient } from './http-client';

export interface StartSessionResponse {
  session_id: string;
}

export interface SendMessagePayload {
  session_id: string;
  text: string;
  channel?: string;
  document_url?: string;
}

export interface MessageCard {
  type: string;
  [key: string]: any;
}

export interface Message {
  id: string;
  session_id: string;
  role: 'user' | 'ani';
  text: string;
  cards: MessageCard[];
  channel: string;
  agents_invoked: string[];
  created_at: string;
}

export interface SendMessageResponse {
  user_message: Message;
  ani_response: Message;
  session_id: string;
}

export const messagesApi = {
  startSession: async (): Promise<StartSessionResponse> => {
    const { data } = await httpClient.post<StartSessionResponse>('/api/v1/messages/session');
    return data;
  },

  sendMessage: async (payload: SendMessagePayload): Promise<SendMessageResponse> => {
    const { data } = await httpClient.post<SendMessageResponse>('/api/v1/messages', payload);
    return data;
  },

  getSessionHistory: async (sessionId: string): Promise<Message[]> => {
    const { data } = await httpClient.get<Message[]>(`/api/v1/messages/session/${sessionId}`);
    return data;
  },
};