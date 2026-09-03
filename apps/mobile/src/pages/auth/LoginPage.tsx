/**
 * @fileoverview Implementation of LoginPage.
 *
 * @module pages/auth/LoginPagex
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { BRAND } from '@/shared/constants/brand-colors.const';
import { useAuthStore } from '@/shared/lib/zustand-persist';

export function LoginPage() {
  const [phone, setPhone] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const signIn = useAuthStore((s) => s.signIn);

  const handleLogin = async () => {
    if (!phone.trim()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      signIn('8bfc7103-b7ca-4fde-ac74-c155d6cff8d0', 'patient', 'mock-token');
      router.replace('/(tabs)/home');
    }, 1000);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: BRAND.BG.DARK }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-16 pb-8">
          {/* Logo / Ani */}
          <View className="items-center mb-12">
            <Text style={{ fontSize: 72, marginBottom: 16 }}>🐱</Text>
            <Text
              className="text-white text-3xl font-extrabold"
              style={{ fontFamily: 'Nunito_800ExtraBold' }}
            >
              Anicca
            </Text>
            <Text
              className="text-neutral-400 text-base text-center mt-2"
              style={{ fontFamily: 'Nunito_400Regular' }}
            >
              Navegando com você na jornada{'\n'}contra o câncer
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            <Text
              className="text-white text-lg font-semibold mb-2"
              style={{ fontFamily: 'Nunito_600SemiBold' }}
            >
              Entrar com seu número
            </Text>
            <View
              className="flex-row items-center rounded-xl px-4"
              style={{ backgroundColor: BRAND.SURFACE.CARD_DARK, borderWidth: 1, borderColor: BRAND.SURFACE.BORDER_DARK, height: 52 }}
            >
              <Text className="text-neutral-400 mr-2" style={{ fontFamily: 'Nunito_400Regular' }}>
                🇧🇷 +55
              </Text>
              <TextInput
                className="flex-1 text-white text-base"
                style={{ fontFamily: 'Nunito_400Regular' }}
                placeholder="(11) 99999-9999"
                placeholderTextColor={BRAND.PRIMARY[400]}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoComplete="tel"
                accessibilityLabel="Número de celular"
              />
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading || !phone.trim()}
              className="py-4 rounded-xl items-center mt-4"
              style={{ backgroundColor: phone.trim() ? BRAND.AUX.PURPLE : BRAND.SURFACE.BORDER_DARK }}
              accessibilityRole="button"
              accessibilityLabel="Entrar"
              accessibilityState={{ disabled: isLoading || !phone.trim() }}
            >
              <Text
                className="text-white font-bold text-base"
                style={{ fontFamily: 'Nunito_700Bold' }}
              >
                {isLoading ? 'Enviando código...' : 'Continuar'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-neutral-500 text-sm" style={{ fontFamily: 'Nunito_400Regular' }}>
              Não tem conta?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text className="text-primary-400 text-sm font-semibold" style={{ fontFamily: 'Nunito_600SemiBold', color: BRAND.PRIMARY[200] }}>
                Criar conta
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}