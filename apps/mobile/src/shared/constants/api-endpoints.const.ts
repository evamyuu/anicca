/**
 * @fileoverview Typed API endpoint constants for all Anicca BFF routes.
 *
 * @module shared/constants/api-endpoints.const
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

/**
 * All BFF API route strings, organized by domain.
 *
 * @remarks
 * All HTTP calls in the application MUST reference strings from this object.
 * No endpoint string may be hardcoded in a feature module.
 *
 * @example
 * ```ts
 * httpClient.post(API_ENDPOINTS.messages.send, payload);
 * ```
 */
export const API_ENDPOINTS = {
  /** Authentication endpoints. */
  auth: {
    login: '/api/v1/auth/login',
    register: '/api/v1/auth/register',
    refresh: '/api/v1/auth/refresh',
    logout: '/api/v1/auth/logout',
    me: '/api/v1/auth/me',
  },

  /** Ani conversational AI endpoints. */
  messages: {
    send: '/api/v1/messages',
    startSession: '/api/v1/messages/session',
    /**
     * @param sessionId - The active conversation session identifier.
     * @returns The history endpoint URL for the given session.
     */
    history: (sessionId: string) => `/api/v1/messages/session/${sessionId}`,
  },

  /** WhatsApp integration via Whatsmiau Cloud. */
  whatsapp: {
    webhook: '/api/v1/whatsapp/webhook',
    send: '/api/v1/whatsapp/send',
    linkPhone: '/api/v1/whatsapp/link',
  },

  /** Interactive body map symptom registration. */
  bodyMap: {
    entries: '/api/v1/body-map',
    create: '/api/v1/body-map',
    /**
     * @param patientId - The patient's pseudonymized identifier.
     * @returns The history endpoint URL.
     */
    history: (patientId: string) => `/api/v1/body-map/${patientId}/history`,
    /**
     * @param patientId - The patient's pseudonymized identifier.
     * @param region - The body region identifier.
     * @returns The region-specific endpoint URL.
     */
    byRegion: (patientId: string, region: string) =>
      `/api/v1/body-map/${patientId}/region/${region}`,
  },

  /** NCI CTCAE v5.0 symptom grading endpoints. */
  symptoms: {
    checkins: '/api/v1/symptoms',
    create: '/api/v1/symptoms',
    /**
     * @param patientId - The patient's pseudonymized identifier.
     * @returns The history endpoint URL.
     */
    history: (patientId: string) => `/api/v1/symptoms/${patientId}/history`,
  },

  /** Daily routine tracking endpoints. */
  routine: {
    today: '/api/v1/routine/today',
    temperature: '/api/v1/routine/temperature',
    hydration: '/api/v1/routine/hydration',
    sleep: '/api/v1/routine/sleep',
    medications: '/api/v1/routine/medications',
    /**
     * @param doseId - The medication dose identifier.
     * @returns The mark-as-taken endpoint URL.
     */
    markDose: (doseId: string) => `/api/v1/routine/medications/doses/${doseId}/taken`,
  },

  /** Emotional journaling and mood tracking endpoints. */
  journaling: {
    checkin: '/api/v1/journaling/checkin',
    history: '/api/v1/journaling/history',
    moodTrend: '/api/v1/journaling/mood-trend',
  },

  /** Rights advocacy ticket endpoints. */
  tickets: {
    list: '/api/v1/tickets',
    create: '/api/v1/tickets',
    /**
     * @param ticketId - The ticket identifier.
     * @returns The ticket detail endpoint URL.
     */
    get: (ticketId: string) => `/api/v1/tickets/${ticketId}`,
    /**
     * @param ticketId - The ticket identifier.
     * @returns The ticket update endpoint URL.
     */
    update: (ticketId: string) => `/api/v1/tickets/${ticketId}`,
  },

  /** Medical document (OCR + storage) endpoints. */
  documents: {
    list: '/api/v1/documents',
    upload: '/api/v1/documents',
    /**
     * @param docId - The document identifier.
     * @returns The document detail endpoint URL.
     */
    get: (docId: string) => `/api/v1/documents/${docId}`,
    /**
     * @param docId - The document identifier.
     * @returns The document deletion endpoint URL.
     */
    delete: (docId: string) => `/api/v1/documents/${docId}`,
  },

  /** User profile and avatar endpoints. */
  profile: {
    get: '/api/v1/profile',
    update: '/api/v1/profile',
    avatar: '/api/v1/profile/avatar',
    aniPersonality: '/api/v1/profile/ani-personality',
  },

  /** LGPD consent management endpoints. */
  consent: {
    list: '/api/v1/consent',
    grant: '/api/v1/consent/grant',
    /**
     * @param consentType - The consent type identifier to revoke.
     * @returns The revocation endpoint URL.
     */
    revoke: (consentType: string) => `/api/v1/consent/${consentType}/revoke`,
    history: '/api/v1/consent/history',
  },

  /** Google Health Connect wearable sync endpoints. */
  wearables: {
    sync: '/api/v1/wearables/sync',
    latest: '/api/v1/wearables/latest',
  },

  /** Doctor panel endpoints. */
  doctor: {
    patients: '/api/v1/doctor/patients',
    /**
     * @param patientId - The patient's pseudonymized identifier.
     * @returns The patient detail endpoint URL.
     */
    patient: (patientId: string) => `/api/v1/doctor/patients/${patientId}`,
    /**
     * @param patientId - The patient's pseudonymized identifier.
     * @returns The pre-consultation briefing endpoint URL.
     */
    briefing: (patientId: string) => `/api/v1/doctor/patients/${patientId}/briefing`,
    clinicalQuery: '/api/v1/doctor/clinical-query',
  },

  /** Hub Sync — Server-Sent Events for real-time cross-channel updates. */
  events: {
    /**
     * SSE stream endpoint. Connect with EventSource to receive real-time events.
     * Events: document_added, body_map_updated, routine_synced, journaling_synced.
     *
     * @param userId - The Anicca user UUID.
     * @returns The SSE stream URL for the given user.
     */
    stream: (userId: string) => `/api/v1/events/stream/${userId}`,
  },
} as const;

