import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useOnboardingStore } from '@/shared/lib/zustand-persist';

/** Step 5 — Avatar customization (stub) */
export function AvatarStep() {
  const nextStep = useOnboardingStore((s) => s.nextStep);
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#0F0A1A' }}>
      <View className="flex-1 px-6 pt-8">
        <Text className="text-neutral-400 text-sm font-semibold mb-2" style={{ fontFamily: 'Nunito_600SemiBold' }}>ETAPA 5 DE 7</Text>
        <Text className="text-white text-2xl font-extrabold mb-6" style={{ fontFamily: 'Nunito_800ExtraBold' }}>Personalize seu avatar</Text>
        <View className="items-center justify-center flex-1">
          <Text style={{ fontSize: 80 }}>🐱</Text>
          <Text className="text-neutral-400 text-base text-center mt-4" style={{ fontFamily: 'Nunito_400Regular' }}>
            [Seletor de tom de pele, cabelo, expressão e acessório médico — em desenvolvimento]
          </Text>
        </View>
        <TouchableOpacity
          className="py-4 rounded-2xl items-center mb-4"
          style={{ backgroundColor: '#a855f7' }}
          onPress={() => { nextStep(); router.push('/(onboarding)/step-6-permissions'); }}
        >
          <Text className="text-white font-bold text-base" style={{ fontFamily: 'Nunito_700Bold' }}>Continuar</Text>
        </TouchableOpacity>
        <TouchableOpacity className="py-2 items-center mb-4" onPress={() => { nextStep(); router.push('/(onboarding)/step-6-permissions'); }}>
          <Text className="text-neutral-500 text-sm" style={{ fontFamily: 'Nunito_400Regular' }}>Pular por enquanto</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
