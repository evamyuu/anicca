import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export function RegisterPage() {
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#0F0A1A' }}>
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 pt-8">
          <TouchableOpacity onPress={() => router.back()} className="mb-8">
            <Text className="text-primary-400 text-base" style={{ color: '#c084fc', fontFamily: 'Nunito_600SemiBold' }}>
              ← Voltar
            </Text>
          </TouchableOpacity>
          <Text className="text-white text-3xl font-extrabold mb-2" style={{ fontFamily: 'Nunito_800ExtraBold' }}>
            Criar conta
          </Text>
          <Text className="text-neutral-400 text-base mb-8" style={{ fontFamily: 'Nunito_400Regular' }}>
            Você está a um passo de começar sua jornada com a Ani.
          </Text>
          <TouchableOpacity
            className="py-4 rounded-xl items-center"
            style={{ backgroundColor: '#a855f7' }}
            onPress={() => router.replace('/(onboarding)/step-1-welcome')}
            accessibilityRole="button"
          >
            <Text className="text-white font-bold text-base" style={{ fontFamily: 'Nunito_700Bold' }}>
              Começar com WhatsApp
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
