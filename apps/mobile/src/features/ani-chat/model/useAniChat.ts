/**
 * @fileoverview ViewModel hook for the Ani conversational chat feature.
 *
 * @module features/ani-chat/model/useAniChat
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import { useCallback, useEffect } from 'react';

import type { ConversationMessage } from '@anicca/types';

import { sendMessage, startSession, getConversationHistory } from '../api/ani-chat.api';
import { useAniChatStore } from './ani-chat.store';

/**
 * Manages session lifecycle and message exchange with the Ani BFF orchestrator.
 *
 * @remarks
 * On mount, a new session is requested from the BFF if none exists. When
 * {@link UseAniChatReturn.send} is called, the message is optimistically
 * appended to the local state while the server request is in flight.
 *
 * The BFF orchestrator executes the following pipeline per message:
 * 1. Context retrieval from Redis
 * 2. LangGraph multi-agent orchestration (RAG, CTCAE, Body Map, Rights agents)
 * 3. GenUI card synthesis
 * 4. Optional WhatsApp delivery via Whatsmiau Cloud (if phone is linked)
 *
 * @returns See {@link UseAniChatReturn}.
 *
 * @example
 * ```tsx
 * const { messages, isTyping, send } = useAniChat();
 * ```
 */
export function useAniChat() {
  const {
    sessionId,
    messages,
    isTyping,
    isLoading,
    error,
    setSessionId,
    addMessage,
    setMessages,
    setIsTyping,
    setIsLoading,
    setError,
  } = useAniChatStore();

  useEffect(() => {
    if (!sessionId) {
      initSession();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Requests a new session from the BFF and loads any existing history.
   *
   * @returns A promise that resolves when initialization is complete.
   */
  const initSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const { sessionId: newSessionId } = await startSession();
      setSessionId(newSessionId);
      const history = await getConversationHistory(newSessionId);
      if (history.length > 0) {
        setMessages(history);
      }
    } catch {
      setError('Não foi possível iniciar a conversa. Verifique sua conexão.');
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setSessionId, setMessages, setError]);

  /**
   * Sends a user message to the Ani orchestrator.
   *
   * @remarks
   * The message is optimistically appended before the network request.
   * On failure, the optimistic message is removed and an error is set.
   *
   * @param text - The non-empty message string to send.
   * @returns A promise that resolves when the server response has been applied.
   */
  const send = useCallback(
    async (text: string) => {
      if (!sessionId || !text.trim()) return;

      const tempUserMessage: ConversationMessage = {
        id: `temp-${Date.now()}`,
        sessionId,
        role: 'user',
        text: text.trim(),
        cards: [],
        isStreaming: false,
        channel: 'app',
        createdAt: new Date().toISOString(),
      };

      addMessage(tempUserMessage);
      setIsTyping(true);
      setError(null);

      try {
        const response = await sendMessage({
          sessionId,
          text: text.trim(),
          channel: 'app',
        });

        setMessages([
          ...messages.filter((m) => m.id !== tempUserMessage.id),
          response.userMessage,
          response.aniResponse as unknown as ConversationMessage,
        ]);
      } catch {
        setError('Ani não conseguiu responder. Tente novamente.');
        setMessages(messages.filter((m) => m.id !== tempUserMessage.id));
      } finally {
        setIsTyping(false);
      }
    },
    [sessionId, messages, addMessage, setIsTyping, setError, setMessages]
  );

  return {
    messages,
    isTyping,
    isLoading,
    error,
    send,
    retry: initSession,
  };
}

/**
 * Return type of {@link useAniChat}.
 */
export type UseAniChatReturn = ReturnType<typeof useAniChat>;
