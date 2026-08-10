/**
 * @fileoverview Chat Screen with Ani. Supports both standard text messages and Generative UI cards.
 * Implements the Figma 2 design.
 *
 * @module pages/tabs/chat
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Mic, User, Send } from 'lucide-react-native';

import { ChecklistCard } from '../../src/features/chat/ui/ChecklistCard';
import { messagesApi, Message } from '@/shared/api/messages';

export default function ChatScreen() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const initSession = async () => {
      try {
        const res = await messagesApi.startSession();
        setSessionId(res.session_id);
      } catch (error) {
        console.error('Failed to start session', error);
      }
    };
    initSession();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !sessionId || isLoading) return;

    const userText = input.trim();
    setInput('');
    setIsLoading(true);

    const tempUserMsg: Message = {
      id: `temp_${Date.now()}`,
      session_id: sessionId,
      role: 'user',
      text: userText,
      cards: [],
      channel: 'app',
      agents_invoked: [],
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const response = await messagesApi.sendMessage({
        session_id: sessionId,
        text: userText,
      });

      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== tempUserMsg.id);
        return [...filtered, response.user_message, response.ani_response];
      });
      
    } catch (error) {
      console.error('Failed to send message', error);
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
    } finally {
      setIsLoading(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderMessage = (msg: Message) => {
    const isUser = msg.role === 'user';
    
    return (
      <View key={msg.id} style={[styles.messageWrapper, isUser ? styles.messageWrapperRight : styles.messageWrapperLeft]}>
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.aniBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.aniMessageText]}>
            {msg.text}
          </Text>
          
          {/* Render Generative UI Cards if present */}
          {msg.cards && msg.cards.map((card, idx) => {
            if (card.type === 'checklist') {
              return <ChecklistCard key={`card_${idx}`} title={card.title} items={card.items} />;
            }
            return null;
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90} // To account for bottom tabs
      >
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarPlaceholder}>
             {/* Mascot avatar placeholder */}
             <Text style={{fontSize: 24}}>🐱</Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Ani (Agent)</Text>
            <Text style={styles.headerSubtitle}>Suporte Prático e Sincero</Text>
          </View>
        </View>

        {/* Chat Stream */}
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.chatScroll} 
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 0 && !isLoading && (
            <Text style={styles.emptyText}>Mande uma mensagem para iniciar o chat!</Text>
          )}
          {messages.map(renderMessage)}
          
          {isLoading && (
            <View style={[styles.messageWrapper, styles.messageWrapperLeft]}>
              <View style={[styles.bubble, styles.aniBubble, { padding: 12 }]}>
                <ActivityIndicator size="small" color="#f28b50" />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Peça uma análise à Ani..."
              placeholderTextColor="#a3988e"
              value={input}
              onChangeText={setInput}
              multiline
              onSubmitEditing={handleSend}
            />
            {input.trim().length > 0 ? (
               <TouchableOpacity style={styles.micButton} onPress={handleSend} disabled={isLoading}>
                 <Send size={20} color="#f28b50" />
               </TouchableOpacity>
            ) : (
               <TouchableOpacity style={styles.micButton} disabled={isLoading}>
                 <Mic size={20} color="#f28b50" />
               </TouchableOpacity>
            )}
          </View>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fbf9f6',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 224, 220, 0.5)',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4a3931',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3d2b1f',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#a3988e',
    fontWeight: '500',
  },
  chatScroll: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: '#a3988e',
    marginTop: 20,
  },
  messageWrapper: {
    width: '100%',
    marginBottom: 24,
    flexDirection: 'row',
  },
  messageWrapperRight: {
    justifyContent: 'flex-end',
  },
  messageWrapperLeft: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '85%',
    padding: 16,
    borderRadius: 24,
  },
  userBubble: {
    backgroundColor: '#4a3931',
    borderBottomRightRadius: 4, // Chat tail pointing to right
  },
  aniBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4, // Chat tail pointing to left
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  aniMessageText: {
    color: '#3d2b1f',
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80, // Compensates for tabs layout over it
    backgroundColor: 'transparent',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#efe9e4',
    borderRadius: 24,
    minHeight: 52,
    paddingHorizontal: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#3d2b1f',
    paddingVertical: 14,
    maxHeight: 100,
  },
  micButton: {
    padding: 8,
    marginLeft: 8,
  }
});