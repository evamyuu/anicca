import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, BrainCircuit } from 'lucide-react-native';
import { useOnboardingStore } from '@/shared/lib/zustand-persist';
import { BRAND } from '@/shared/constants/brand-colors.const';
import type { AniPersonality } from '@anicca/types';

export default function AniSettingsScreen() {
  const router = useRouter();
  const { aniPersonality, setAniPersonality } = useOnboardingStore();

  const bgColor = BRAND.BG.LIGHT;
  const textColor = 'text-neutral-900';
  const subtextColor = 'text-neutral-600';
  const cardBgColor = BRAND.SURFACE.CARD;
  const borderColor = BRAND.SURFACE.BORDER;

  const personalities: { id: AniPersonality; label: string; desc: string }[] = [
    { id: 'mentor', label: 'Mentora (Empática)', desc: 'Acolhedora e focada no suporte emocional.' },
    { id: 'realist', label: 'Realista (Direta)', desc: 'Objetiva, focada apenas em fatos médicos.' },
    { id: 'optimist', label: 'Otimista (Lúdica)', desc: 'Leve e descontraída, usa analogias.' },
    { id: 'specialist', label: 'Especialista', desc: 'Focada em aprofundar termos técnicos e artigos.' },
  ];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: bgColor }}>
      <View
        className="flex-row items-center px-4 py-3"
        style={{ borderBottomWidth: 1, borderBottomColor: borderColor }}
      >
        <TouchableOpacity onPress={() => router.back()} hitSlop={10} style={{ padding: 8 }}>
          <ArrowLeft size={24} color={BRAND.PRIMARY[400]} />
        </TouchableOpacity>
        <Text
          className={`${textColor} font-bold text-lg ml-2`}
          style={{ fontFamily: 'Nunito_700Bold' }}
        >
          Configurações da Ani
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        <Text
          className={`${textColor} text-lg font-bold mb-4`}
          style={{ fontFamily: 'Nunito_700Bold' }}
        >
          Personalidade
        </Text>
        
        {personalities.map((p) => {
          const isSelected = aniPersonality === p.id;
          return (
            <TouchableOpacity
              key={p.id}
              onPress={() => setAniPersonality(p.id)}
              className="mb-3 p-4 rounded-xl flex-row items-center"
              style={{
                backgroundColor: isSelected ? BRAND.PRIMARY[700] : cardBgColor,
                borderWidth: 1,
                borderColor: isSelected ? BRAND.SECONDARY.DEFAULT : borderColor,
              }}
            >
              <View className="flex-1">
                <Text
                  className={`${isSelected ? 'text-white' : textColor} font-bold text-base mb-1`}
                  style={{ fontFamily: 'Nunito_700Bold' }}
                >
                  {p.label}
                </Text>
                <Text
                  className={isSelected ? 'text-neutral-300' : subtextColor}
                  style={{ fontFamily: 'Nunito_400Regular' }}
                >
                  {p.desc}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <Text
          className={`${textColor} text-lg font-bold mt-6 mb-4`}
          style={{ fontFamily: 'Nunito_700Bold' }}
        >
          Memória da Inteligência Artificial
        </Text>
        
        <TouchableOpacity
          onPress={() => alert('Em breve: Gerenciamento de Memória da IA!')}
          className="p-4 rounded-xl flex-row items-center"
          style={{ backgroundColor: cardBgColor, borderWidth: 1, borderColor }}
        >
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: BRAND.PRIMARY[100] }}
          >
            <BrainCircuit size={20} color={BRAND.PRIMARY[800]} />
          </View>
          <View className="flex-1">
            <Text
              className={`${textColor} font-bold text-base`}
              style={{ fontFamily: 'Nunito_700Bold' }}
            >
              Gerenciar Memória
            </Text>
            <Text
              className={`${subtextColor} text-sm mt-1`}
              style={{ fontFamily: 'Nunito_400Regular' }}
            >
              Edite ou apague fatos que a Ani aprendeu sobre você.
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
