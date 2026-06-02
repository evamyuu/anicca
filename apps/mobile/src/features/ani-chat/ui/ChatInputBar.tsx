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
  Text,
  Animated,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';

/** @internal Scale animation duration in milliseconds. */
const SCALE_ANIMATION_DURATION_MS = 80;

/** @internal Compressed scale factor for the send button press animation. */
const SCALE_COMPRESSED = 0.9;

/** @internal Default scale for the send button. */
const SCALE_DEFAULT = 1;

/**
 * Props for {@link ChatInputBar}.
 */
export interface ChatInputBarProps {
  /**
   * Callback fired when the user submits a non-empty message.
   * @param text - The trimmed message string.
   */
  onSend: (text: string) => void;

  /**
   * When `true`, the input is disabled and the send button is inactive,
   * indicating that Ani is generating a response.
   */
  isTyping: boolean;

  /**
   * Placeholder text for the input field.
   * @defaultValue 'Fale com a Ani...'
   */
  placeholder?: string;
}

/**
 * Renders a multi-line text input with an animated send button.
 *
 * @remarks
 * - Uses {@link KeyboardAvoidingView} for iOS padding and Android height adjustment.
 * - The send button animates with a scale bounce on press.
 * - Complies with WCAG 2.1 AA: `accessibilityLabel`, `accessibilityHint`, and
 *   `accessibilityState` are set on all interactive elements.
 *
 * @param props - See {@link ChatInputBarProps}.
 * @returns The chat input bar component.
 *
 * @example
 * ```tsx
 * <ChatInputBar
 *   onSend={(text) => send(text)}
 *   isTyping={isTyping}
 * />
 * ```
 */
export function ChatInputBar({
  onSend,
  isTyping,
  placeholder = 'Fale com a Ani...',
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
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: SCALE_DEFAULT,
        duration: SCALE_ANIMATION_DURATION_MS,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const canSend = text.trim().length > 0 && !isTyping;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          marginHorizontal: 16,
          marginBottom: 16,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: isFocused ? '#a855f7' : '#2d2540',
          backgroundColor: '#1E1433',
          shadowColor: isFocused ? '#a855f7' : '#000',
          shadowOpacity: isFocused ? 0.2 : 0.1,
          shadowRadius: isFocused ? 8 : 4,
          elevation: isFocused ? 4 : 2,
        }}
      >
        <TextInput
          style={{
            flex: 1,
            color: '#fff',
            fontSize: 16,
            fontFamily: 'Nunito_400Regular',
            maxHeight: 120,
            marginRight: 12,
          }}
          placeholder={placeholder}
          placeholderTextColor="#8f86a0"
          value={text}
          onChangeText={setText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline
          textAlignVertical="center"
          onSubmitEditing={handleSend}
          returnKeyType="send"
          editable={!isTyping}
          accessibilityLabel="Message field for Ani"
          accessibilityHint="Type your message and tap send"
        />

        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            onPress={() => {
              animateSendButton();
              handleSend();
            }}
            disabled={!canSend}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: canSend ? '#a855f7' : '#4e4960',
            }}
            accessibilityRole="button"
            accessibilityLabel="Send message"
            accessibilityState={{ disabled: !canSend }}
          >
            <Text style={{ color: '#fff', fontSize: 16 }}>↑</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}
