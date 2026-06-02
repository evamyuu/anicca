/**
 * @fileoverview Provides responsive layout helpers derived from the device's
 * current window dimensions and pixel density.
 *
 * @module shared/hooks/useResponsive
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import { useWindowDimensions, PixelRatio } from 'react-native';

/**
 * Responsive breakpoint thresholds (in logical pixels / dp).
 *
 * @remarks
 * Mirrors the Tailwind breakpoints used in NativeWind so that StyleSheet-based
 * layouts and NativeWind-based components share the same vocabulary.
 */
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
} as const;

/**
 * Shape returned by {@link useResponsive}.
 */
export interface ResponsiveValues {
  /** Current window width in logical pixels (dp). */
  width: number;
  /** Current window height in logical pixels (dp). */
  height: number;
  /** `true` when width < 640 — covers most phones in portrait. */
  isSmall: boolean;
  /** `true` when 640 ≤ width < 768 — larger phones / small tablets. */
  isMedium: boolean;
  /** `true` when width ≥ 768 — tablets and foldables in landscape. */
  isLarge: boolean;
  /**
   * Scales a value proportionally to the screen width relative to a 375 dp
   * design baseline (standard iPhone viewport).
   *
   * @param size - The value from the design spec (in dp).
   * @returns A scaled value suitable for the current device width.
   * @example
   * const fontSize = scale(16); // 16dp on 375-wide screen, proportional elsewhere
   */
  scale: (size: number) => number;
  /**
   * Scales a value proportionally to the screen height relative to a 812 dp
   * design baseline (iPhone X height).
   *
   * @param size - The value from the design spec (in dp).
   * @returns A scaled value suitable for the current device height.
   */
  verticalScale: (size: number) => number;
  /**
   * A moderate scale between 1:1 and full proportional scaling.
   * Useful for font sizes to prevent them from becoming too large on tablets.
   *
   * @param size - The base size in dp.
   * @param factor - How aggressive the scaling is (0 = no scale, 1 = full scale).
   * @defaultValue factor=0.5
   */
  moderateScale: (size: number, factor?: number) => number;
  /** Device pixel ratio (useful for hairline borders). */
  pixelRatio: number;
  /** 1 physical pixel expressed in logical pixels (hairline border width). */
  hairline: number;
}

const BASE_WIDTH  = 375;
const BASE_HEIGHT = 812;

/**
 * Returns responsive layout helpers that re-compute whenever the window
 * size changes (e.g. orientation change, split-screen on Android).
 *
 * @returns See {@link ResponsiveValues}.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { scale, verticalScale, isSmall } = useResponsive();
 *   return (
 *     <View style={{ padding: scale(16), height: verticalScale(200) }}>
 *       <Text style={{ fontSize: moderateScale(16) }}>Hello</Text>
 *     </View>
 *   );
 * }
 * ```
 */
export function useResponsive(): ResponsiveValues {
  const { width, height } = useWindowDimensions();
  const pixelRatio = PixelRatio.get();

  const scale = (size: number) => (width / BASE_WIDTH) * size;
  const verticalScale = (size: number) => (height / BASE_HEIGHT) * size;
  const moderateScale = (size: number, factor = 0.5) =>
    size + (scale(size) - size) * factor;

  return {
    width,
    height,
    isSmall:  width < BREAKPOINTS.sm,
    isMedium: width >= BREAKPOINTS.sm && width < BREAKPOINTS.md,
    isLarge:  width >= BREAKPOINTS.md,
    scale,
    verticalScale,
    moderateScale,
    pixelRatio,
    hairline: 1 / pixelRatio,
  };
}
