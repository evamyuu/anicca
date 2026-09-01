/**
 * @fileoverview Implementation of Tile.
 *
 * @module shared/ui/Onboarding/Tilex
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BRAND } from '@/shared/constants/brand-colors.const';

interface TileProps {
  title: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
}

export function Tile({ title, description, selected, onPress }: TileProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        selected && styles.containerSelected,
        pressed && styles.containerPressed,
      ]}
    >
      <Text style={[styles.title, selected && styles.titleSelected]}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Will stretch in a flex row
    backgroundColor: BRAND.SURFACE.CARD,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  containerSelected: {
    borderColor: BRAND.SECONDARY.DEFAULT,
    backgroundColor: BRAND.PRIMARY[50],
  },
  containerPressed: {
    transform: [{ scale: 0.97 }],
  },
  title: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: BRAND.PRIMARY.DEFAULT,
  },
  titleSelected: {
    color: BRAND.PRIMARY.DEFAULT,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    color: BRAND.PRIMARY[400],
    marginTop: 2,
  },
});

