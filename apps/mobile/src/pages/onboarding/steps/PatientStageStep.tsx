/**
 * @fileoverview Implementation of PatientStageStep.
 *
 * @module pages/onboarding/steps/PatientStageStepx
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { BaseStepLayout } from '@/shared/ui/Onboarding/BaseStepLayout';
import { OptionCard } from '@/shared/ui/Onboarding/OptionCard';
import { OnboardingInput } from '@/shared/ui/Onboarding/OnboardingInput';
import { useOnboardingStore } from '@/shared/lib/zustand-persist';

const STAGE_OPTIONS = [
  { title: 'Estágio Inicial (I ou II)', desc: 'Localizado, sem metástase' },
  { title: 'Estágio Avançado (III ou IV)', desc: 'Pode ter se espalhado' },
  { title: 'Recidiva', desc: 'O câncer voltou após o tratamento' },
  { title: 'Não sei informar', desc: '' }
];

export function PatientStageStep() {
  const router = useRouter();
  const { stage, diagnosisDate, setDetails, totalSteps } = useOnboardingStore();

  const handleNext = () => {
    router.push('/(onboarding)/step-6-modality-patient');
  };

  return (
    <BaseStepLayout
      currentStep={5}
      totalSteps={totalSteps}
      aniText="Você sabe em qual estágio está a doença? Sem problema se não souber — pode pular."
      showSkip={true}
      onSkip={handleNext}
      onNext={handleNext}
    >
      <View>
        <Text style={styles.sectionTitle}>Estadiamento</Text>
        {STAGE_OPTIONS.map((opt) => (
          <OptionCard
            key={opt.title}
            title={opt.title}
            description={opt.desc}
            size="small"
            selected={stage === opt.title}
            onPress={() => setDetails({ stage: opt.title })}
          />
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 14 }]}>
          Quando foi o diagnóstico? <Text style={styles.optionalText}>(opcional)</Text>
        </Text>
        <OnboardingInput
          placeholder="Mês e Ano (Ex: 05/2026)"
          keyboardType="numeric"
          value={diagnosisDate || ''}
          onChangeText={(text) => setDetails({ diagnosisDate: text })}
          hint="Usado para acompanhar os prazos da Lei dos 60 dias."
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
  },
  optionalText: {
    fontWeight: '400',
    textTransform: 'none',
    fontSize: 11,
  }
});
