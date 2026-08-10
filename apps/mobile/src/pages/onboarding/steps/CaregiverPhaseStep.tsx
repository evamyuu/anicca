/**
 * @fileoverview Implementation of CaregiverPhaseStep.
 *
 * @module pages/onboarding/steps/CaregiverPhaseStepx
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { BaseStepLayout } from '@/shared/ui/Onboarding/BaseStepLayout';
import { OptionCard } from '@/shared/ui/Onboarding/OptionCard';
import { useOnboardingStore } from '@/shared/lib/zustand-persist';

const PHASE_OPTIONS = [
  'Aguardando orientações após o diagnóstico',
  'Vai iniciar o tratamento em breve',
  'Já está em tratamento ativo',
  'Finalizou o tratamento — em acompanhamento',
];

export function CaregiverPhaseStep() {
  const router = useRouter();
  const { journeyPhase, setDetails, totalSteps } = useOnboardingStore();

  const handleNext = () => {
    router.push('/(onboarding)/step-7-priorities-caregiver');
  };

  const handleSelect = (phase: string) => {
    setDetails({ journeyPhase: phase });
    setTimeout(() => {
      handleNext();
    }, 360);
  };

  return (
    <BaseStepLayout
      currentStep={6}
      totalSteps={totalSteps}
      aniText="Em qual fase do tratamento ele ou ela está?"
      showSkip={true}
      onSkip={handleNext}
      hideFooter={true} // Auto-advances
    >
      <View style={{ paddingTop: 8 }}>
        {PHASE_OPTIONS.map((phase) => (
          <OptionCard
            key={phase}
            title={phase}
            size="small"
            selected={journeyPhase === phase}
            onPress={() => handleSelect(phase)}
          />
        ))}
      </View>
    </BaseStepLayout>
  );
}
