/**
 * @fileoverview Reusable core Button component for the mobile application.
 *
 * @module shared/ui/Button
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { BRAND } from '@/shared/constants/brand-colors.const';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps {
  /** Text or element to display inside the button. */
  children: React.ReactNode;
  /** Visual style variant. @defaultValue 'primary' */
  variant?: ButtonVariant;
  /** Button sizing preset. @defaultValue 'md' */
  size?: ButtonSize;
  /** Whether the button is disabled. */
  disabled?: boolean;
  /** Whether the button is in a loading state (shows a spinner). */
  loading?: boolean;
  /** Callback fired when the button is pressed. */
  onPress?: () => void;
  /** Override container styles. */
  style?: ViewStyle | ViewStyle[];
  /** Override text styles. */
  textStyle?: TextStyle | TextStyle[];
  /** Accessibility label for screen readers. */
  accessibilityLabel?: string;
}

/**
 * Cross-platform, accessible, and themeable Button component.
 *
 * @remarks
 * This should be used as the primary interactive button across the app
 * to ensure visual consistency and accessibility compliance.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onPress,
  style,
  textStyle,
  accessibilityLabel,
}: ButtonProps) {
  const isIcon = size === 'icon';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.base,
        styles[`${variant}Variant`],
        styles[`${size}Size`],
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? BRAND.PRIMARY.DEFAULT : '#FFFFFF'}
        />
      ) : (
        <Text
          style={[
            styles.textBase,
            styles[`${variant}Text`],
            isIcon && styles.iconText,
            textStyle,
          ]}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },
  // ─── Variants ───
  primaryVariant: {
    backgroundColor: BRAND.PRIMARY.DEFAULT,
  },
  secondaryVariant: {
    backgroundColor: BRAND.SECONDARY.DEFAULT,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  outlineVariant: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: BRAND.PRIMARY.DEFAULT,
  },
  ghostVariant: {
    backgroundColor: 'transparent',
  },
  // ─── Sizes ───
  smSize: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 44,
  },
  mdSize: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    minHeight: 48,
  },
  lgSize: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    minHeight: 56,
  },
  iconSize: {
    width: 64,
    height: 64,
    borderRadius: 32,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  disabled: {
    opacity: 0.5,
  },
  // ─── Text Styles ───
  textBase: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: BRAND.PRIMARY.DEFAULT,
  },
  ghostText: {
    color: BRAND.PRIMARY.DEFAULT,
  },
  iconText: {
    fontSize: 26,
    lineHeight: 30, // Adjusts arrow centering
    marginLeft: 2,  // Slight optical adjustment for arrows
  },
});
