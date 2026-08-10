/**
 * @fileoverview Implementation of CheckCard.
 *
 * @module shared/ui/Onboarding/CheckCardx
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';

interface CheckCardProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export function CheckCard({ label, selected, onPress, disabled }: CheckCardProps) {
  return (
    <Pressable
      onPress={disabled && !selected ? undefined : onPress}
      style={({ pressed }) => [
        styles.container,
        selected && styles.containerSelected,
        pressed && !disabled && styles.containerPressed,
        disabled && !selected && styles.containerDisabled,
      ]}
    >
      <View style={[styles.checkBox, selected && styles.checkBoxSelected]}>
        {selected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
      </View>
      <Text style={[styles.label, disabled && !selected && styles.labelDisabled]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingVertical: 13,
    paddingHorizontal: 14,
    marginBottom: 9,
  },
  containerSelected: {
    borderColor: '#FF9A5C',
    backgroundColor: '#FFF0E8',
  },
  containerPressed: {
    opacity: 0.8,
  },
  containerDisabled: {
    opacity: 0.5,
  },
  checkBox: {
    width: 21,
    height: 21,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E8DDD8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBoxSelected: {
    backgroundColor: '#FF9A5C',
    borderColor: '#FF9A5C',
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    color: '#403229',
  },
  labelDisabled: {
    color: '#9C8880',
  },
});

