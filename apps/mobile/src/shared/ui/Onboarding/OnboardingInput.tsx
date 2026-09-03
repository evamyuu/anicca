/**
 * @fileoverview Implementation of OnboardingInput.
 *
 * @module shared/ui/Onboarding/OnboardingInputx
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { BRAND } from '@/shared/constants/brand-colors.const';

interface OnboardingInputProps extends TextInputProps {
  label?: string;
  hint?: string;
}

export function OnboardingInput({ label, hint, style, ...props }: OnboardingInputProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          style
        ]}
        placeholderTextColor={BRAND.PRIMARY[400]}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
      />
      {hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'Nunito_700Bold',
    color: BRAND.PRIMARY[400],
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginBottom: 9,
  },
  input: {
    width: '100%',
    backgroundColor: BRAND.SURFACE.CARD,
    borderWidth: 2,
    borderColor: BRAND.PRIMARY[200],
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    color: BRAND.PRIMARY.DEFAULT,
  },
  inputFocused: {
    borderColor: BRAND.SECONDARY.DEFAULT,
  },
  hint: {
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    color: BRAND.PRIMARY[400],
    lineHeight: 16,
    marginTop: 4,
    paddingHorizontal: 2,
  }
});
