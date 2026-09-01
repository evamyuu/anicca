/**
 * @fileoverview Implementation of UserMessageBubble.
 *
 * @module features/ani-chat/ui/UserMessageBubblex
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React from 'react';
import { View, Text } from 'react-native';

import type { ConversationMessage } from '@anicca/types';
import { BRAND } from '@/shared/constants/brand-colors.const';


interface UserMessageBubbleProps {
  message: ConversationMessage;
}

export function UserMessageBubble({ message }: UserMessageBubbleProps) {
  return (
    <View className="flex-row justify-end px-4 mb-4" accessibilityRole="text">
      <View className="max-w-[80%]">
        <View
          className="rounded-3xl rounded-tr-sm px-5 py-3"
          style={{ backgroundColor: BRAND.PRIMARY[800] }}
        >
          <Text
            className="text-white text-base leading-6"
            style={{ fontFamily: 'Nunito_400Regular' }}
            accessibilityLabel={`Você disse: ${message.text}`}
          >
            {message.text}
          </Text>
        </View>
        <Text
          className="text-xs mt-1 text-right mr-1"
          style={{ fontFamily: 'Nunito_400Regular', color: BRAND.PRIMARY[400] }}
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