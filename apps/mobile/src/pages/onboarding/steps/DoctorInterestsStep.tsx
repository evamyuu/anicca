/**
 * @fileoverview Implementation of DoctorInterestsStep.
 *
 * @module pages/onboarding/steps/DoctorInterestsStepx
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { BaseStepLayout } from '@/shared/ui/Onboarding/BaseStepLayout';
import { CheckCard } from '@/shared/ui/Onboarding/CheckCard';
import { useOnboardingStore } from '@/shared/lib/zustand-persist';

const INTERESTS_OPTIONS = [
  'Sintomas dos pacientes entre consultas',
  'Briefing pré-consulta',
  'Literatura científica (PubMed, OncoKB)',
  'Score de risco de abandono',
  'Conectar com pacientes que usam o Anicca'
];

export function DoctorInterestsStep() {
  const router = useRouter();
  const { doctorInterests, setDetails, totalSteps } = useOnboardingStore();

  const handleNext = () => {
    router.push('/(onboarding)/step-perms');
  };

  const toggleInterest = (interest: string) => {
    if (doctorInterests.includes(interest)) {
      setDetails({ doctorInterests: doctorInterests.filter((i) => i !== interest) });
    } else {
      if (doctorInterests.length < 2) {
        setDetails({ doctorInterests: [...doctorInterests, interest] });
      }
    }
  };

  return (
    <BaseStepLayout
      currentStep={5}
      totalSteps={totalSteps}
      aniText="O que você mais quer acompanhar pelo painel? Escolha até 2 prioridades."
      showSkip={true}
      onSkip={handleNext}
      onNext={handleNext}
    >
      <View style={{ paddingTop: 8 }}>
        {INTERESTS_OPTIONS.map((opt) => (
          <CheckCard
            key={opt}
            label={opt}
            selected={doctorInterests.includes(opt)}
            onPress={() => toggleInterest(opt)}
            disabled={!doctorInterests.includes(opt) && doctorInterests.length >= 2}
          />
        ))}
      </View>
    </BaseStepLayout>
  );
}
