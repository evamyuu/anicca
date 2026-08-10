/**
 * @fileoverview Implementation of PatientTreatmentStep.
 *
 * @module pages/onboarding/steps/PatientTreatmentStepx
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

const TREATMENT_OPTIONS = [
  'Cirurgia',
  'Quimioterapia',
  'Radioterapia',
  'Imunoterapia ou Terapia-Alvo',
  'Hormonioterapia',
  'Ainda não foi definido'
];

const CONCERN_OPTIONS = [
  'Entender a doença e os exames',
  'Organizar consultas e medicamentos',
  'Apoio emocional e psicológico',
  'Meus direitos no SUS ou no plano',
  'Encontrar onde me tratar'
];

export function PatientTreatmentStep() {
  const router = useRouter();
  const { treatments, concerns, setDetails, totalSteps } = useOnboardingStore();

  const handleNext = () => {
    router.push('/(onboarding)/step-wpp');
  };

  const toggleTreatment = (treatment: string) => {
    const current = (Array.isArray(treatments) ? treatments : []).filter(Boolean);
    if (current.includes(treatment)) {
      setDetails({ treatments: current.filter((t) => t !== treatment) });
    } else {
      setDetails({ treatments: [...current, treatment] });
    }
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
      currentStep={8}
      totalSteps={totalSteps}
      aniText="Qual tratamento está acontecendo ou vai acontecer? E o que mais te preocupa agora?"
      showSkip={true}
      onSkip={handleNext}
      onNext={handleNext}
    >
      <View>
        <Text style={styles.sectionTitle}>
          Tratamentos <Text style={styles.optionalText}>(opcional, pode marcar mais de um)</Text>
        </Text>
        {TREATMENT_OPTIONS.map((t) => {
          const current = (Array.isArray(treatments) ? treatments : []).filter(Boolean);
          return (
            <CheckCard
              key={t}
              label={t}
              selected={current.includes(t)}
              onPress={() => toggleTreatment(t)}
            />
          );
        })}
      </View>

      <View style={{ paddingTop: 32 }}>
        <Text style={styles.sectionTitle}>
          O que te preocupa? <Text style={styles.optionalText}>(opcional, pode marcar mais de um)</Text>
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
  },
  optionalText: {
    fontWeight: '400',
    textTransform: 'none',
    fontSize: 11,
  }
});
