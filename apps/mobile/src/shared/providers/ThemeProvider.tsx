/**
 * @fileoverview Provides theme state (dark/light mode) to the component tree.
 *
 * @module shared/providers/ThemeProvider
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';

/** Supported theme identifiers. */
export type Theme = 'light' | 'dark';

/**
 * Shape of the value exposed by {@link ThemeContext}.
 */
export interface ThemeContextValue {
  /** The currently active theme. */
  theme: Theme;
  /** Convenience flag — `true` when the active theme is `'dark'`. */
  isDark: boolean;
  /** Toggles between `'dark'` and `'light'` themes. */
  toggleTheme: () => void;
}

/** @internal */
const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Props for {@link ThemeProvider}.
 */
interface ThemeProviderProps {
  /** The component subtree that will have access to the theme context. */
  children: React.ReactNode;
}

/**
 * Provides the active theme to all descendant components.
 *
 * @remarks
 * Defaults to the system color scheme preference. A manual override can be
 * applied at runtime via {@link ThemeContextValue.toggleTheme}.
 *
 * @param props - See {@link ThemeProviderProps}.
 * @returns The context provider element wrapping `children`.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemTheme = useColorScheme();
  const [overrideTheme, setOverrideTheme] = useState<Theme | null>(null);

  const theme: Theme = overrideTheme ?? (systemTheme === 'dark' ? 'dark' : 'light');
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    setOverrideTheme((prev) => {
      if (prev === null) return isDark ? 'light' : 'dark';
      return prev === 'dark' ? 'light' : 'dark';
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Consumes the {@link ThemeContext} value.
 *
 * @throws {Error} When called outside of a {@link ThemeProvider} subtree.
 * @returns The current {@link ThemeContextValue}.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return context;
}
