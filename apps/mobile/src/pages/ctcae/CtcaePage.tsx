import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function CtcaePage() {
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#0F0A1A' }}>
      <View className="flex-1 px-6 pt-6">
        <Text className="text-white text-2xl font-extrabold mb-2" style={{ fontFamily: 'Nunito_800ExtraBold' }}>Sintomas CTCAE</Text>
        <Text className="text-neutral-400 text-sm" style={{ fontFamily: 'Nunito_400Regular' }}>Classificação de Efeitos Adversos (NCI CTCAE v5.0)</Text>
        <View className="flex-1 items-center justify-center">
          <Text className="text-neutral-500 text-base text-center" style={{ fontFamily: 'Nunito_400Regular' }}>
            [7 sintomas CTCAE com seletor de grau — em desenvolvimento]
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
