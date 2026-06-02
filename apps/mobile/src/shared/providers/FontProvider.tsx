/**
 * @fileoverview Loads the Nunito font family and exposes font-loading state via context.
 *
 * @module shared/providers/FontProvider
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import React, { createContext, useContext, useEffect } from 'react';
import {
  useFonts,
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';

/**
 * Shape of the value exposed by the internal FontContext.
 */
interface FontContextValue {
  /** True while fonts are still downloading / extracting. */
  isLoading: boolean;
}

/** @internal */
const FontContext = createContext<FontContextValue>({ isLoading: true });

/**
 * Props for {@link FontProvider}.
 */
interface FontProviderProps {
  /** The component subtree that will have access to the font-loading context. */
  children: React.ReactNode;
  /**
   * Optional callback invoked when font loading completes (success or error).
   * Typically used to hide the native splash screen.
   */
  onFontsLoaded?: () => void;
}

/**
 * Loads the Nunito font variants required by the design system and publishes
 * the loading state to all descendants via {@link FontContext}.
 *
 * @remarks
 * `children` is always rendered so the navigator tree is never unmounted.
 * The root layout reads `isLoading` to decide whether to overlay the in-app
 * {@link SplashPage}.
 *
 * @param props - See {@link FontProviderProps}.
 * @returns The context provider element wrapping `children`.
 */
export function FontProvider({ children, onFontsLoaded }: FontProviderProps) {
  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  const isLoading = !fontsLoaded && !fontError;

  useEffect(() => {
    if (!isLoading) {
      onFontsLoaded?.();
    }
  }, [isLoading, onFontsLoaded]);

  return (
    <FontContext.Provider value={{ isLoading }}>
      {children}
    </FontContext.Provider>
  );
}

/**
 * Consumes the font-loading state from {@link FontProvider}.
 *
 * @returns `true` while fonts are still loading, `false` once ready.
 */
export function useFontLoading(): boolean {
  return useContext(FontContext).isLoading;
}
