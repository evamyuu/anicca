/**
 * @fileoverview In-app splash screen displayed while fonts and initial resources load.
 *
 * @module pages/splash/SplashPage
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, StyleSheet, useColorScheme } from 'react-native';
import { BRAND } from '@/shared/constants/brand-colors.const';
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
  const colorScheme = useColorScheme();
  const isDark      = colorScheme === 'dark';
  const { width }   = useResponsive();
  const TRACK_WIDTH = width * 0.55;

  const indicatorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(indicatorAnim, {
          toValue:         1,
          duration:        1200,
          useNativeDriver: true,
        }),
        Animated.timing(indicatorAnim, {
          toValue:         0,
          duration:        800,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [indicatorAnim]);

  /** Translate the indicator pill from left edge to right edge of the track. */
  const translateX = indicatorAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [0, TRACK_WIDTH - 48],
  });

  const backgroundColor = isDark ? BRAND.BG.DARK  : BRAND.BG.LIGHT;
  const trackColor      = isDark ? BRAND.SURFACE.BORDER_DARK : BRAND.SURFACE.BORDER;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* ── Logo centred ── */}
      <View style={styles.logoArea}>
        <Image
          source={require('../../../assets/images/brand/logo.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Anicca logo"
          accessibilityRole="image"
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
              { backgroundColor: BRAND.SECONDARY.DEFAULT, transform: [{ translateX }] },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:           1,
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
    width:        48,
    height:       4,
    borderRadius: 9999,
  },
});
