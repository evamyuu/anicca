import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useOnboardingStore } from '@/shared/lib/zustand-persist';

/** Step 3 — Cancer type and modality (stub) */
export function InfoStep() {
  const nextStep = useOnboardingStore((s) => s.nextStep);
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#0F0A1A' }}>
      <View className="flex-1 px-6 pt-8">
        <Text className="text-neutral-400 text-sm font-semibold mb-2" style={{ fontFamily: 'Nunito_600SemiBold' }}>ETAPA 3 DE 7</Text>
        <Text className="text-white text-2xl font-extrabold mb-6" style={{ fontFamily: 'Nunito_800ExtraBold' }}>Me conta um pouco sobre você</Text>
        <Text className="text-neutral-400 text-base" style={{ fontFamily: 'Nunito_400Regular' }}>
          [Formulário de tipo de câncer e modalidade — em desenvolvimento]
        </Text>
        <View className="flex-1" />
        <TouchableOpacity
          className="py-4 rounded-2xl items-center mb-4"
          style={{ backgroundColor: '#a855f7' }}
          onPress={() => { nextStep(); router.push('/(onboarding)/step-4-ani-personality'); }}
        >
          <Text className="text-white font-bold text-base" style={{ fontFamily: 'Nunito_700Bold' }}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
