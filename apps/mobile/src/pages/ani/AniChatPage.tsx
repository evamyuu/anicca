import React from 'react';
import { View, FlatList, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  useAniChat,
  ChatInputBar,
  AniMessageBubble,
  UserMessageBubble,
  AniTypingIndicator,
} from '@/features/ani-chat';

// ─────────────────────────────────────────────────────────────────────────────
// AniChatPage — FSD: pages/ani
// Assembles the ani-chat feature into a full page.
// ─────────────────────────────────────────────────────────────────────────────

export function AniChatPage() {
  const { messages, isTyping, isLoading, error, send, retry } = useAniChat();
  const flatListRef = React.useRef<FlatList>(null);

  React.useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: '#0F0A1A' }}>
        <Text className="text-neutral-400 text-base" style={{ fontFamily: 'Nunito_400Regular' }}>
          Iniciando conversa com Ani...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#0F0A1A' }}>
      {/* Header */}
      <View
        className="flex-row items-center px-4 py-3"
        style={{ borderBottomWidth: 1, borderBottomColor: '#2d2540' }}
      >
        <Text style={{ fontSize: 24, marginRight: 8 }}>🐱</Text>
        <View>
          <Text
            className="text-white font-bold text-lg"
            style={{ fontFamily: 'Nunito_700Bold' }}
          >
            Ani
          </Text>
          <Text
            className="text-primary-400 text-sm"
            style={{ fontFamily: 'Nunito_400Regular', color: '#c084fc' }}
          >
            {isTyping ? 'Digitando...' : 'Online'}
          </Text>
        </View>
      </View>

      {/* Error state */}
      {error && (
        <View className="mx-4 mt-2 p-3 rounded-xl" style={{ backgroundColor: '#7f1d1d' }}>
          <Text className="text-red-200 text-sm" style={{ fontFamily: 'Nunito_400Regular' }}>
            {error}
          </Text>
          <TouchableOpacity onPress={retry} className="mt-2">
            <Text className="text-red-300 text-sm font-semibold" style={{ fontFamily: 'Nunito_600SemiBold' }}>
              Tentar novamente
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Messages list */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) =>
          item.role === 'ani' ? (
            <AniMessageBubble message={item} />
          ) : (
            <UserMessageBubble message={item} />
          )
        }
        contentContainerStyle={{ paddingVertical: 16 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-16 px-8">
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🐱</Text>
            <Text
              className="text-white text-xl font-bold text-center mb-2"
              style={{ fontFamily: 'Nunito_700Bold' }}
            >
              Olá! Eu sou a Ani.
            </Text>
            <Text
              className="text-neutral-400 text-center text-base leading-6"
              style={{ fontFamily: 'Nunito_400Regular' }}
            >
              Pode me perguntar sobre seu diagnóstico, sintomas, direitos, ou qualquer dúvida
              sobre sua jornada oncológica.
            </Text>
          </View>
        }
        ListFooterComponent={isTyping ? <AniTypingIndicator /> : null}
      />

      {/* Input bar */}
      <ChatInputBar onSend={send} isTyping={isTyping} />
    </SafeAreaView>
  );
}
