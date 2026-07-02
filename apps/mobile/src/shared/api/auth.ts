/**
 * @fileoverview Authentication endpoints and payload definitions.
 *
 * @module shared/api/auth
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import { api } from './axios';

// Login uses OAuth2PasswordRequestForm in FastAPI, which demands 'application/x-www-form-urlencoded'
export async function loginUser(email: string, password: string) {
  const formData = new FormData();
  formData.append('username', email);
  formData.append('password', password);

  const response = await api.post('/auth/login', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function registerUser(payload: { email: string; password: string; role: string; crm_number?: string }) {
  const response = await api.post('/auth/register', payload);
  return response.data;
}
