/**
 * @fileoverview Implementation of PatientPhaseStep.
 *
 * @module pages/onboarding/steps/PatientPhaseStepx
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

const PHASE_OPTIONS = [
  'Recebi o diagnóstico e estou aguardando orientações',
  'Vou iniciar o tratamento nos próximos dias',
  'Já estou em tratamento ativo',
  'Finalizei o tratamento — estou em acompanhamento',
];

export function PatientPhaseStep() {
  const router = useRouter();
  const { journeyPhase, setDetails, totalSteps } = useOnboardingStore();

  const handleNext = () => {
    router.push('/(onboarding)/step-8-treatment-patient');
  };

  const handleSelect = (phase: string) => {
    setDetails({ journeyPhase: phase });
    setTimeout(() => {
      handleNext();
    }, 360);
  };

  return (
    <BaseStepLayout
      currentStep={7}
      totalSteps={totalSteps}
      aniText="Cada momento da jornada tem um ritmo diferente. Me conta onde você está hoje."
      showSkip={true}
      onSkip={handleNext}
      hideFooter={true} // Auto-advances
    >
      <View>
        <Text style={styles.sectionTitle}>Fase atual</Text>
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
