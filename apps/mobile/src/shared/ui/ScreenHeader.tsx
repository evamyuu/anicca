/**
 * @fileoverview Standard screen header (back chevron, title, subtitle, optional action)
 * following the Body Map header in Figma.
 *
 * @module shared/ui/ScreenHeader
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { BRAND } from '@/shared/constants/brand-colors.const';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onBack?: () => void;
}

export function ScreenHeader({ title, subtitle, right, onBack }: ScreenHeaderProps) {
  const router = useRouter();
  const goBack = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/(tabs)')));

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={goBack} style={styles.back} accessibilityRole="button" accessibilityLabel="Voltar">
        <MaterialIcons name="chevron-left" size={22} color={BRAND.WARM.TEXT_MUTED} />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  back: {
    paddingVertical: 4,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 20,
    lineHeight: 30,
    color: BRAND.PRIMARY.DEFAULT,
  },
  subtitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    lineHeight: 16.5,
    color: BRAND.WARM.GREY,
  },
});
