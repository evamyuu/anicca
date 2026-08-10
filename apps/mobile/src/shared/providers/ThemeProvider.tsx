/**
 * @fileoverview Provides theme state (dark/light mode) to the component tree.
 *
 * @module shared/providers/ThemeProvider
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeColors, lightColors, darkColors } from '../theme/colors';

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
  /** Active theme color tokens */
  colors: ThemeColors;
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

  useEffect(() => {
    AsyncStorage.getItem('@theme_preference').then((savedTheme) => {
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setOverrideTheme(savedTheme);
      }
    });
  }, []);

  const theme: Theme = overrideTheme ?? (systemTheme === 'dark' ? 'dark' : 'light');
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    setOverrideTheme((prev) => {
      const newTheme = (prev === null ? isDark : prev === 'dark') ? 'light' : 'dark';
      AsyncStorage.setItem('@theme_preference', newTheme);
      return newTheme;
    });
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, colors }}>
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