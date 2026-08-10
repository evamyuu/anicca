/**
 * @fileoverview Authentication endpoints and payload definitions.
 *
 * @module shared/api/auth
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import { api } from './axios';

export async function loginUser(email: string, password: string) {
  const response = await api.post('/auth/login', {
    email: email,
    password: password
  });
  return response.data;
}

export async function registerUser(payload: { 
  email: string; 
  password: string; 
  username?: string;
  phone?: string;
  role: string; 
  crm_number?: string;
  cancer_type?: string | null;
  journey_phase?: string | null;
  treatment_modality?: string | null;
  ani_personality?: string;
  avatar_config?: Record<string, any>;
  consents?: Record<string, boolean>;
  [key: string]: any;
}) {
  const response = await api.post('/auth/register', payload);
  return response.data;
}

export async function loginWithGoogle(idToken: string) {
  const response = await api.post('/auth/google', { id_token: idToken });
  return response.data;
}