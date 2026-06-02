import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function BodyMapPage() {
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#0F0A1A' }}>
      <View className="flex-1 px-6 pt-6">
        <Text className="text-white text-2xl font-extrabold mb-2" style={{ fontFamily: 'Nunito_800ExtraBold' }}>Body Map</Text>
        <Text className="text-neutral-400 text-sm mb-6" style={{ fontFamily: 'Nunito_400Regular' }}>Toque na região onde você sente algo</Text>
        {/* SVG Body Map placeholder */}
        <View className="flex-1 items-center justify-center rounded-2xl" style={{ backgroundColor: '#1E1433', borderWidth: 1, borderColor: '#2d2540' }}>
          <Text style={{ fontSize: 48, marginBottom: 8 }}>🗺️</Text>
          <Text className="text-neutral-400 text-base text-center" style={{ fontFamily: 'Nunito_400Regular' }}>
            [SVG Body Map interativo — em desenvolvimento]{'\n'}
            Frente | Costas
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
