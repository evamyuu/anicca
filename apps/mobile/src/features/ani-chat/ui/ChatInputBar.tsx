import { BRAND } from '@/shared/constants/brand-colors.const';
/**
 * @fileoverview Renders the message input bar for the Ani chat screen.
 *
 * @module features/ani-chat/ui/ChatInputBar
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import React, { useRef, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Animated,
  Platform,
  KeyboardAvoidingView,
  Modal,
  Text,
} from 'react-native';
import { Plus, Mic, AudioLines, Send } from 'lucide-react-native';
import { useOnboardingStore } from '@/shared/lib/zustand-persist';
import type { AniPersonality } from '@anicca/types';

/** @internal Scale animation duration in milliseconds. */
const SCALE_ANIMATION_DURATION_MS = 80;
const SCALE_COMPRESSED = 0.9;
const SCALE_DEFAULT = 1;

export interface ChatInputBarProps {
  onSend: (text: string) => void;
  isTyping: boolean;
  placeholder?: string;
}

export function ChatInputBar({
  onSend,
  isTyping,
  placeholder = 'Escreva uma mensagem...',
}: ChatInputBarProps) {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const scaleAnim = useRef(new Animated.Value(SCALE_DEFAULT)).current;

  const handleSend = () => {
    if (!text.trim() || isTyping) return;
    onSend(text.trim());
    setText('');
  };

  const animateSendButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: SCALE_COMPRESSED,
        duration: SCALE_ANIMATION_DURATION_MS,
        useNativeDriver: false,
      }),
      Animated.timing(scaleAnim, {
        toValue: SCALE_DEFAULT,
        duration: SCALE_ANIMATION_DURATION_MS,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const canSend = text.trim().length > 0 && !isTyping;
  
  const inputBgColor = BRAND.SURFACE.CARD;
  const iconColor = BRAND.PRIMARY[400];
  const textColor = BRAND.PRIMARY[900];

  const { aniPersonality, setAniPersonality } = useOnboardingStore();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const personalities: { id: AniPersonality; label: string }[] = [
    { id: 'mentor', label: 'Mentora (Empática)' },
    { id: 'realist', label: 'Realista (Direta)' },
    { id: 'optimist', label: 'Otimista (Lúdica)' },
    { id: 'specialist', label: 'Especialista' },
  ];

  const currentPersonality = personalities.find(p => p.id === aniPersonality) || personalities[0];

  return (
    <>
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: BRAND.SURFACE.CARD, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 }}>
            <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 18, color: BRAND.PRIMARY.DEFAULT, marginBottom: 16 }}>
              Selecionar Personalidade
            </Text>
            {personalities.map((p) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => {
                  setAniPersonality(p.id);
                  setIsModalVisible(false);
                }}
                style={{
                  paddingVertical: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: BRAND.SURFACE.BORDER,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontFamily: 'Nunito_600SemiBold', fontSize: 16, color: aniPersonality === p.id ? BRAND.SECONDARY.DEFAULT : BRAND.PRIMARY[800] }}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setIsModalVisible(false)} style={{ marginTop: 24, alignItems: 'center' }}>
              <Text style={{ fontFamily: 'Nunito_700Bold', color: BRAND.PRIMARY[400] }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      style={{ paddingBottom: Platform.OS === 'ios' ? 100 : 80 }}
    >
      <View
        style={{
          marginHorizontal: 16,
          marginBottom: 16,
          padding: 12,
          borderRadius: 24,
          backgroundColor: inputBgColor,
          borderWidth: 1,
          borderColor: isFocused ? BRAND.SECONDARY.DEFAULT : 'transparent',
        }}
      >
        <TextInput
          style={{
            color: textColor,
            fontSize: 16,
            fontFamily: 'Nunito_400Regular',
            maxHeight: 120,
            paddingHorizontal: 4,
            paddingTop: Platform.OS === 'ios' ? 8 : 4,
            paddingBottom: 16,
          }}
          placeholder={placeholder}
          placeholderTextColor={iconColor}
          value={text}
          onChangeText={setText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline
          textAlignVertical="top"
          onSubmitEditing={handleSend}
          returnKeyType="send"
          editable={!isTyping}
          accessibilityLabel="Message input field"
        />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity 
              style={{ padding: 8, marginRight: 8, backgroundColor: BRAND.PRIMARY[100], borderRadius: 20 }}
              accessibilityLabel="Add attachment"
            >
              <Plus size={20} color={iconColor} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsModalVisible(true)}
              style={{
                backgroundColor: BRAND.PRIMARY[100],
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 20,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontFamily: 'Nunito_600SemiBold', fontSize: 14, color: textColor }}>
                {currentPersonality.label}
              </Text>
            </TouchableOpacity>


          </View>

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            {canSend ? (
              <TouchableOpacity
                onPress={() => {
                  animateSendButton();
                  handleSend();
                }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: BRAND.SECONDARY.DEFAULT,
                }}
              >
                <Send size={18} color="#FFFFFF" style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity style={{ padding: 8 }}>
                  <Mic size={20} color={iconColor} />
                </TouchableOpacity>
                <TouchableOpacity style={{ padding: 8, backgroundColor: BRAND.SURFACE.CARD, borderRadius: 20, marginLeft: 4, elevation: 1, shadowColor: BRAND.PRIMARY[900], shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}>
                  <AudioLines size={18} color={BRAND.PRIMARY.DEFAULT} />
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </View>
      </View>
    </KeyboardAvoidingView>
    </>
  );
}