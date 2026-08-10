/**
 * @fileoverview Implementation of DoctorCrmStep.
 *
 * @module pages/onboarding/steps/DoctorCrmStepx
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

const REGISTRY_OPTIONS = [
  'Médico(a) — CRM',
  'Enfermeiro(a) — Coren',
  'Outro profissional de saúde'
];

export function DoctorCrmStep() {
  const router = useRouter();
  const { crmNumber, setDetails, totalSteps } = useOnboardingStore();
  const [registryType, setRegistryType] = React.useState<string | null>(null);
  const [stateCode, setStateCode] = React.useState<string>('');

  const handleNext = () => {
    router.push('/(onboarding)/step-4-specialty-doctor');
  };

  return (
    <BaseStepLayout
      currentStep={3}
      totalSteps={totalSteps}
      aniText="Para liberar o painel clínico completo, preciso verificar seu registro. Isso garante que os dados dos pacientes fiquem seguros."
      showSkip={false}
      onNext={handleNext}
      nextDisabled={!registryType || !crmNumber || !stateCode}
    >
      <View style={{ paddingTop: 8 }}>
        <Text style={styles.sectionTitle}>Tipo de registro</Text>
        {REGISTRY_OPTIONS.map((opt) => (
          <OptionCard
            key={opt}
            title={opt}
            size="small"
            selected={registryType === opt}
            onPress={() => setRegistryType(opt)}
          />
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Número do registro</Text>
        <OnboardingInput
          placeholder="Ex: 12345"
          keyboardType="numeric"
          value={crmNumber || ''}
          onChangeText={(text) => setDetails({ crmNumber: text })}
        />

        <Text style={styles.sectionTitle}>Estado de atuação</Text>
        <OnboardingInput
          placeholder="Ex: SP, RJ, MG"
          maxLength={2}
          autoCapitalize="characters"
          value={stateCode}
          onChangeText={setStateCode}
        />

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Verificação em até 24 horas via CFM/Cofen. Enquanto isso, você pode explorar o app com acesso parcial.
          </Text>
        </View>
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
  infoCard: {
    backgroundColor: '#FFF0E8',
    borderWidth: 1.5,
    borderColor: '#FF9A5C',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#403229',
    lineHeight: 18,
  }
});
