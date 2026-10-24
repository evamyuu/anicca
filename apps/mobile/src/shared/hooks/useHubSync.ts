/**
 * @fileoverview Hub Sync hook — SSE-based real-time cross-channel state invalidation.
 *
 * Subscribes to the Anicca Hub SSE stream and invalidates React Query caches
 * whenever a WhatsApp interaction (or any other channel) produces a data event.
 * This is how WhatsApp → app sync works in real time without polling.
 *
 * Supported events:
 * - `document_added` → invalidates ['documents']
 * - `body_map_updated` → invalidates ['body-map']
 * - `routine_synced` → invalidates ['routine']
 * - `journaling_synced` → invalidates ['journaling']
 *
 * @module shared/hooks/useHubSync
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AppState, AppStateStatus } from 'react-native';
import { API_ENDPOINTS } from '@/shared/constants/api-endpoints.const';

/** The base URL of the BFF API. */
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

/** Refresh interval used when the platform has no EventSource (native). */
const POLL_FALLBACK_MS = 3_000;

/** Typed hub event payload. */
export interface HubEvent {
  type:
    | 'connected'
    | 'document_added'
    | 'body_map_updated'
    | 'routine_synced'
    | 'journaling_synced'
    | 'tickets_synced'
    | 'symptoms_synced';
  payload?: Record<string, unknown>;
  user_id?: string;
}

/** Map from SSE event type to the React Query keys to invalidate. */
const EVENT_QUERY_KEYS: Record<string, string[][]> = {
  document_added: [['documents']],
  body_map_updated: [['body-map']],
  routine_synced: [['routine']],
  journaling_synced: [['journaling']],
  tickets_synced: [['tickets']],
  symptoms_synced: [['symptoms']],
};

/**
 * Options for `useHubSync`.
 */
export interface UseHubSyncOptions {
  /** The Anicca user UUID. Pass `null` to disable the hook. */
  userId: string | null;
  /** Called with each typed event received from the stream. */
  onEvent?: (event: HubEvent) => void;
}

/**
 * Subscribes to the Anicca Hub SSE stream and invalidates React Query caches
 * on every cross-channel data event.
 *
 * The connection is automatically paused when the app goes to the background
 * and resumed when it returns to the foreground.
 *
 * @param options - See {@link UseHubSyncOptions}.
 *
 * @example
 * ```tsx
 * useHubSync({ userId: session.userId, onEvent: (e) => console.log(e) });
 * ```
 */
export function useHubSync({ userId, onEvent }: UseHubSyncOptions): void {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);
  const isActiveRef = useRef(true);

  const connect = useCallback(() => {
    if (!userId || !isActiveRef.current) return;

    const url = `${API_BASE_URL}${API_ENDPOINTS.events.stream(userId)}`;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // React Native (Hermes) has no EventSource: fall back to polling the same query keys.
    if (typeof EventSource === 'undefined') {
      const timer = setInterval(() => {
        Object.values(EVENT_QUERY_KEYS).flat().forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      }, POLL_FALLBACK_MS);
      eventSourceRef.current = { close: () => clearInterval(timer) } as EventSource;
      return;
    }

    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onmessage = (messageEvent) => {
      try {
        const raw = messageEvent.data as string;
        if (raw.startsWith(':')) return; // keepalive comment

        const event: HubEvent = JSON.parse(raw);

        onEvent?.(event);

        // (Re)connected after being in the background: catch up on anything missed meanwhile.
        const keysToInvalidate =
          event.type === 'connected' ? Object.values(EVENT_QUERY_KEYS).flat() : EVENT_QUERY_KEYS[event.type];
        if (keysToInvalidate) {
          keysToInvalidate.forEach((queryKey) => {
            queryClient.invalidateQueries({ queryKey });
          });
        }
      } catch {
      }
    };

    es.onerror = () => {
      es.close();
      eventSourceRef.current = null;
      if (isActiveRef.current) {
        setTimeout(connect, 5_000);
      }
    };
  }, [userId, queryClient, onEvent]);

  const disconnect = useCallback(() => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
  }, []);

  useEffect(() => {
    if (!userId) return;

    isActiveRef.current = true;
    connect();

    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        isActiveRef.current = true;
        connect();
      } else {
        isActiveRef.current = false;
        disconnect();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppState);

    return () => {
      isActiveRef.current = false;
      disconnect();
      subscription.remove();
    };
  }, [userId, connect, disconnect]);
}