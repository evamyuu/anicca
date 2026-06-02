/**
 * @fileoverview Zustand store for Ani conversational AI state.
 *
 * @module features/ani-chat/model/ani-chat.store
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import { create } from 'zustand';

import type { ConversationMessage } from '@anicca/types';

/**
 * Shape of the Ani chat Zustand store.
 */
export interface AniChatState {
  /** The active conversation session identifier. */
  sessionId: string | null;
  /** Ordered array of messages in the current session. */
  messages: ConversationMessage[];
  /** `true` while Ani is generating a response. */
  isTyping: boolean;
  /** `true` during initial session load or history fetch. */
  isLoading: boolean;
  /** The last error message, or `null` when the store is in a clean state. */
  error: string | null;
  /**
   * Sets the active session identifier.
   * @param sessionId - The session identifier returned by the BFF.
   */
  setSessionId: (sessionId: string) => void;
  /**
   * Appends a single message to the end of the messages array.
   * @param message - The message to append.
   */
  addMessage: (message: ConversationMessage) => void;
  /**
   * Replaces the messages array in its entirety.
   * @param messages - The new ordered message array.
   */
  setMessages: (messages: ConversationMessage[]) => void;
  /**
   * Sets the Ani typing indicator state.
   * @param isTyping - `true` while Ani is generating a response.
   */
  setIsTyping: (isTyping: boolean) => void;
  /**
   * Sets the loading state.
   * @param isLoading - `true` during initial load or history fetch.
   */
  setIsLoading: (isLoading: boolean) => void;
  /**
   * Sets the error message.
   * @param error - The error string, or `null` to clear.
   */
  setError: (error: string | null) => void;
  /** Resets the session and clears all messages. */
  clearMessages: () => void;
}

/**
 * Zustand store for Ani chat state.
 *
 * @remarks
 * This store is intentionally **not** persisted — conversation history
 * is fetched from the BFF on session initialization.
 */
export const useAniChatStore = create<AniChatState>()((set) => ({
  sessionId: null,
  messages: [],
  isTyping: false,
  isLoading: false,
  error: null,
  setSessionId: (sessionId) => set({ sessionId }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setMessages: (messages) => set({ messages }),
  setIsTyping: (isTyping) => set({ isTyping }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearMessages: () => set({ messages: [], sessionId: null }),
}));
