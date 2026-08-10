/**
 * @fileoverview Implementation of CaregiverCancerStep.
 *
 * @module pages/onboarding/steps/CaregiverCancerStepx
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

const CANCER_TYPES = [
  'Câncer de Mama',
  'Câncer de Pulmão',
  'Câncer Colorretal',
  'Leucemia ou Linfoma',
  'Próstata',
  'Outro tipo',
  'Não sei informar'
];

export function CaregiverCancerStep() {
  const router = useRouter();
  const { cancerType, setDetails, totalSteps } = useOnboardingStore();

  const handleNext = () => {
    router.push('/(onboarding)/step-6-phase-caregiver');
  };

  const handleSelect = (type: string) => {
    setDetails({ cancerType: type });
    setTimeout(() => {
      handleNext();
    }, 360);
  };

  return (
    <BaseStepLayout
      currentStep={5}
      totalSteps={totalSteps}
      aniText="Qual é o diagnóstico de quem você cuida? Pode pular se não souber."
      showSkip={true}
      onSkip={handleNext}
      hideFooter={true}
    >
      <View>
        <Text style={styles.sectionTitle}>Tipo de câncer</Text>
        {CANCER_TYPES.map((type) => (
          <OptionCard
            key={type}
            title={type}
            size="small"
            selected={cancerType === type}
            onPress={() => handleSelect(type)}
          />
        ))}
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
