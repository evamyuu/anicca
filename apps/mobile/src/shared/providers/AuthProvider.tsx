/**
 * @fileoverview Exposes authentication state from the Zustand store via React Context.
 *
 * @module shared/providers/AuthProvider
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import React, { createContext, useContext } from 'react';

import { useAuthStore } from '@/shared/lib/zustand-persist';

/**
 * Shape of the value exposed by {@link AuthContext}.
 */
export interface AuthContextValue {
  /** `true` when a valid session token is stored. */
  isAuthenticated: boolean;
  /** The pseudonymized user identifier, or `null` if unauthenticated. */
  userId: string | null;
  /** The active user profile type, or `null` if unauthenticated. */
  profileType: 'patient' | 'caregiver' | 'doctor' | null;
  /** Clears the session and navigates to the auth flow. */
  signOut: () => void;
}

/** @internal */
const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Props for {@link AuthProvider}.
 */
interface AuthProviderProps {
  /** The component subtree that will have access to the auth context. */
  children: React.ReactNode;
}

/**
 * Bridges the Zustand auth store to React Context, making auth state
 * available to any descendant component via {@link useAuth}.
 *
 * @param props - See {@link AuthProviderProps}.
 * @returns The context provider element wrapping `children`.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userId = useAuthStore((s) => s.userId);
  const profileType = useAuthStore((s) => s.profileType);
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, profileType, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Consumes the {@link AuthContext} value.
 *
 * @throws {Error} When called outside of an {@link AuthProvider} subtree.
 * @returns The current {@link AuthContextValue}.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
