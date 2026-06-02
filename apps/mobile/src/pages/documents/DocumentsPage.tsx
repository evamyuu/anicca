import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─────────────────────────────────────────────────────────────────────────────
// DocumentsPage — FSD: pages/documents
// Medical document library — upload, view, share with doctor
// ─────────────────────────────────────────────────────────────────────────────

export function DocumentsPage() {
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#0F0A1A' }}>
      {/* Header */}
      <View className="px-5 pt-4 pb-4" style={{ borderBottomWidth: 1, borderBottomColor: '#2d2540' }}>
        <Text className="text-white text-2xl font-extrabold" style={{ fontFamily: 'Nunito_800ExtraBold' }}>
          Documentos
        </Text>
        <Text className="text-neutral-400 text-sm mt-1" style={{ fontFamily: 'Nunito_400Regular' }}>
          Laudos, exames e prescrições
        </Text>
      </View>

      {/* Empty state */}
      <View className="flex-1 items-center justify-center px-8">
        <Text style={{ fontSize: 48, marginBottom: 16 }}>📄</Text>
        <Text className="text-white text-lg font-bold text-center mb-2" style={{ fontFamily: 'Nunito_700Bold' }}>
          Nenhum documento ainda
        </Text>
        <Text className="text-neutral-400 text-center text-base leading-6 mb-8" style={{ fontFamily: 'Nunito_400Regular' }}>
          Adicione laudos e exames para que a Ani possa ajudá-lo(a) a entendê-los.
        </Text>
        <TouchableOpacity
          className="py-3 px-6 rounded-2xl"
          style={{ backgroundColor: '#a855f7' }}
          accessibilityRole="button"
          accessibilityLabel="Adicionar documento"
        >
          <Text className="text-white font-bold" style={{ fontFamily: 'Nunito_700Bold' }}>
            + Adicionar Documento
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
