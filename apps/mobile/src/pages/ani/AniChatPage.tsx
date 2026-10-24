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
import { View, FlatList, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MoreVertical } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import {
  useAniChat,
  ChatInputBar,
  AniMessageBubble,
  UserMessageBubble,
  AniTypingIndicator,
} from '@/features/ani-chat';
const ANI_AVATAR = require('../../../assets/images/ani-geral/ani-avatar.png');

export function AniChatPage() {
  const { messages, isTyping, isLoading, error, send, retry } = useAniChat();
  const router = useRouter();
  const { initialQuery } = useLocalSearchParams<{ initialQuery?: string }>();

  // Questions from the Hub are sent right away; drafts ending in ":" just prefill the input.
  const isDraft = !!initialQuery && initialQuery.trim().endsWith(':');
  const sentQueryRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!initialQuery || isDraft || isLoading || sentQueryRef.current === initialQuery) return;
    sentQueryRef.current = initialQuery;
    send(initialQuery);
  }, [initialQuery, isDraft, isLoading, send]);
  
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
      {/* Header: Ani identity + settings */}
      <View
        className="flex-row items-center px-4 py-3"
        style={{ borderBottomWidth: 1, borderBottomColor: headerBorderColor, backgroundColor: bgColor, gap: 10 }}
      >
        <View style={{ width: 36, height: 36, borderRadius: 12, overflow: 'hidden', backgroundColor: BRAND.WARM.CHIP }}>
          <Image source={ANI_AVATAR} style={{ width: 36, height: 36 }} resizeMode="cover" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 15, color: BRAND.PRIMARY.DEFAULT }}>Ani</Text>
          <Text style={{ fontFamily: 'Nunito_600SemiBold', fontSize: 11, color: BRAND.WARM.TEXT_MUTED }}>
            online • lembra das conversas do WhatsApp
          </Text>
        </View>
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
              <Image source={ANI_AVATAR} style={{ width: 72, height: 72, borderRadius: 24 }} resizeMode="cover" />
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
      <ChatInputBar onSend={send} isTyping={isTyping} {...(isDraft ? { initialText: initialQuery } : {})} />
    </SafeAreaView>
  );
}