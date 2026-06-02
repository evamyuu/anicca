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

/**
 * Props for {@link AniMessageBubble}.
 */
export interface AniMessageBubbleProps {
  /**
   * The Ani message to render, including its text content and
   * any associated GenUI cards.
   */
  message: ConversationMessage;
}

/**
 * Renders an Ani message bubble aligned to the left, followed by any
 * GenUI cards attached to the message.
 *
 * @remarks
 * GenUI cards are rendered as typed stubs until the full
 * `GenUiRenderer` widget is implemented. Each card uses its
 * `accessibilityLabel` for screen reader support.
 *
 * @param props - See {@link AniMessageBubbleProps}.
 * @returns The Ani message bubble component.
 *
 * @example
 * ```tsx
 * <AniMessageBubble message={aniResponseMessage} />
 * ```
 */
export function AniMessageBubble({ message }: AniMessageBubbleProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, paddingHorizontal: 16 }} accessibilityRole="text">
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
          marginTop: 4,
          backgroundColor: '#1E1433',
          borderWidth: 1.5,
          borderColor: '#a855f7',
        }}
      >
        <Text style={{ fontSize: 16 }}>🐱</Text>
      </View>

      <View style={{ flex: 1 }}>
        <View
          style={{
            borderRadius: 16,
            borderTopLeftRadius: 4,
            paddingHorizontal: 16,
            paddingVertical: 12,
            maxWidth: '85%',
            backgroundColor: '#1E1433',
            borderWidth: 1,
            borderColor: '#2d2540',
          }}
        >
          <Text
            style={{ color: '#fff', fontSize: 16, lineHeight: 24, fontFamily: 'Nunito_400Regular' }}
            accessibilityLabel={message.text}
          >
            {message.text}
          </Text>
        </View>

        {message.cards.length > 0 && (
          <View style={{ marginTop: 8 }}>
            {message.cards.map((card) => (
              <View
                key={card.id}
                style={{
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  marginBottom: 8,
                  backgroundColor: '#2d2540',
                }}
                accessibilityLabel={card.accessibilityLabel}
              >
                <Text style={{ color: '#ada5bc', fontSize: 14, fontFamily: 'Nunito_400Regular' }}>
                  [{card.type}]
                </Text>
              </View>
            ))}
          </View>
        )}

        <Text
          style={{ color: '#8f86a0', fontSize: 12, marginTop: 4, marginLeft: 4, fontFamily: 'Nunito_400Regular' }}
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
