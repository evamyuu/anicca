/**
 * @fileoverview Implementation of PermissionsStep.
 *
 * @module pages/onboarding/steps/PermissionsStepx
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, Camera, Calendar, Watch, Microscope } from 'lucide-react-native';

import { BaseStepLayout } from '@/shared/ui/Onboarding/BaseStepLayout';
import { ToggleRow } from '@/shared/ui/Onboarding/ToggleRow';
import { useOnboardingStore } from '@/shared/lib/zustand-persist';

export function PermissionsStep() {
  const router = useRouter();
  const { 
    consentNotifications, 
    consentCamera, 
    consentCalendar, 
    consentWatch, 
    lgpdResearchConsent,
    setConsent,
    profileType,
    totalSteps
  } = useOnboardingStore();

  const handleNext = () => {
    router.push('/(auth)/login?isRegister=true');
  };

  const isDoctor = profileType === 'doctor';

  return (
    <BaseStepLayout
      currentStep={totalSteps}
      totalSteps={totalSteps}
      aniText="Seus dados de saúde merecem cuidado especial. Tudo o que você compartilha é criptografado, armazenado no Brasil e permanece sob o seu controle. Você decide o que a Ani pode acessar — e pode mudar isso a qualquer momento em Configurações."
      showSkip={false}
      nextLabel="Concordar e continuar"
      onNext={handleNext}
    >
      <View style={{ paddingTop: 8 }}>
        <Text style={styles.sectionTitle}>Permissões do dispositivo</Text>
        
        <ToggleRow
          icon={<Bell size={18} color="#9C8880" />}
          title="Notificações essenciais"
          description="Lembretes de medicamentos, consultas e alertas"
          value={consentNotifications}
          onValueChange={(val) => setConsent('notifications', val)}
        />

        {!isDoctor && (
          <ToggleRow
            icon={<Camera size={18} color="#9C8880" />}
            title="Câmera e Fotos"
            description="Para fotografar laudos — leitura automática por OCR"
            value={consentCamera}
            onValueChange={(val) => setConsent('camera', val)}
          />
        )}

        <ToggleRow
          icon={<Calendar size={18} color="#9C8880" />}
          title="Sincronizar Calendário"
          description="Exportar consultas e tratamentos para sua agenda"
          value={consentCalendar}
          onValueChange={(val) => setConsent('calendar', val)}
        />

        {!isDoctor && (
          <ToggleRow
            icon={<Watch size={18} color="#9C8880" />}
            title="Smartwatch"
            description="Passos, sono e frequência cardíaca via Google Health Connect"
            value={consentWatch}
            onValueChange={(val) => setConsent('watch', val)}
          />
        )}

        {!isDoctor && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 4 }]}>Pesquisa científica</Text>
            <ToggleRow
              icon={<Microscope size={18} color="#9C8880" />}
              title="Contribuir com pesquisa médica"
              description="Compartilhe seus dados de saúde de forma 100% anônima. Isso ajuda nossa IA a descobrir padrões, melhorar os comparativos clínicos e ajudar no avanço da pesquisa oncológica."
              value={lgpdResearchConsent}
              onValueChange={(val) => setConsent('research', val)}
            />
          </>
        )}
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
