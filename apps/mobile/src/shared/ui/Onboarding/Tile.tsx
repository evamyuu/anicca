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
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  containerSelected: {
    borderColor: '#FF9A5C',
    backgroundColor: '#FFF0E8',
  },
  containerPressed: {
    transform: [{ scale: 0.97 }],
  },
  title: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: '#403229',
  },
  titleSelected: {
    color: '#403229',
  },
  description: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: '#9C8880',
    marginTop: 2,
  },
});

