/**
 * @fileoverview Configured Axios HTTP client with authentication and error interceptors.
 *
 * @module shared/api/http-client
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import axios from 'axios';
import Constants from 'expo-constants';

import { useAuthStore } from '@/shared/lib/zustand-persist';

/** @internal Resolved API base URL from Expo config or development fallback. */
const BASE_URL =
  (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl ??
  'http://localhost:8000';

/** @internal Request timeout in milliseconds. */
const REQUEST_TIMEOUT_MS = 30_000;

/**
 * Pre-configured Axios instance for all Anicca BFF (FastAPI) requests.
 *
 * @remarks
 * Two interceptors are registered at module load time:
 * 1. **Request interceptor** — injects the JWT bearer token from the Zustand auth store.
 * 2. **Response interceptor** — intercepts HTTP 401 responses and triggers sign-out.
 *
 * @see {@link https://axios-http.com/docs/interceptors}
 */
export const httpClient = axios.create({
  baseURL: BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

httpClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      useAuthStore.getState().signOut();
    }
    return Promise.reject(error);
  }
);
