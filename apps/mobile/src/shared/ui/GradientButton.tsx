/**
 * @fileoverview Implementation of GradientButton.
 *
 * @module shared/ui/GradientButtonx
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export interface GradientButtonProps {
  title: string;
  onPress: () => void;
  colors: [string, string, ...string[]];
  textColor?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export function GradientButton({
  title,
  onPress,
  colors,
  textColor = '#ffffff',
  style,
  textStyle,
  disabled = false,
}: GradientButtonProps) {
  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      onPress={onPress} 
      disabled={disabled}
      style={[styles.container, style, disabled && styles.disabled]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }} // Horizontal gradient from 0% to 100% as requested
        style={styles.gradient}
      >
        <Text style={[styles.text, { color: textColor }, textStyle]}>
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 41,
    width: '100%',
    borderRadius: 24, // Rounded pill shape
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.6,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  text: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    letterSpacing: 0,
  },
});