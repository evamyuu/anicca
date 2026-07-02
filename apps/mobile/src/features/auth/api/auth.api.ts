/**
 * Auth API definitions for Login and Registration.
 *
 * @module features/auth/api/auth.api
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import axios from 'axios';

// The dev API URL, ideally comes from env
const API_URL = 'http://10.0.2.2:8000/api/v1/auth';

export interface TokenResponse {
  access_token: string;
  token_type: string;
  is_new_user: boolean;
  patient_id: string;
}

export const authApi = {
  async login(email: string, password: string): Promise<TokenResponse> {
    const response = await axios.post<TokenResponse>(`${API_URL}/login`, {
      email,
      password,
    });
    return response.data;
  },

  async register(email: string, password: string, phone?: string): Promise<TokenResponse> {
    const response = await axios.post<TokenResponse>(`${API_URL}/register`, {
      email,
      password,
      phone,
    });
    return response.data;
  }
};
