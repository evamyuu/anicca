/**
 * @fileoverview Implementation of RoutinePage.
 *
 * @module pages/routine/RoutinePagex
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BRAND } from '@/shared/constants/brand-colors.const';


export function RoutinePage() {
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: BRAND.BG.DARK }}>
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
        <View className="mx-4 mt-4 p-4 rounded-2xl" style={{ backgroundColor: BRAND.SURFACE.CARD_DARK, borderWidth: 1, borderColor: BRAND.SURFACE.BORDER_DARK }}>
          <Text className="text-neutral-400 text-xs font-semibold mb-3" style={{ fontFamily: 'Nunito_600SemiBold', textTransform: 'uppercase' }}>
            🌡️ Temperatura
          </Text>
          <Text className="text-neutral-500 text-sm" style={{ fontFamily: 'Nunito_400Regular' }}>
            Nenhum registro de hoje ainda.{'\n'}
            Toque para registrar sua temperatura.
          </Text>
        </View>

        {/* Medication Card */}
        <View className="mx-4 mt-3 p-4 rounded-2xl" style={{ backgroundColor: BRAND.SURFACE.CARD_DARK, borderWidth: 1, borderColor: BRAND.SURFACE.BORDER_DARK }}>
          <Text className="text-neutral-400 text-xs font-semibold mb-3" style={{ fontFamily: 'Nunito_600SemiBold', textTransform: 'uppercase' }}>
            💊 Medicamentos
          </Text>
          <Text className="text-neutral-500 text-sm" style={{ fontFamily: 'Nunito_400Regular' }}>
            Carregando sua rotina de medicamentos...
          </Text>
        </View>

        {/* Hydration Card */}
        <View className="mx-4 mt-3 p-4 rounded-2xl" style={{ backgroundColor: BRAND.SURFACE.CARD_DARK, borderWidth: 1, borderColor: BRAND.SURFACE.BORDER_DARK }}>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-neutral-400 text-xs font-semibold" style={{ fontFamily: 'Nunito_600SemiBold', textTransform: 'uppercase' }}>
              💧 Hidratação
            </Text>
            <Text className="text-white text-sm font-semibold" style={{ fontFamily: 'Nunito_600SemiBold' }}>
              3 de 8 copos
            </Text>
          </View>
          {/* Progress bar */}
          <View className="h-2 rounded-full" style={{ backgroundColor: BRAND.SURFACE.BORDER_DARK }}>
            <View className="h-2 rounded-full" style={{ width: '37.5%', backgroundColor: BRAND.AUX.PURPLE }} />
          </View>
        </View>

        {/* Sleep Card */}
        <View className="mx-4 mt-3 p-4 rounded-2xl" style={{ backgroundColor: BRAND.SURFACE.CARD_DARK, borderWidth: 1, borderColor: BRAND.SURFACE.BORDER_DARK }}>
          <Text className="text-neutral-400 text-xs font-semibold mb-3" style={{ fontFamily: 'Nunito_600SemiBold', textTransform: 'uppercase' }}>
            😴 Sono
          </Text>
          <Text className="text-neutral-500 text-sm" style={{ fontFamily: 'Nunito_400Regular' }}>
            Nenhum registro de sono para hoje.
          </Text>
        </View>

        {/* Symptoms CTA */}
        <View className="mx-4 mt-3 p-4 rounded-2xl" style={{ backgroundColor: BRAND.AUX.PURPLE, borderWidth: 1, borderColor: BRAND.AUX.PURPLE }}>
          <Text className="text-white font-semibold text-base mb-1" style={{ fontFamily: 'Nunito_600SemiBold' }}>
            Como você está se sentindo?
          </Text>
          <Text className="text-primary-300 text-sm" style={{ fontFamily: 'Nunito_400Regular', color: BRAND.AUX.PURPLE }}>
            Registre sintomas no Body Map ou CTCAE
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}