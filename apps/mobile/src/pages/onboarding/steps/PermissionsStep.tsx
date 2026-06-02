import React from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useOnboardingStore } from '@/shared/lib/zustand-persist';

const PERMISSIONS = [
  { key: 'notifications' as const, emoji: '🔔', label: 'Notificações', desc: 'Lembretes de medicamentos e consultas' },
  { key: 'camera' as const, emoji: '📷', label: 'Câmera', desc: 'Para fotografar laudos e exames' },
  { key: 'calendar' as const, emoji: '📅', label: 'Calendário', desc: 'Para registrar consultas e ciclos' },
];

/** Step 6 — Permissions and LGPD consent */
export function PermissionsStep() {
  const setConsent = useOnboardingStore((s) => s.setConsent);
  const nextStep = useOnboardingStore((s) => s.nextStep);
  const [consents, setConsents] = React.useState({ notifications: false, camera: false, calendar: false });

  const toggle = (key: keyof typeof consents) => {
    const val = !consents[key];
    setConsents((prev) => ({ ...prev, [key]: val }));
    setConsent(key, val);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#0F0A1A' }}>
      <View className="flex-1 px-6 pt-8">
        <Text className="text-neutral-400 text-sm font-semibold mb-2" style={{ fontFamily: 'Nunito_600SemiBold' }}>ETAPA 6 DE 7</Text>
        <Text className="text-white text-2xl font-extrabold mb-2" style={{ fontFamily: 'Nunito_800ExtraBold' }}>Seus dados são seus</Text>
        <Text className="text-neutral-400 text-sm mb-6" style={{ fontFamily: 'Nunito_400Regular' }}>
          Seus dados de saúde são protegidos pela LGPD. Você pode revogar a qualquer momento.
        </Text>

        <View className="gap-4">
          {PERMISSIONS.map((p) => (
            <View key={p.key} className="flex-row items-center justify-between p-4 rounded-2xl" style={{ backgroundColor: '#1E1433', borderWidth: 1, borderColor: '#2d2540' }}>
              <View className="flex-row items-center flex-1">
                <Text style={{ fontSize: 24, marginRight: 12 }}>{p.emoji}</Text>
                <View className="flex-1">
                  <Text className="text-white font-semibold" style={{ fontFamily: 'Nunito_600SemiBold' }}>{p.label}</Text>
                  <Text className="text-neutral-400 text-sm" style={{ fontFamily: 'Nunito_400Regular' }}>{p.desc}</Text>
                </View>
              </View>
              <Switch
                value={consents[p.key]}
                onValueChange={() => toggle(p.key)}
                trackColor={{ false: '#2d2540', true: '#7e22ce' }}
                thumbColor={consents[p.key] ? '#a855f7' : '#8f86a0'}
                accessibilityLabel={`Permitir ${p.label}`}
              />
            </View>
          ))}
        </View>

        <View className="flex-1" />
        <Text className="text-neutral-500 text-xs text-center mb-4" style={{ fontFamily: 'Nunito_400Regular' }}>
          Ao continuar, você concorda com os{' '}
          <Text style={{ color: '#c084fc' }}>Termos de Uso</Text>
          {' '}e a{' '}
          <Text style={{ color: '#c084fc' }}>Política de Privacidade</Text>.
        </Text>
        <TouchableOpacity
          className="py-4 rounded-2xl items-center mb-4"
          style={{ backgroundColor: '#a855f7' }}
          onPress={() => { nextStep(); router.push('/(onboarding)/step-7-hub'); }}
        >
          <Text className="text-white font-bold text-base" style={{ fontFamily: 'Nunito_700Bold' }}>Concordar e continuar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
