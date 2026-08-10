/**
 * @fileoverview Implementation of _layout.
 *
 * @module app/(onboarding)/_layoutx
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function OnboardingLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#F0E9E5' }}>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="intro" />
        <Stack.Screen name="step-1-welcome" />
        <Stack.Screen name="step-1-profile" />
        <Stack.Screen name="step-2-name" />
        <Stack.Screen name="step-3-age-gender" />
        <Stack.Screen name="step-4-cancer-patient" />
        <Stack.Screen name="step-5-stage-patient" />
        <Stack.Screen name="step-6-modality-patient" />
        <Stack.Screen name="step-7-phase-patient" />
        <Stack.Screen name="step-8-treatment-patient" />
        <Stack.Screen name="step-4-caregiver-info" />
        <Stack.Screen name="step-5-cancer-caregiver" />
        <Stack.Screen name="step-6-phase-caregiver" />
        <Stack.Screen name="step-7-priorities-caregiver" />
        <Stack.Screen name="step-3-doctor-crm" />
        <Stack.Screen name="step-4-specialty-doctor" />
        <Stack.Screen name="step-5-interests-doctor" />
        <Stack.Screen name="step-wpp" />
        <Stack.Screen name="step-perms" />
      </Stack>
    </View>
  );
}