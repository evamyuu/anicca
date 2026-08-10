/**
 * @fileoverview In-app splash screen displayed while fonts and initial resources load.
 *
 * @module pages/splash/SplashPage
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import LogoLight from '../../../assets/images/brand/logo-light.svg';
import LogoDark from '../../../assets/images/brand/logo-dark.svg';
import { useTheme } from '@/shared/providers/ThemeProvider';
import { ThemeColors } from '@/shared/theme/colors';
import { useResponsive } from '@/shared/hooks/useResponsive';




/**
 * Full-screen splash/loading page rendered while the app initialises.
 *
 * @remarks
 * Renders the Anicca logo centred vertically and a looping animated loading
 * bar pinned to the bottom of the screen. No Lottie dependency — animation
 * is driven by React Native's {@link Animated} API so it works before the
 * Lottie assets are bundled.
 *
 * @returns The splash screen element.
 */
export function SplashPage() {
  const { isDark, colors } = useTheme();
  const styles = createStyles(colors);
  
  const { width }   = useResponsive();
  const TRACK_WIDTH = width * 0.55;

  const indicatorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(indicatorAnim, {
      toValue:         1,
      duration:        2500, // Matches the minimum splash duration in _layout.tsx
      useNativeDriver: false,
    }).start();
  }, [indicatorAnim]);

  /** Progress from 0 to TRACK_WIDTH */
  const indicatorWidth = indicatorAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [0, TRACK_WIDTH],
  });

  const trackColor = 'rgba(215, 204, 197, 0.4)'; // #D7CCC5 at 40% as requested
  const Logo = isDark ? LogoDark : LogoLight;

  return (
    <View style={styles.container}>
      {/* ── Logo centred ── */}
      <View style={styles.logoArea}>
        <Logo 
          width={180}
          height={60}
          style={styles.logo as any}
        />
      </View>

      {/* ── Loading indicator pinned to bottom ── */}
      <View style={styles.loaderArea}>
        {/* Track */}
        <View style={[styles.track, { backgroundColor: trackColor, width: TRACK_WIDTH }]}>
          {/* Animated pill */}
            <Animated.View
            style={[
              styles.indicator,
              { backgroundColor: colors.primary, width: indicatorWidth },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex:           1,
    backgroundColor: colors.background,
    alignItems:     'center',
    justifyContent: 'center',
  },
  logoArea: {
    flex:            1,
    alignItems:      'center',
    justifyContent:  'center',
  },
  logo: {
    width:  220,
    height: 220,
  },
  loaderArea: {
    paddingBottom: 56,
    alignItems:    'center',
  },
  track: {
    height:       4,
    borderRadius: 9999,
    overflow:     'hidden',
    position:     'relative',
  },
  indicator: {
    position:     'absolute',
    top:          0,
    left:         0,
    height:       4,
    borderRadius: 9999,
  },
});