import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

// ─────────────────────────────────────────────────────────────────────────────
// LoginPage — FSD: pages/auth
// ─────────────────────────────────────────────────────────────────────────────

export function LoginPage() {
  const [phone, setPhone] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async () => {
    if (!phone.trim()) return;
    setIsLoading(true);
    // TODO: call auth API
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/(onboarding)/step-1-welcome');
    }, 1000);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#0F0A1A' }}>
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
              style={{ backgroundColor: '#1E1433', borderWidth: 1, borderColor: '#2d2540', height: 52 }}
            >
              <Text className="text-neutral-400 mr-2" style={{ fontFamily: 'Nunito_400Regular' }}>
                🇧🇷 +55
              </Text>
              <TextInput
                className="flex-1 text-white text-base"
                style={{ fontFamily: 'Nunito_400Regular' }}
                placeholder="(11) 99999-9999"
                placeholderTextColor="#8f86a0"
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
              style={{ backgroundColor: phone.trim() ? '#a855f7' : '#2d2540' }}
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
              <Text className="text-primary-400 text-sm font-semibold" style={{ fontFamily: 'Nunito_600SemiBold', color: '#c084fc' }}>
                Criar conta
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
