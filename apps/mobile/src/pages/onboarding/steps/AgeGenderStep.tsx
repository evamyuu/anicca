/**
 * @fileoverview Implementation of AgeGenderStep.
 *
 * @module pages/onboarding/steps/AgeGenderStepx
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { BaseStepLayout } from '@/shared/ui/Onboarding/BaseStepLayout';
import { OnboardingInput } from '@/shared/ui/Onboarding/OnboardingInput';
import { Tile } from '@/shared/ui/Onboarding/Tile';
import { useOnboardingStore } from '@/shared/lib/zustand-persist';

export function AgeGenderStep() {
  const router = useRouter();
  const { birthYear, gender, profileType, setDetails, totalSteps } = useOnboardingStore();

  const handleNext = () => {
    if (profileType === 'patient') {
      router.push('/(onboarding)/step-4-cancer-patient');
    } else if (profileType === 'caregiver') {
      router.push('/(onboarding)/step-4-caregiver-info');
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  return (
    <BaseStepLayout
      currentStep={3}
      totalSteps={totalSteps}
      aniText="Mais uma coisa — essas informações me ajudam a adaptar a experiência e o mapa corporal para você."
      showSkip={true}
      onSkip={handleSkip}
      onNext={handleNext}
    >
      <View style={{ paddingTop: 8 }}>
        <Text style={styles.sectionTitle}>Ano de nascimento</Text>
        <OnboardingInput
          placeholder="Ex: 1975"
          keyboardType="numeric"
          maxLength={4}
          value={birthYear || ''}
          onChangeText={(text) => setDetails({ birthYear: text.replace(/[^0-9]/g, '') })}
        />

        <Text style={[styles.sectionTitle, { marginTop: 4 }]}>Gênero</Text>
        <View style={styles.gridRow}>
          <Tile 
            title="Feminino" 
            selected={gender === 'Feminino'} 
            onPress={() => setDetails({ gender: 'Feminino' })} 
          />
          <Tile 
            title="Masculino" 
            selected={gender === 'Masculino'} 
            onPress={() => setDetails({ gender: 'Masculino' })} 
          />
        </View>
        <View style={styles.gridRow}>
          <Tile 
            title="Não-binário" 
            selected={gender === 'Não-binário'} 
            onPress={() => setDetails({ gender: 'Não-binário' })} 
          />
          <Tile 
            title="Prefiro não dizer" 
            selected={gender === 'Prefiro não dizer'} 
            onPress={() => setDetails({ gender: 'Prefiro não dizer' })} 
          />
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
  gridRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  }
});
