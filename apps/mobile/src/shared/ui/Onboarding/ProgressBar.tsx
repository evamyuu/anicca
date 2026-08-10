/**
 * @fileoverview Implementation of ProgressBar.
 *
 * @module shared/ui/Onboarding/ProgressBarx
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  return (
    <View style={styles.track}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i < currentStep ? styles.dotDone : undefined,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 22,
    marginTop: 8,
  },
  dot: {
    flex: 1,
    height: 4,
    borderRadius: 8,
    backgroundColor: '#E8DDD8',
  },
  dotDone: {
    backgroundColor: '#FF9A5C',
  },
});