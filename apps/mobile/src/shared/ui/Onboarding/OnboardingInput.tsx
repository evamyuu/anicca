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
        placeholderTextColor="#9C8880"
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
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'Nunito_700Bold',
    color: '#9C8880',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginBottom: 9,
  },
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E8DDD8',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    color: '#403229',
  },
  inputFocused: {
    borderColor: '#FF9A5C',
  },
  hint: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: '#9C8880',
    lineHeight: 16,
    marginTop: 4,
    paddingHorizontal: 2,
  }
});
