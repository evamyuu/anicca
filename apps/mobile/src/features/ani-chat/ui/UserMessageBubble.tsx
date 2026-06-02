import React from 'react';
import { View, Text } from 'react-native';

import type { ConversationMessage } from '@anicca/types';

// ─────────────────────────────────────────────────────────────────────────────
// UserMessageBubble — Feature UI
// Displays a message from the user (right-aligned)
// ─────────────────────────────────────────────────────────────────────────────

interface UserMessageBubbleProps {
  message: ConversationMessage;
}

export function UserMessageBubble({ message }: UserMessageBubbleProps) {
  return (
    <View className="flex-row justify-end px-4 mb-4" accessibilityRole="text">
      <View className="max-w-[80%]">
        <View
          className="rounded-2xl rounded-tr-sm px-4 py-3"
          style={{ backgroundColor: '#7e22ce' }} // primary-700
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
          className="text-neutral-500 text-xs mt-1 text-right mr-1"
          style={{ fontFamily: 'Nunito_400Regular' }}
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
