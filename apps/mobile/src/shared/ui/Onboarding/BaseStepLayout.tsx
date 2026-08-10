/**
 * @fileoverview Implementation of BaseStepLayout.
 *
 * @module shared/ui/Onboarding/BaseStepLayoutx
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

import { ProgressBar } from './ProgressBar';
import { AniMessage } from './AniMessage';
import { GradientButton } from '@/shared/ui/GradientButton';

interface BaseStepLayoutProps {
  currentStep: number;
  totalSteps: number;
  aniText: string;
  onNext?: () => void;
  onSkip?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showBack?: boolean;
  showSkip?: boolean;
  hideFooter?: boolean;
  children: React.ReactNode;
}

export function BaseStepLayout({
  currentStep,
  totalSteps,
  aniText,
  onNext,
  onSkip,
  onBack,
  nextLabel = 'Continuar',
  nextDisabled = false,
  showBack = true,
  showSkip = false,
  hideFooter = false,
  children,
}: BaseStepLayoutProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}>
      {/* Top Nav */}
      <View style={styles.topNav}>
        {showBack ? (
          <TouchableOpacity onPress={handleBack} style={styles.btnBack} hitSlop={10}>
            <ArrowLeft size={24} color="#403229" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 32 }} />
        )}
        
        <View style={{ flex: 1, paddingHorizontal: 16 }}>
          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        </View>

        {showSkip ? (
          <TouchableOpacity onPress={onSkip} hitSlop={10}>
            <Text style={styles.btnSkip}>Pular</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* Ani Message */}
      <AniMessage>{aniText}</AniMessage>

      {/* Content */}
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          style={styles.body} 
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>

        {/* Footer */}
        {!hideFooter && (
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <GradientButton
              title={nextLabel}
              onPress={onNext || (() => {})}
              disabled={nextDisabled}
              colors={['#FF9A5C', '#E87A3E']}
              style={styles.btnMain}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0E9E5',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 10,
  },
  btnBack: {
    padding: 4,
  },
  btnSkip: {
    color: '#9C8880',
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
  },
  keyboardView: {
    flex: 1,
  },
  body: {
    flex: 1,
    marginTop: 16,
  },
  bodyContent: {
    paddingHorizontal: 22,
    paddingBottom: 40,
  },
  footer: {
    paddingHorizontal: 22,
    paddingTop: 14,
  },
  btnMain: {
    width: '100%',
    borderRadius: 50,
  }
});