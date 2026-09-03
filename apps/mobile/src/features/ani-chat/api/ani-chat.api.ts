/**
 * @fileoverview Typed HTTP wrappers for the Ani conversational AI endpoints.
 *
 * @module features/ani-chat/api/ani-chat.api
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import { httpClient } from '@/shared/api/http-client';
import { API_ENDPOINTS } from '@/shared/constants/api-endpoints.const';

import type { AniResponse, ConversationMessage } from '@anicca/types';

/**
 * Payload for {@link sendMessage}.
 */
export interface SendMessagePayload {
  /** The active conversation session identifier. */
  sessionId: string;
  /** The user's message text. */
  text: string;
  /** The channel from which the message originates. */
  channel: 'app' | 'web';
  /** The chosen Ani personality. */
  personality?: string;
  /**
   * Optional URL of an uploaded document to pass for OCR analysis.
   * @remarks Triggers the AWS Textract agent in the BFF orchestrator.
   */
  documentUrl?: string;
}

/**
 * Response shape from {@link sendMessage}.
 */
export interface SendMessageResponse {
  /** The persisted user message as returned by the server. */
  userMessage: ConversationMessage;
  /** The Ani response including text and GenUI cards. */
  aniResponse: AniResponse;
  /** The active session identifier (may differ if a new session was started). */
  sessionId: string;
}

/**
 * Sends a user message to the Ani orchestrator and returns the response.
 *
 * @param payload - See {@link SendMessagePayload}.
 * @returns A promise resolving to {@link SendMessageResponse}.
 * @throws {AxiosError} On network failure or a non-2xx HTTP status.
 */
export async function sendMessage(payload: SendMessagePayload): Promise<SendMessageResponse> {
  const response = await httpClient.post<any>(
    API_ENDPOINTS.messages.send,
    {
      session_id: payload.sessionId,
      text: payload.text,
      channel: payload.channel,
      personality: payload.personality,
      document_url: payload.documentUrl,
    }
  );
  
  return {
    userMessage: response.data.user_message,
    aniResponse: response.data.ani_response,
    sessionId: response.data.session_id,
  };
}

/**
 * Retrieves the full message history for a session.
 *
 * @param sessionId - The conversation session identifier.
 * @returns A promise resolving to an ordered array of {@link ConversationMessage}.
 * @throws {AxiosError} On network failure or a non-2xx HTTP status.
 */
export async function getConversationHistory(
  sessionId: string
): Promise<ConversationMessage[]> {
  const response = await httpClient.get<any[]>(
    API_ENDPOINTS.messages.history(sessionId)
  );
  return response.data.map(msg => ({
    id: msg.id,
    sessionId: msg.session_id,
    role: msg.role,
    text: msg.text,
    cards: msg.cards || [],
    channel: msg.channel,
    createdAt: msg.created_at,
  }));
}

/**
 * Requests a new conversation session from the BFF.
 *
 * @returns A promise resolving to an object containing the new `sessionId`.
 * @throws {AxiosError} On network failure or a non-2xx HTTP status.
 */
export async function startSession(): Promise<{ sessionId: string }> {
  const response = await httpClient.post<{ session_id: string }>(
    API_ENDPOINTS.messages.startSession
  );
  return { sessionId: response.data.session_id };
}