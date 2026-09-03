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
import { BRAND } from '@/shared/constants/brand-colors.const';

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
        {selected && <Check size={14} color={BRAND.SURFACE.CARD} strokeWidth={3} />}
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
    backgroundColor: BRAND.SURFACE.CARD,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingVertical: 13,
    paddingHorizontal: 14,
    marginBottom: 9,
  },
  containerSelected: {
    borderColor: BRAND.SECONDARY.DEFAULT,
    backgroundColor: BRAND.PRIMARY[50],
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
    borderColor: BRAND.PRIMARY[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBoxSelected: {
    backgroundColor: BRAND.SECONDARY.DEFAULT,
    borderColor: BRAND.SECONDARY.DEFAULT,
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    color: BRAND.PRIMARY.DEFAULT,
  },
  labelDisabled: {
    color: BRAND.PRIMARY[400],
  },
});

