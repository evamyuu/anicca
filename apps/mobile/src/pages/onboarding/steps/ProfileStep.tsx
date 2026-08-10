/**
 * @fileoverview Implementation of ProfileStep.
 *
 * @module pages/onboarding/steps/ProfileStepx
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { User, Heart, Stethoscope } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { BaseStepLayout } from '@/shared/ui/Onboarding/BaseStepLayout';
import { OptionCard } from '@/shared/ui/Onboarding/OptionCard';
import { useOnboardingStore } from '@/shared/lib/zustand-persist';
import type { UserProfileType } from '@anicca/types';

export function ProfileStep() {
  const router = useRouter();
  const { profileType, setProfileType, setDetails } = useOnboardingStore();

  const handleSelect = (type: UserProfileType) => {
    const totalSteps = type === 'patient' ? 10 : type === 'caregiver' ? 9 : 6;
    setProfileType(type);
    setDetails({ totalSteps });
    
    setTimeout(() => {
      router.push('/(onboarding)/step-2-name');
    }, 360);
  };

  return (
    <BaseStepLayout
      currentStep={1}
      totalSteps={useOnboardingStore((s) => s.totalSteps)}
      aniText="Me conta quem você é para que eu possa adaptar tudo da melhor forma."
      onBack={() => router.push('/(onboarding)/step-1-welcome')}
      showSkip={false}
      hideFooter={true}
    >
      <Text style={styles.sectionTitle}>Você está aqui como:</Text>

      <OptionCard
        title="Sou Paciente"
        description="Estou em tratamento ou acompanhamento"
        icon={<User size={20} color={profileType === 'patient' ? '#FFFFFF' : '#9C8880'} />}
        selected={profileType === 'patient'}
        onPress={() => handleSelect('patient')}
      />

      <OptionCard
        title="Sou Cuidador(a)"
        description="Apoio um familiar ou amigo"
        icon={<Heart size={20} color={profileType === 'caregiver' ? '#FFFFFF' : '#9C8880'} />}
        selected={profileType === 'caregiver'}
        onPress={() => handleSelect('caregiver')}
      />

      <OptionCard
        title="Sou Médico(a) ou Enfermeiro(a)"
        description="Acesso clínico e monitoramento"
        icon={<Stethoscope size={20} color={profileType === 'doctor' ? '#FFFFFF' : '#9C8880'} />}
        selected={profileType === 'doctor'}
        onPress={() => handleSelect('doctor')}
        badge={<Text style={styles.badgeText}>Requer verificação CRM/Coren</Text>}
      />

      <Text style={styles.hint}>Toque em uma opção para continuar</Text>
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
  hint: {
    textAlign: 'center',
    fontSize: 11.5,
    color: '#9C8880',
    marginTop: 10,
  },
  badgeText: {
    fontSize: 11,
    color: '#9C8880',
  }
});
