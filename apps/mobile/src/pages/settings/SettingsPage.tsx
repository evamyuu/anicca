import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function SettingsPage() {
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#0F0A1A' }}>
      <View className="flex-1 px-6 pt-6">
        <Text className="text-white text-2xl font-extrabold mb-6" style={{ fontFamily: 'Nunito_800ExtraBold' }}>Configurações</Text>
        {['Personalidade da Ani', 'Personalizar Avatar', 'Notificações', 'Privacidade e Consentimentos', 'Sobre a Anicca', 'Sair'].map((item) => (
          <View key={item} className="py-4" style={{ borderBottomWidth: 1, borderBottomColor: '#2d2540' }}>
            <Text className="text-white text-base" style={{ fontFamily: 'Nunito_400Regular' }}>{item}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}
