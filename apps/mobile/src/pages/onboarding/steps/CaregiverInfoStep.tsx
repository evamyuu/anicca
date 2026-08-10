/**
 * @fileoverview Implementation of CaregiverInfoStep.
 *
 * @module pages/onboarding/steps/CaregiverInfoStepx
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

const INVOLVEMENT_OPTIONS = [
  { title: 'Moro junto', desc: 'Acompanho tudo de perto no dia a dia' },
  { title: 'Ajudo à distância', desc: 'Consultas, burocracia e suporte remoto' },
  { title: 'Apoio principalmente emocional', desc: 'Suporte afetivo e presença' }
];

export function CaregiverInfoStep() {
  const router = useRouter();
  const { caregiverName, caregiverRelationship, setDetails, totalSteps } = useOnboardingStore();

  const handleNext = () => {
    router.push('/(onboarding)/step-5-cancer-caregiver');
  };

  return (
    <BaseStepLayout
      currentStep={4}
      totalSteps={totalSteps}
      aniText="Me conta um pouco sobre quem você cuida. Isso me ajuda a ter as informações certas para apoiar vocês dois."
      showSkip={true}
      onSkip={handleNext}
      onNext={handleNext}
      nextDisabled={!caregiverRelationship}
    >
      <View style={{ paddingTop: 8 }}>
        <OnboardingInput
          label="Nome de quem você cuida (opcional)"
          placeholder="Ex: Nami, minha mãe, Zoro..."
          value={caregiverName || ''}
          onChangeText={(text) => setDetails({ caregiverName: text })}
          hint="Vou usar esse nome nas nossas conversas — fica mais próximo."
        />

        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Como você está envolvido(a)?</Text>
        {INVOLVEMENT_OPTIONS.map((opt) => (
          <OptionCard
            key={opt.title}
            title={opt.title}
            description={opt.desc}
            size="small"
            selected={caregiverRelationship === opt.title}
            onPress={() => setDetails({ caregiverRelationship: opt.title })}
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
