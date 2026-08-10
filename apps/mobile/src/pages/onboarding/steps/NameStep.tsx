/**
 * @fileoverview Implementation of NameStep.
 *
 * @module pages/onboarding/steps/NameStepx
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { BaseStepLayout } from '@/shared/ui/Onboarding/BaseStepLayout';
import { OnboardingInput } from '@/shared/ui/Onboarding/OnboardingInput';
import { useOnboardingStore } from '@/shared/lib/zustand-persist';

export function NameStep() {
  const router = useRouter();
  const { name, profileType, setDetails, totalSteps } = useOnboardingStore();

  const handleNext = () => {
    if (profileType === 'doctor') {
      router.push('/(onboarding)/step-3-doctor-crm');
    } else {
      router.push('/(onboarding)/step-3-age-gender');
    }
  };

  return (
    <BaseStepLayout
      currentStep={2}
      totalSteps={totalSteps}
      aniText="Como você gostaria de ser chamado(a)? Vou usar seu nome em todas as nossas conversas."
      nextDisabled={!name || name.trim().length < 2}
      onNext={handleNext}
    >
      <View style={{ paddingTop: 10 }}>
        <OnboardingInput
          label="Seu nome ou apelido"
          placeholder="Ex: Luffy, Nami, Robin..."
          value={name || ''}
          onChangeText={(text) => setDetails({ name: text })}
          autoComplete="given-name"
        />
      </View>
    </BaseStepLayout>
  );
}
