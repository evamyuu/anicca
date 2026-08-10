/**
 * @fileoverview Implementation of WhatsAppStep.
 *
 * @module pages/onboarding/steps/WhatsAppStepx
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { BaseStepLayout } from '@/shared/ui/Onboarding/BaseStepLayout';
import { OptionCard } from '@/shared/ui/Onboarding/OptionCard';
import { useOnboardingStore } from '@/shared/lib/zustand-persist';

export function WhatsAppStep() {
  const router = useRouter();
  const { whatsappIntent, setDetails, totalSteps, profileType } = useOnboardingStore();

  const handleNext = () => {
    router.push('/(onboarding)/step-perms');
  };

  const handleSelect = (wantsWpp: boolean) => {
    setDetails({ whatsappIntent: wantsWpp });
    setTimeout(() => {
      handleNext();
    }, 360);
  };

  const currentStep = profileType === 'patient' ? 9 : 8;

  return (
    <BaseStepLayout
      currentStep={currentStep}
      totalSteps={totalSteps}
      aniText="Sabia que eu também posso falar com você pelo WhatsApp? É ótimo para o dia a dia! A gente pode conversar, tirar dúvidas e eu te lembro dos remédios. E fique tranquilo: tudo que a gente falar lá fica guardadinho e sincronizado aqui no aplicativo na mesma hora. Como você prefere?"
      showSkip={true}
      onSkip={handleNext}
      hideFooter={true} // Auto-advances
    >
      <View style={{ paddingTop: 8 }}>
        <Text style={styles.sectionTitle}>Quer me encontrar por lá?</Text>
        
        <OptionCard
          title="Sim, quero"
          description="Você informa seu número quando criar a conta"
          selected={whatsappIntent === true}
          onPress={() => handleSelect(true)}
        />
        
        <OptionCard
          title="Agora não"
          description="Posso ativar quando quiser em Configurações"
          selected={whatsappIntent === false}
          onPress={() => handleSelect(false)}
        />
      </View>
    </BaseStepLayout>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'Nunito_700Bold',
    color: '#9C8880',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginBottom: 9,
  }
});