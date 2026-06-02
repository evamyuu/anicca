/**
 * @fileoverview Onboarding Step 2 — Profile type selection.
 *
 * @module pages/onboarding/steps/ProfileStep
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useOnboardingStore } from '@/shared/lib/zustand-persist';
import type { UserProfileType } from '@anicca/types';
import { BRAND } from '@/shared/constants/brand-colors.const';
import { Button } from '@/shared/ui/Button';
import { SelectionCard } from '@/shared/ui/SelectionCard';

const PROFILES: Array<{ type: UserProfileType; label: string; emoji: string; desc: string }> = [
  { type: 'patient', label: 'Sou o paciente', emoji: '🙋', desc: 'Estou em tratamento ou fui diagnosticado(a)' },
  { type: 'caregiver', label: 'Sou cuidador(a)', emoji: '🤝', desc: 'Cuido de alguém em tratamento oncológico' },
  { type: 'doctor', label: 'Sou médico(a)', emoji: '👩‍⚕️', desc: 'Sou profissional de saúde oncológica' },
];

/**
 * Renders the second step of the onboarding flow where the user selects
 * their profile type (patient, caregiver, or doctor).
 */
export function ProfileStep() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const setProfileType = useOnboardingStore((s) => s.setProfileType);
  const nextStep = useOnboardingStore((s) => s.nextStep);
  
  const [selected, setSelected] = useState<UserProfileType | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    setProfileType(selected);
    nextStep();
    router.push('/(onboarding)/step-3-info');
  };

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.header}>
        <Text style={styles.stepIndicator}>ETAPA 2 DE 7</Text>
        <Text style={styles.title}>
          Como você quer{'\n'}usar a Anicca?
        </Text>
      </View>

      <View style={styles.list}>
        {PROFILES.map((profile) => (
          <SelectionCard
            key={profile.type}
            title={profile.label}
            description={profile.desc}
            icon={profile.emoji}
            isSelected={selected === profile.type}
            onPress={() => setSelected(profile.type)}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Button
          variant="secondary"
          size="lg"
          disabled={!selected}
          onPress={handleContinue}
          style={{ width: '100%' }}
        >
          Continuar
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BRAND.BG.LIGHT,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 32,
    marginBottom: 32,
  },
  stepIndicator: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: BRAND.PRIMARY[400],
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 32,
    color: BRAND.PRIMARY.DEFAULT,
    lineHeight: 40,
  },
  list: {
    flex: 1,
    paddingHorizontal: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
});
