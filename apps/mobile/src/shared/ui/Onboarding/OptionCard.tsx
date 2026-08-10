/**
 * @fileoverview Implementation of OptionCard.
 *
 * @module shared/ui/Onboarding/OptionCardx
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface OptionCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  selected: boolean;
  onPress: () => void;
  size?: 'normal' | 'small';
}

export function OptionCard({
  title,
  description,
  icon,
  badge,
  selected,
  onPress,
  size = 'normal'
}: OptionCardProps) {
  const isSmall = size === 'small';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        isSmall && styles.containerSmall,
        selected && styles.containerSelected,
        pressed && styles.containerPressed,
      ]}
    >
      <View style={[styles.blob, selected && styles.blobSelected]} />

      {icon && (
        <View style={[styles.iconContainer, selected && styles.iconContainerSelected]}>
          {icon}
        </View>
      )}

      <View style={styles.textContainer}>
        <Text style={[styles.title, isSmall && styles.titleSmall]}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
        {badge && <View style={styles.badgeContainer}>{badge}</View>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingVertical: 15,
    paddingHorizontal: 14,
    marginBottom: 10,
    overflow: 'hidden',
  },
  containerSmall: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 13,
    marginBottom: 9,
  },
  containerSelected: {
    borderColor: '#FF9A5C',
    backgroundColor: '#FFF0E8',
  },
  containerPressed: {
    transform: [{ scale: 0.98 }],
  },
  blob: {
    position: 'absolute',
    right: -14,
    top: -10,
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FF9A5C',
    opacity: 0.07,
  },
  blobSelected: {
    opacity: 0.16,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 11,
    backgroundColor: '#F0E9E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerSelected: {
    backgroundColor: '#FF9A5C',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: '#403229',
  },
  titleSmall: {
    fontSize: 13.5,
  },
  description: {
    fontSize: 14,
    color: '#9C8880',
    marginTop: 2,
    lineHeight: 18,
    fontFamily: 'Nunito_400Regular',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F0E9E5',
    borderRadius: 20,
    paddingVertical: 2,
    paddingHorizontal: 9,
    marginTop: 5,
    alignSelf: 'flex-start',
  },
});
