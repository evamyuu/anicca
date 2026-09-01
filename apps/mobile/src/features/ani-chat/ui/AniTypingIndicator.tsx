/**
 * @fileoverview Implementation of AniTypingIndicator.
 *
 * @module features/ani-chat/ui/AniTypingIndicatorx
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React from 'react';
import { View, Text } from 'react-native';
import { BRAND } from '@/shared/constants/brand-colors.const';

export function AniTypingIndicator() {
  return (
    <View className="flex-row items-center px-4 mb-4" accessibilityLabel="Ani está digitando">
      <View
        className="w-8 h-8 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: BRAND.SURFACE.CARD, borderWidth: 1.5, borderColor: BRAND.AUX.PURPLE }}
      >
        <Text style={{ fontSize: 16 }}>🐱</Text>
      </View>
      <View
        className="rounded-2xl rounded-tl-sm px-4 py-3"
        style={{ backgroundColor: BRAND.SURFACE.CARD, borderWidth: 1, borderColor: BRAND.SURFACE.BORDER }}
      >
        <Text
          style={{ fontFamily: 'Nunito_400Regular', color: BRAND.PRIMARY[400] }}
        >
          Ani está pensando...
        </Text>
      </View>
    </View>
  );
}