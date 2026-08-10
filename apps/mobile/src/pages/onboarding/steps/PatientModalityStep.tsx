/**
 * @fileoverview Implementation of PatientModalityStep.
 *
 * @module pages/onboarding/steps/PatientModalityStepx
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { BaseStepLayout } from '@/shared/ui/Onboarding/BaseStepLayout';
import { Tile } from '@/shared/ui/Onboarding/Tile';
import { OnboardingInput } from '@/shared/ui/Onboarding/OnboardingInput';
import { useOnboardingStore } from '@/shared/lib/zustand-persist';

export function PatientModalityStep() {
  const router = useRouter();
  const { careModality, zipCode, setDetails, totalSteps } = useOnboardingStore();

  const handleNext = () => {
    router.push('/(onboarding)/step-7-phase-patient');
  };

  return (
    <BaseStepLayout
      currentStep={6}
      totalSteps={totalSteps}
      aniText="Onde você está se tratando? Isso me ajuda a mostrar as informações certas para o seu caso."
      showSkip={true}
      onSkip={handleNext}
      onNext={handleNext}
    >
      <View style={{ paddingTop: 8 }}>
        <Text style={styles.sectionTitle}>Modalidade de atendimento</Text>
        
        <View style={styles.gridRow}>
          <Tile 
            title="SUS" 
            description="Sistema Único de Saúde"
            selected={careModality === 'SUS'} 
            onPress={() => setDetails({ careModality: 'SUS' })} 
          />
          <Tile 
            title="Convênio" 
            description="Plano de saúde"
            selected={careModality === 'Convênio'} 
            onPress={() => setDetails({ careModality: 'Convênio' })} 
          />
        </View>
        <View style={styles.gridRow}>
          <Tile 
            title="Particular" 
            description="Sem plano"
            selected={careModality === 'Particular'} 
            onPress={() => setDetails({ careModality: 'Particular' })} 
          />
          <Tile 
            title="Misto" 
            description="SUS e convênio"
            selected={careModality === 'Misto'} 
            onPress={() => setDetails({ careModality: 'Misto' })} 
          />
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 14 }]}>
          CEP <Text style={styles.optionalText}>(opcional)</Text>
        </Text>
        <OnboardingInput
          placeholder="00000-000"
          keyboardType="numeric"
          maxLength={9}
          value={zipCode || ''}
          onChangeText={(text) => setDetails({ zipCode: text })}
          hint="Para encontrar centros de tratamento próximos e calcular elegibilidade para TFD."
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
  },
  gridRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  }
});
