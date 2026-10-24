/**
 * @fileoverview Renders a single Ani message bubble with optional GenUI cards.
 *
 * @module features/ani-chat/ui/AniMessageBubble
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import React from 'react';
import { View, Text, Image } from 'react-native';

import type { ConversationMessage } from '@anicca/types';
import { GenUIRenderer, type GenUIButton } from './GenUIRenderer';
import { BRAND } from '@/shared/constants/brand-colors.const';

/** Same Ani artwork the doctor panel uses (cropped from ani-profile-icon.svg). */
const ANI_AVATAR = require('../../../../assets/images/ani-geral/ani-avatar.png');

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
          borderRadius: 12,
          backgroundColor: BRAND.WARM.CHIP,
          overflow: 'hidden',
          marginRight: 10,
          marginTop: 2,
          flexShrink: 0,
        }}
        accessibilityLabel="Ani"
      >
        <Image source={ANI_AVATAR} style={{ width: 32, height: 32 }} resizeMode="cover" />
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