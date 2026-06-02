import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

// ─────────────────────────────────────────────────────────────────────────────
// HubPage — FSD: pages/hub
// Main dashboard: greeting, Law 60 Days, quick actions, GenUI cards
// ─────────────────────────────────────────────────────────────────────────────

export function HubPage() {
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#0F0A1A' }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header — Greeting */}
        <View className="px-5 pt-4 pb-2">
          <Text
            className="text-neutral-400 text-sm"
            style={{ fontFamily: 'Nunito_400Regular' }}
          >
            Quinta-feira, 29 de maio
          </Text>
          <Text
            className="text-white text-2xl font-extrabold mt-1"
            style={{ fontFamily: 'Nunito_800ExtraBold' }}
          >
            Olá, Rosa! 👋
          </Text>
        </View>

        {/* Ani greeting card */}
        <View
          className="mx-4 mt-4 p-4 rounded-2xl"
          style={{
            backgroundColor: '#1E1433',
            borderWidth: 1,
            borderColor: '#2d2540',
            shadowColor: '#a855f7',
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          <View className="flex-row items-center mb-3">
            <Text style={{ fontSize: 24, marginRight: 8 }}>🐱</Text>
            <Text
              className="text-primary-300 font-semibold"
              style={{ fontFamily: 'Nunito_600SemiBold', color: '#d8b4fe' }}
            >
              Ani
            </Text>
          </View>
          <Text
            className="text-white text-base leading-6"
            style={{ fontFamily: 'Nunito_400Regular' }}
          >
            Seu ciclo 3 começa amanhã. Você tem alguma dúvida sobre a pré-medicação?
          </Text>
          <TouchableOpacity
            className="mt-3 py-2 px-4 rounded-xl self-start"
            style={{ backgroundColor: '#7e22ce' }}
            onPress={() => router.push('/(tabs)/ani')}
            accessibilityRole="button"
            accessibilityLabel="Falar com Ani"
          >
            <Text
              className="text-white font-semibold"
              style={{ fontFamily: 'Nunito_600SemiBold' }}
            >
              Falar com Ani →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions Grid */}
        <View className="px-4 mt-4">
          <Text
            className="text-neutral-400 text-sm font-semibold mb-3"
            style={{ fontFamily: 'Nunito_600SemiBold', textTransform: 'uppercase', letterSpacing: 0.5 }}
          >
            Acesso Rápido
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.id}
                className="rounded-2xl p-4 items-start"
                style={{
                  width: '47%',
                  backgroundColor: '#1E1433',
                  borderWidth: 1,
                  borderColor: '#2d2540',
                  minHeight: 100,
                }}
                onPress={() => router.push(action.route as `/${string}`)}
                accessibilityRole="button"
                accessibilityLabel={action.label}
              >
                <Text style={{ fontSize: 28, marginBottom: 8 }}>{action.emoji}</Text>
                <Text
                  className="text-white font-semibold text-sm"
                  style={{ fontFamily: 'Nunito_600SemiBold' }}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Law 60 Days Card (stub) */}
        <View
          className="mx-4 mt-4 p-4 rounded-2xl"
          style={{
            backgroundColor: '#1E1433',
            borderWidth: 1,
            borderColor: '#22c55e',
            borderLeftWidth: 4,
          }}
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text
              className="text-white font-semibold text-base"
              style={{ fontFamily: 'Nunito_600SemiBold' }}
            >
              ⚖️ Lei dos 60 Dias
            </Text>
            <View className="px-2 py-1 rounded-full" style={{ backgroundColor: '#14532d' }}>
              <Text className="text-green-300 text-xs" style={{ fontFamily: 'Nunito_600SemiBold' }}>
                No prazo
              </Text>
            </View>
          </View>
          <Text
            className="text-neutral-400 text-sm leading-5"
            style={{ fontFamily: 'Nunito_400Regular' }}
          >
            Faltam 26 dias para o vencimento do prazo legal.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const QUICK_ACTIONS = [
  { id: 'body-map', emoji: '🗺️', label: 'Body Map', route: '/body-map' },
  { id: 'symptoms', emoji: '⚡', label: 'Sintomas CTCAE', route: '/symptom/ctcae' },
  { id: 'journaling', emoji: '📓', label: 'Diário', route: '/journaling' },
  { id: 'ticket', emoji: '🎫', label: 'Abrir Chamado', route: '/tickets/new' },
] as const;
