import React from 'react';
import { View, Text } from 'react-native';

// ─────────────────────────────────────────────────────────────────────────────
// AniTypingIndicator — Feature UI
// Shows "Ani está digitando..." with animated dots
// ─────────────────────────────────────────────────────────────────────────────

export function AniTypingIndicator() {
  return (
    <View className="flex-row items-center px-4 mb-4" accessibilityLabel="Ani está digitando">
      <View
        className="w-8 h-8 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: '#1E1433', borderWidth: 1.5, borderColor: '#a855f7' }}
      >
        <Text style={{ fontSize: 16 }}>🐱</Text>
      </View>
      <View
        className="rounded-2xl rounded-tl-sm px-4 py-3"
        style={{ backgroundColor: '#1E1433', borderWidth: 1, borderColor: '#2d2540' }}
      >
        <Text
          className="text-neutral-400 text-sm"
          style={{ fontFamily: 'Nunito_400Regular' }}
        >
          Ani está pensando...
        </Text>
      </View>
    </View>
  );
}
