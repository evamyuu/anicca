import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useOnboardingStore } from '@/shared/lib/zustand-persist';
import type { AniPersonality } from '@anicca/types';

const PERSONALITIES: Array<{ type: AniPersonality; name: string; emoji: string; desc: string; example: string }> = [
  { type: 'mentor', name: 'Mentora', emoji: '🌟', desc: 'Encorajadora e empática. Celebra cada passo.', example: '"Você está indo muito bem! Cada dia conta."' },
  { type: 'realist', name: 'Realista', emoji: '🎯', desc: 'Direta e honesta. Informações claras.', example: '"Aqui está o que você precisa saber."' },
  { type: 'optimist', name: 'Otimista', emoji: '🌈', desc: 'Positiva e esperançosa. Foca no que você controla.', example: '"Hoje é um novo começo. Você consegue!"' },
  { type: 'specialist', name: 'Especialista', emoji: '🔬', desc: 'Técnica e detalhada. Informações completas.', example: '"Segundo o INCA, o protocolo indica..."' },
];

/** Onboarding Step 4 — Ani personality selection */
export function AniPersonalityStep() {
  const setAniPersonality = useOnboardingStore((s) => s.setAniPersonality);
  const nextStep = useOnboardingStore((s) => s.nextStep);
  const [selected, setSelected] = React.useState<AniPersonality | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    setAniPersonality(selected);
    nextStep();
    router.push('/(onboarding)/step-5-avatar');
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#0F0A1A' }}>
      <View className="flex-1 px-6 pt-8">
        <Text className="text-neutral-400 text-sm font-semibold mb-2" style={{ fontFamily: 'Nunito_600SemiBold' }}>ETAPA 4 DE 7</Text>
        <Text className="text-white text-2xl font-extrabold mb-2" style={{ fontFamily: 'Nunito_800ExtraBold' }}>
          Como você quer que eu seja?
        </Text>
        <Text className="text-neutral-400 text-sm mb-6" style={{ fontFamily: 'Nunito_400Regular' }}>
          Você pode mudar isso a qualquer momento nas configurações.
        </Text>

        <View className="gap-3">
          {PERSONALITIES.map((p) => (
            <TouchableOpacity
              key={p.type}
              onPress={() => setSelected(p.type)}
              className="p-4 rounded-2xl"
              style={{
                backgroundColor: selected === p.type ? '#3b0764' : '#1E1433',
                borderWidth: 2,
                borderColor: selected === p.type ? '#a855f7' : '#2d2540',
              }}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected === p.type }}
            >
              <View className="flex-row items-start">
                <Text style={{ fontSize: 24, marginRight: 12, marginTop: 2 }}>{p.emoji}</Text>
                <View className="flex-1">
                  <Text className="text-white font-bold text-base" style={{ fontFamily: 'Nunito_700Bold' }}>{p.name}</Text>
                  <Text className="text-neutral-400 text-sm mt-1" style={{ fontFamily: 'Nunito_400Regular' }}>{p.desc}</Text>
                  <Text className="text-primary-300 text-sm mt-2 italic" style={{ fontFamily: 'Nunito_400Regular', color: '#d8b4fe' }}>{p.example}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View className="flex-1" />
        <TouchableOpacity
          onPress={handleContinue}
          disabled={!selected}
          className="py-4 rounded-2xl items-center mb-4"
          style={{ backgroundColor: selected ? '#a855f7' : '#2d2540' }}
        >
          <Text className="text-white font-bold text-base" style={{ fontFamily: 'Nunito_700Bold' }}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
