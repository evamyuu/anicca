/**
 * @fileoverview Implementation of intro.
 *
 * @module app/(onboarding)/introx
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import IntroBackground from '../../assets/images/onboarding/anicca-intro-background.svg';
import { GradientButton } from '@/shared/ui/GradientButton';
import { BRAND } from '@/shared/constants/brand-colors.const';

export default function IntroScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" />
      
      {/* Full screen background SVG */}
      <View style={StyleSheet.absoluteFillObject}>
        <IntroBackground width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
      </View>

      {/* Buttons at the bottom */}
      <View style={[styles.bottomArea, { paddingBottom: Math.max(insets.bottom, 30) }]}>
        <GradientButton
          title="INICIAR"
          colors={[BRAND.SECONDARY.DEFAULT, BRAND.SECONDARY[600]]}
          onPress={() => router.push('/(onboarding)/step-1-welcome')}
        />
        
        <View style={styles.spacing} />

        <GradientButton
          title="JÁ TENHO UMA CONTA"
          colors={[BRAND.PRIMARY.DEFAULT, BRAND.PRIMARY[400]]}
          onPress={() => router.push('/(auth)/login')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BRAND.PRIMARY[50], // Fallback color
  },
  bottomArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  spacing: {
    height: 15,
  }
});