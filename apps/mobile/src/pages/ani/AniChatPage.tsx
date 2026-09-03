import { BRAND } from '@/shared/constants/brand-colors.const';
/**
 * @fileoverview Implementation of AniChatPage.
 *
 * @module pages/ani/AniChatPage
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React from 'react';
import { View, FlatList, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MoreVertical } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import {
  useAniChat,
  ChatInputBar,
  AniMessageBubble,
  UserMessageBubble,
  AniTypingIndicator,
} from '@/features/ani-chat';
import AniProfileIcon from '../../../assets/images/ani-geral/ani-profile-icon.svg';

export function AniChatPage() {
  const { messages, isTyping, error, send, retry } = useAniChat();
  const router = useRouter();
  
  const bgColor = BRAND.BG.LIGHT;
  const textColor = BRAND.PRIMARY[900];
  const headerBorderColor = BRAND.SURFACE.BORDER;

  const flatListRef = React.useRef<FlatList>(null);

  React.useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: bgColor }}>
      {/* Header: only settings icon */}
      <View
        className="flex-row items-center justify-end px-4 py-3"
        style={{ borderBottomWidth: 1, borderBottomColor: headerBorderColor, backgroundColor: bgColor }}
      >
        <TouchableOpacity onPress={() => router.push('/ani/settings')} hitSlop={10} style={{ padding: 8 }}>
          <MoreVertical size={24} color={BRAND.PRIMARY[400]} />
        </TouchableOpacity>
      </View>

      {/* Error state */}
      {error && (
        <View className="mx-4 mt-2 p-3 rounded-xl" style={{ backgroundColor: BRAND.SECONDARY[900] }}>
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
        renderItem={({ item }) => {
          if (item.role === 'user') {
            return <UserMessageBubble message={item} />;
          }
          return (
            <AniMessageBubble 
              message={item} 
              onButtonPress={(button) => send(button.text)} 
            />
          );
        }}
        contentContainerStyle={{ paddingVertical: 16 }}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 64, paddingHorizontal: 32 }}>
            <View style={{
              width: 72, height: 72, borderRadius: 36,
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 20,
            }}>
              <AniProfileIcon width={72} height={72} />
            </View>
            <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 18, color: textColor, textAlign: 'center', marginBottom: 8 }}>
              Olá! Eu sou a Ani.
            </Text>
            <Text style={{ fontFamily: 'Nunito_400Regular', fontSize: 15, color: BRAND.PRIMARY[400], textAlign: 'center', lineHeight: 22 }}>
              Pode me perguntar sobre seu diagnóstico, sintomas, direitos, ou qualquer dúvida sobre sua jornada oncológica.
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