/**
 * @fileoverview Configured Axios instance with JWT interceptors.
 * Reads base URL from Expo environment variables.
 *
 * @module shared/api/axios
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import axios from 'axios';
import { useAuthStore } from '../lib/zustand-persist';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

/**
 * Singleton Axios instance tailored for Anicca's API.
 */
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('API returned 401: Signing out user.');
      useAuthStore.getState().signOut();
    }
    return Promise.reject(error);
  }
);