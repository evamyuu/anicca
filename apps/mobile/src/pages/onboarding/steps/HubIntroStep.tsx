import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/shared/lib/zustand-persist';

const SUGGESTIONS = [
  { emoji: '📋', label: 'Entender meu laudo', action: '/(tabs)/ani' },
  { emoji: '⚖️', label: 'Conhecer meus direitos', action: '/(tabs)/ani' },
  { emoji: '🗺️', label: 'Registrar sintomas', action: '/body-map' },
  { emoji: '📅', label: 'Ver rotina de hoje', action: '/(tabs)/routine' },
];

/** Step 7 — Hub intro, first suggestions from Ani */
export function HubIntroStep() {
  const signIn = useAuthStore((s) => s.signIn);

  const handleFinish = (destination: string) => {
    // Complete onboarding — mark as authenticated (mock)
    signIn('mock-user-id', 'patient', 'mock-token');
    router.replace(destination as `/${string}`);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#0F0A1A' }}>
      <View className="flex-1 px-6 pt-8">
        <View className="items-center mb-6">
          <Text style={{ fontSize: 48, marginBottom: 8 }}>🎉</Text>
          <Text className="text-white text-2xl font-extrabold text-center" style={{ fontFamily: 'Nunito_800ExtraBold' }}>
            Pronto! Bem-vindo(a){'\n'}ao seu hub
          </Text>
          <Text className="text-neutral-400 text-base text-center mt-2" style={{ fontFamily: 'Nunito_400Regular' }}>
            O que você gostaria de fazer agora?
          </Text>
        </View>

        <View className="gap-3">
          {SUGGESTIONS.map((s) => (
            <TouchableOpacity
              key={s.label}
              onPress={() => handleFinish(s.action)}
              className="flex-row items-center p-4 rounded-2xl"
              style={{ backgroundColor: '#1E1433', borderWidth: 1, borderColor: '#2d2540' }}
              accessibilityRole="button"
            >
              <Text style={{ fontSize: 28, marginRight: 12 }}>{s.emoji}</Text>
              <Text className="text-white font-semibold text-base flex-1" style={{ fontFamily: 'Nunito_600SemiBold' }}>
                {s.label}
              </Text>
              <Text className="text-neutral-500">→</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="flex-1" />
        <TouchableOpacity
          className="py-4 rounded-2xl items-center mb-4"
          style={{ backgroundColor: '#7e22ce' }}
          onPress={() => handleFinish('/(tabs)/hub')}
        >
          <Text className="text-white font-bold text-base" style={{ fontFamily: 'Nunito_700Bold' }}>Ir para o hub →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
