/**
 * @fileoverview Implementation of CaregiverPrioritiesStep.
 *
 * @module pages/onboarding/steps/CaregiverPrioritiesStepx
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { BaseStepLayout } from '@/shared/ui/Onboarding/BaseStepLayout';
import { CheckCard } from '@/shared/ui/Onboarding/CheckCard';
import { useOnboardingStore } from '@/shared/lib/zustand-persist';

const CONCERN_OPTIONS = [
  'Entender os exames e laudos de quem eu cuido',
  'Organizar consultas, medicamentos e lembretes',
  'Apoio emocional — para mim também',
  'Direitos do paciente no SUS ou no plano',
  'Acompanhar sintomas e bem-estar diário'
];

export function CaregiverPrioritiesStep() {
  const router = useRouter();
  const { concerns, setDetails, totalSteps } = useOnboardingStore();

  const handleNext = () => {
    router.push('/(onboarding)/step-wpp');
  };

  const toggleConcern = (concern: string) => {
    const current = (Array.isArray(concerns) ? concerns : []).filter(Boolean);
    if (current.includes(concern)) {
      setDetails({ concerns: current.filter((c) => c !== concern) });
    } else {
      setDetails({ concerns: [...current, concern] });
    }
  };

  return (
    <BaseStepLayout
      currentStep={7}
      totalSteps={totalSteps}
      aniText="Cuidar de alguém que você ama exige muito. O que mais precisa de apoio agora?"
      showSkip={true}
      onSkip={handleNext}
      onNext={handleNext}
    >
      <View style={{ paddingTop: 8 }}>
        <Text style={styles.sectionTitle}>
          O que te preocupa? <Text style={{ color: '#9C8880', textTransform: 'lowercase', fontSize: 10.5 }}>(opcional, pode marcar mais de um)</Text>
        </Text>
        {CONCERN_OPTIONS.map((c) => {
          const current = (Array.isArray(concerns) ? concerns : []).filter(Boolean);
          return (
            <CheckCard
              key={c}
              label={c}
              selected={current.includes(c)}
              onPress={() => toggleConcern(c)}
            />
          );
        })}
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
