/**
 * @fileoverview Reusable selectable card component for lists and grids.
 *
 * @module shared/ui/SelectionCard
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BRAND } from '@/shared/constants/brand-colors.const';

export interface SelectionCardProps {
  /** The primary label of the card. */
  title: string;
  /** An optional description below the title. */
  description?: string;
  /** An emoji or short string to render as an icon on the left. */
  icon?: string;
  /** Whether the card is currently selected. */
  isSelected: boolean;
  /** Callback fired when the card is pressed. */
  onPress: () => void;
  /** Accessibility label. Defaults to title + description. */
  accessibilityLabel?: string;
}

/**
 * A selectable card component used in lists (e.g. choosing a profile type,
 * selecting a symptom severity).
 */
export function SelectionCard({
  title,
  description,
  icon,
  isSelected,
  onPress,
  accessibilityLabel,
}: SelectionCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={accessibilityLabel || `${title}. ${description || ''}`}
      style={[
        styles.card,
        isSelected ? styles.cardSelected : styles.cardUnselected,
      ]}
    >
      <View style={styles.contentRow}>
        {icon && (
          <Text style={styles.icon}>{icon}</Text>
        )}
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              isSelected ? styles.titleSelected : styles.titleUnselected,
            ]}
          >
            {title}
          </Text>
          {description && (
            <Text
              style={[
                styles.description,
                isSelected ? styles.descriptionSelected : styles.descriptionUnselected,
              ]}
            >
              {description}
            </Text>
          )}
        </View>
        <View
          style={[
            styles.radioCircle,
            isSelected ? styles.radioSelected : styles.radioUnselected,
          ]}
        >
          {isSelected && <View style={styles.radioInner} />}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  cardUnselected: {
    backgroundColor: BRAND.SURFACE.CARD,
    borderColor: 'transparent',
  },
  cardSelected: {
    backgroundColor: BRAND.PRIMARY[50],
    borderColor: BRAND.SECONDARY.DEFAULT,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 32,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    marginBottom: 4,
  },
  titleUnselected: {
    color: BRAND.PRIMARY.DEFAULT,
  },
  titleSelected: {
    color: BRAND.PRIMARY.DEFAULT,
  },
  description: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  descriptionUnselected: {
    color: BRAND.PRIMARY[600],
  },
  descriptionSelected: {
    color: BRAND.PRIMARY[800],
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioUnselected: {
    borderColor: BRAND.SURFACE.BORDER,
    backgroundColor: 'transparent',
  },
  radioSelected: {
    borderColor: BRAND.SECONDARY.DEFAULT,
    backgroundColor: 'transparent',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: BRAND.SECONDARY.DEFAULT,
  },
});
