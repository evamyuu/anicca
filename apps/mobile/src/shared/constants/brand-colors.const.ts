/**
 * @fileoverview Centralized design token constants for the Anicca brand palette.
 * Import this file wherever StyleSheet.create() is used instead of NativeWind.
 *
 * @module shared/constants/brand-colors.const
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

/**
 * Anicca brand color tokens.
 *
 * @remarks
 * These values mirror the Tailwind theme defined in `packages/config/tailwind.config.js`.
 * Any change to the palette MUST be applied to both files simultaneously.
 *
 * Structure:
 * - `PRIMARY`   — Deep brown, main brand identity
 * - `SECONDARY` — Warm orange, energy / call-to-action
 * - `AUX`       — Three auxiliary accent colors used in strategic UI points
 * - `BG`        — Background surfaces (light and dark)
 * - `SURFACE`   — Card and border surfaces
 * - `ERROR`     — Error / danger states (three intensities)
 * - `SEMANTIC`  — Convenience aliases for success / warning / info
 */
export const BRAND = {
  // ── Primary — Deep Brown ─────────────────────────────────────
  PRIMARY: {
    50:      '#f7f4f2',
    100:     '#ede6e0',
    200:     '#d9cdc3',
    300:     '#c0ad9f',
    400:     '#a48b78',
    DEFAULT: '#403229', // primary-500
    600:     '#382b23',
    700:     '#2e231c',
    800:     '#231a15',
    900:     '#17110d',
  },

  // ── Secondary — Warm Orange ──────────────────────────────────
  SECONDARY: {
    50:      '#fff5ee',
    100:     '#ffe8d5',
    200:     '#ffd0aa',
    300:     '#ffb87f',
    400:     '#ffa96b',
    DEFAULT: '#FF9A5C', // secondary-500
    600:     '#e8813a',
    700:     '#c66820',
    800:     '#9e5018',
    900:     '#7a3c10',
  },

  // ── Auxiliaries ───────────────────────────────────────────────
  AUX: {
    GREEN:  '#4DA167', // growth / success states
    PURPLE: '#725AC1', // clinical / doctor panel
    BLUE:   '#255C99', // trust / informational
  },

  // ── Backgrounds ───────────────────────────────────────────────
  BG: {
    LIGHT: '#F0E9E5', // warm off-white — light mode page bg
    DARK:  '#1E1E1E', // near-black — dark mode page bg
  },

  // ── Surfaces ─────────────────────────────────────────────────
  SURFACE: {
    CARD:        '#FFFFFF',
    CARD_DARK:   '#2C2C2C',
    BORDER:      '#d9cdc3',
    BORDER_DARK: '#3a3a3a',
  },

  // ── Error / Danger ────────────────────────────────────────────
  ERROR: {
    DEFAULT: '#D4203B',
    SOFT:    '#FA5770',
    VIVID:   '#E83752',
    LIGHT:   '#fef2f4',
    DARK:    '#a8142c',
  },

  // ── Semantic Convenience Aliases ─────────────────────────────
  SEMANTIC: {
    SUCCESS: '#4DA167',
    WARNING: '#FF9A5C',
    INFO:    '#255C99',
  },
} as const;

/** Shorthand for the most-used token: primary brand color. */
export const COLOR_PRIMARY   = BRAND.PRIMARY.DEFAULT;
/** Shorthand for the most-used token: secondary brand color. */
export const COLOR_SECONDARY = BRAND.SECONDARY.DEFAULT;
/** Shorthand for the light-mode background. */
export const COLOR_BG_LIGHT  = BRAND.BG.LIGHT;
/** Shorthand for the dark-mode background. */
export const COLOR_BG_DARK   = BRAND.BG.DARK;
