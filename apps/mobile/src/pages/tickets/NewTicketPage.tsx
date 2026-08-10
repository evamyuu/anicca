/**
 * @fileoverview Implementation of NewTicketPage.
 *
 * @module pages/tickets/NewTicketPagex
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function NewTicketPage() {
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#0F0A1A' }}>
      <View className="flex-1 px-6 pt-6">
        <Text className="text-white text-2xl font-extrabold mb-2" style={{ fontFamily: 'Nunito_800ExtraBold' }}>Abrir Chamado</Text>
        <Text className="text-neutral-400 text-sm" style={{ fontFamily: 'Nunito_400Regular' }}>
          [Seletor de tipo + descrição + canal de encaminhamento — em desenvolvimento]
        </Text>
      </View>
    </SafeAreaView>
  );
}