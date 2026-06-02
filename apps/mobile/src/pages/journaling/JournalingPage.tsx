import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function JournalingPage() {
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#0F0A1A' }}>
      <View className="flex-1 px-6 pt-6 items-center justify-center">
        <Text style={{ fontSize: 48, marginBottom: 12 }}>📓</Text>
        <Text className="text-white text-2xl font-extrabold text-center mb-2" style={{ fontFamily: 'Nunito_800ExtraBold' }}>Diário Emocional</Text>
        <Text className="text-neutral-400 text-base text-center" style={{ fontFamily: 'Nunito_400Regular' }}>
          [Check-in de humor, journaling contextual e exercícios de bem-estar — em desenvolvimento]
        </Text>
      </View>
    </SafeAreaView>
  );
}
