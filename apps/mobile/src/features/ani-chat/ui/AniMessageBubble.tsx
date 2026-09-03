/**
 * @fileoverview Renders a single Ani message bubble with optional GenUI cards.
 *
 * @module features/ani-chat/ui/AniMessageBubble
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import React from 'react';
import { View, Text } from 'react-native';

import type { ConversationMessage } from '@anicca/types';
import { GenUIRenderer, type GenUIButton } from './GenUIRenderer';
import { BRAND } from '@/shared/constants/brand-colors.const';

export interface AniMessageBubbleProps {
  message: ConversationMessage;
}

export function AniMessageBubble({ message, onButtonPress }: AniMessageBubbleProps & { onButtonPress?: (button: GenUIButton) => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 24, paddingHorizontal: 16 }} accessibilityRole="text">
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: BRAND.PRIMARY[800],
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 10,
          marginTop: 2,
          flexShrink: 0,
        }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 12, fontFamily: 'Nunito_800ExtraBold' }}>Ai</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View
          style={{
            borderRadius: 24,
            borderBottomLeftRadius: 4,
            borderWidth: 1,
            borderColor: BRAND.SURFACE.BORDER,
            paddingHorizontal: 20,
            paddingVertical: 16,
            maxWidth: '85%',
            backgroundColor: BRAND.SURFACE.CARD,
          }}
        >
          <Text
            style={{ color: BRAND.PRIMARY.DEFAULT, fontSize: 16, lineHeight: 22, fontFamily: 'Nunito_400Regular' }}
            accessibilityLabel={message.text}
          >
            {message.text}
          </Text>

          {message.cards.length > 0 && (
            <View style={{ marginTop: 12 }}>
              <GenUIRenderer cards={message.cards} onButtonPress={onButtonPress} />
            </View>
          )}
        </View>

        <Text
          style={{ color: BRAND.PRIMARY[400], fontSize: 12, marginTop: 4, marginLeft: 4, fontFamily: 'Nunito_400Regular' }}
        >
          {new Date(message.createdAt).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );
}