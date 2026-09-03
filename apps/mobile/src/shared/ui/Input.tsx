/**
 * @fileoverview Reusable text input component adhering to design system.
 *
 * @module shared/ui/Input
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { BRAND } from '@/shared/constants/brand-colors.const';

export interface InputProps extends TextInputProps {
  /** Label for the input, mapped for accessibility */
  label?: string;
  /** Optional icon to render inside the left side of the input */
  leftIcon?: React.ReactNode;
  /** Error message to display below the input */
  error?: string;
  /** If true, renders a toggleable eye icon for passwords */
  isPassword?: boolean;
  /** Optional style for the input container itself (border, height, etc) */
  containerStyle?: any;
  /** Optional style for the outermost wrapper (margins, etc) */
  wrapperStyle?: any;
}

export function Input({ label, leftIcon, error, isPassword, containerStyle, wrapperStyle, ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={[styles.container, wrapperStyle]}>
      {!!label ? <Text style={styles.label}>{label}</Text> : null}
      
      <View 
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          !!error && styles.inputError,
          containerStyle
        ]}
        accessible={true}
        accessibilityRole="none"
      >
        {!!leftIcon ? <View style={styles.leftIconContainer}>{leftIcon}</View> : null}
        
        <TextInput
          style={styles.input}
          placeholderTextColor={BRAND.PRIMARY[400]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !isPasswordVisible}
          accessibilityLabel={label || props.placeholder}
          {...props}
        />
        
        {isPassword ? (
          <TouchableOpacity 
            style={styles.rightIconContainer}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            accessibilityRole="button"
            accessibilityLabel={isPasswordVisible ? "Hide password" : "Show password"}
          >
            {isPasswordVisible ? (
              <EyeOff size={20} color={BRAND.PRIMARY[400]} />
            ) : (
              <Eye size={20} color={BRAND.PRIMARY[400]} />
            )}
          </TouchableOpacity>
        ) : null}
      </View>
      
      {!!error ? <Text style={styles.errorText} accessibilityRole="alert">{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: BRAND.PRIMARY.DEFAULT,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND.SURFACE.CARD,
    borderWidth: 1,
    borderColor: BRAND.SURFACE.BORDER,
    borderRadius: 24, // Rounder design matching Figma
    height: 52,
    paddingHorizontal: 16,
  },
  inputFocused: {
    borderColor: BRAND.SECONDARY.DEFAULT,
    backgroundColor: BRAND.BG.LIGHT,
  },
  inputError: {
    borderColor: BRAND.ERROR.VIVID,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: BRAND.PRIMARY.DEFAULT,
  },
  leftIconContainer: {
    marginRight: 12,
  },
  rightIconContainer: {
    padding: 4,
    marginLeft: 8,
  },
  errorText: {
    marginTop: 6,
    fontSize: 16,
    color: BRAND.ERROR.VIVID,
    fontFamily: 'Nunito_600SemiBold',
    paddingLeft: 4,
  },
});