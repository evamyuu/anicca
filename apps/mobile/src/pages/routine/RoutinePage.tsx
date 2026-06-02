import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─────────────────────────────────────────────────────────────────────────────
// RoutinePage — FSD: pages/routine
// Today's routine: temperature, medication, hydration, sleep, symptoms CTA
// ─────────────────────────────────────────────────────────────────────────────

export function RoutinePage() {
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#0F0A1A' }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <Text
            className="text-white text-2xl font-extrabold"
            style={{ fontFamily: 'Nunito_800ExtraBold' }}
          >
            Rotina de Hoje
          </Text>
          <Text
            className="text-neutral-400 text-sm mt-1"
            style={{ fontFamily: 'Nunito_400Regular' }}
          >
            Quinta-feira, 29 de maio
          </Text>
        </View>

        {/* Temperature Card */}
        <View className="mx-4 mt-4 p-4 rounded-2xl" style={{ backgroundColor: '#1E1433', borderWidth: 1, borderColor: '#2d2540' }}>
          <Text className="text-neutral-400 text-xs font-semibold mb-3" style={{ fontFamily: 'Nunito_600SemiBold', textTransform: 'uppercase' }}>
            🌡️ Temperatura
          </Text>
          <Text className="text-neutral-500 text-sm" style={{ fontFamily: 'Nunito_400Regular' }}>
            Nenhum registro de hoje ainda.{'\n'}
            Toque para registrar sua temperatura.
          </Text>
        </View>

        {/* Medication Card */}
        <View className="mx-4 mt-3 p-4 rounded-2xl" style={{ backgroundColor: '#1E1433', borderWidth: 1, borderColor: '#2d2540' }}>
          <Text className="text-neutral-400 text-xs font-semibold mb-3" style={{ fontFamily: 'Nunito_600SemiBold', textTransform: 'uppercase' }}>
            💊 Medicamentos
          </Text>
          <Text className="text-neutral-500 text-sm" style={{ fontFamily: 'Nunito_400Regular' }}>
            Carregando sua rotina de medicamentos...
          </Text>
        </View>

        {/* Hydration Card */}
        <View className="mx-4 mt-3 p-4 rounded-2xl" style={{ backgroundColor: '#1E1433', borderWidth: 1, borderColor: '#2d2540' }}>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-neutral-400 text-xs font-semibold" style={{ fontFamily: 'Nunito_600SemiBold', textTransform: 'uppercase' }}>
              💧 Hidratação
            </Text>
            <Text className="text-white text-sm font-semibold" style={{ fontFamily: 'Nunito_600SemiBold' }}>
              3 de 8 copos
            </Text>
          </View>
          {/* Progress bar */}
          <View className="h-2 rounded-full" style={{ backgroundColor: '#2d2540' }}>
            <View className="h-2 rounded-full" style={{ width: '37.5%', backgroundColor: '#a855f7' }} />
          </View>
        </View>

        {/* Sleep Card */}
        <View className="mx-4 mt-3 p-4 rounded-2xl" style={{ backgroundColor: '#1E1433', borderWidth: 1, borderColor: '#2d2540' }}>
          <Text className="text-neutral-400 text-xs font-semibold mb-3" style={{ fontFamily: 'Nunito_600SemiBold', textTransform: 'uppercase' }}>
            😴 Sono
          </Text>
          <Text className="text-neutral-500 text-sm" style={{ fontFamily: 'Nunito_400Regular' }}>
            Nenhum registro de sono para hoje.
          </Text>
        </View>

        {/* Symptoms CTA */}
        <View className="mx-4 mt-3 p-4 rounded-2xl" style={{ backgroundColor: '#3b0764', borderWidth: 1, borderColor: '#7e22ce' }}>
          <Text className="text-white font-semibold text-base mb-1" style={{ fontFamily: 'Nunito_600SemiBold' }}>
            Como você está se sentindo?
          </Text>
          <Text className="text-primary-300 text-sm" style={{ fontFamily: 'Nunito_400Regular', color: '#d8b4fe' }}>
            Registre sintomas no Body Map ou CTCAE
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
