/**
 * @fileoverview Implementation of DoctorSpecialtyStep.
 *
 * @module pages/onboarding/steps/DoctorSpecialtyStepx
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { BaseStepLayout } from '@/shared/ui/Onboarding/BaseStepLayout';
import { OptionCard } from '@/shared/ui/Onboarding/OptionCard';
import { useOnboardingStore } from '@/shared/lib/zustand-persist';

const SPECIALTY_OPTIONS = [
  'Oncologia Clínica',
  'Oncologia Cirúrgica',
  'Radioterapia',
  'Hematologia',
  'Oncologia Pediátrica',
  'Clínica Geral ou Medicina de Família',
  'Enfermagem Oncológica',
  'Outra'
];

export function DoctorSpecialtyStep() {
  const router = useRouter();
  const { doctorSpecialty, setDetails, totalSteps } = useOnboardingStore();

  const handleNext = () => {
    router.push('/(onboarding)/step-5-interests-doctor');
  };

  const handleSelect = (specialty: string) => {
    setDetails({ doctorSpecialty: specialty });
    setTimeout(() => {
      handleNext();
    }, 360);
  };

  return (
    <BaseStepLayout
      currentStep={4}
      totalSteps={totalSteps}
      aniText="Qual é a sua especialidade principal? Isso me ajuda a personalizar o painel clínico."
      showSkip={true}
      onSkip={handleNext}
      hideFooter={true} // Auto-advances
    >
      <View style={{ paddingTop: 8 }}>
        {SPECIALTY_OPTIONS.map((spec) => (
          <OptionCard
            key={spec}
            title={spec}
            size="small"
            selected={doctorSpecialty === spec}
            onPress={() => handleSelect(spec)}
          />
        ))}
      </View>
    </BaseStepLayout>
  );
}
