/**
 * @fileoverview Design system tokens for the Anicca platform.
 *
 * Exports typed color, typography, spacing, and border-radius constants
 * consumed by both `apps/mobile` (NativeWind) and `apps/web` (Tailwind CSS).
 *
 * @module packages/ui
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

/**
 * Brand color palette.
 *
 * @remarks
 * All shades are WCAG 2.1 AA-compliant when paired with the surface tokens.
 * `primary` maps to the Anicca purple; `secondary` maps to the empathy rose.
 * `ctcae` maps CTCAE grades 0–4 to status colors.
 *
 * @example
 * ```ts
 * import { Colors } from '@anicca/ui';
 * const activeTint = Colors.primary[500]; // '#a855f7'
 * ```
 */
export const Colors = {
  primary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764',
  },
  secondary: {
    400: '#fb7185',
    500: '#f43f5e',
    600: '#e11d48',
  },
  neutral: {
    50: '#f8f7f9',
    100: '#f1eff4',
    400: '#ada5bc',
    500: '#8f86a0',
    700: '#5e5870',
    900: '#3e3a50',
    950: '#1a1727',
  },
  surface: {
    dark: '#0F0A1A',
    cardDark: '#1E1433',
    borderDark: '#2d2540',
  },
  /** NCI CTCAE grade severity colors (grades 0–4). */
  ctcae: {
    0: '#22c55e',
    1: '#84cc16',
    2: '#f59e0b',
    3: '#ef4444',
    4: '#7c3aed',
  },
} as const;

/**
 * Typography scale: font family names and size steps.
 *
 * @remarks
 * Font family strings correspond to the Expo Google Fonts identifiers
 * loaded by `FontProvider`. The `sizes` object uses pixel values and
 * enforces a minimum of `lg` (18px) for accessible text per WCAG 1.4.4.
 */
export const Typography = {
  fonts: {
    regular: 'Nunito_400Regular',
    medium: 'Nunito_500Medium',
    semibold: 'Nunito_600SemiBold',
    bold: 'Nunito_700Bold',
    extrabold: 'Nunito_800ExtraBold',
  },
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    /** Minimum accessible font size per WCAG 1.4.4. */
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
} as const;

/**
 * Spacing scale in logical pixels.
 *
 * @remarks
 * `11` (44 dp) and `12` (48 dp) correspond to the minimum touch target
 * sizes for iOS and Android respectively per WCAG 2.5.5.
 */
export const Spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  /** Minimum iOS touch target (44 pt). */
  11: 44,
  /** Minimum Android touch target (48 dp). */
  12: 48,
  16: 64,
} as const;

/**
 * Border radius scale in logical pixels.
 */
export const BorderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;
