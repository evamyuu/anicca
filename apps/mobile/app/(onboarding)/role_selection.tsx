/**
 * @fileoverview Role Selection Screen for new users (Patient, Caregiver, Doctor).
 *
 * @module pages/onboarding/role_selection
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { Hand, HeartHandshake, Stethoscope, ArrowRight, ArrowLeft } from 'lucide-react-native';

import { Button } from '../../src/shared/ui/Button';
import { useOnboardingStore } from '../../src/shared/lib/zustand-persist';

type Role = 'PATIENT' | 'CAREGIVER' | 'DOCTOR' | null;

export default function RoleSelectionScreen() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role>(null);

  const handleContinue = () => {
    if (!selectedRole) return;
    
    // Save to Zustand
    useOnboardingStore.getState().setProfileType(selectedRole.toLowerCase() as any);
    
    // Send to login screen to fill email and pass
    router.push('/(auth)/login'); 
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Voltar">
            <ArrowLeft size={24} color="#5a4a42" />
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <View style={styles.progressDot} />
            <View style={styles.progressDot} />
            <View style={styles.progressDot} />
            <View style={styles.progressDot} />
          </View>
          <Text style={styles.stepText}>1 / 5</Text>
        </View>

        {/* AI Chat Bubble Area */}
        <View style={styles.chatArea}>
          <View style={styles.avatarContainer}>
            <Text style={{fontSize: 24}}>🐱</Text>
          </View>
          <View style={styles.chatBubble}>
            <Text style={styles.chatText}>
              Me conte quem você é para eu adaptar a nossa experiência da melhor forma.
            </Text>
          </View>
        </View>

        {/* Role Cards */}
        <View style={styles.cardsContainer}>
          
          {/* Card: Patient */}
          <TouchableOpacity 
            style={[styles.card, selectedRole === 'PATIENT' && styles.cardSelected]}
            onPress={() => setSelectedRole('PATIENT')}
            accessibilityRole="radio"
            accessibilityState={{ checked: selectedRole === 'PATIENT' }}
          >
            <View style={[styles.iconBox, selectedRole === 'PATIENT' ? styles.iconBoxActive : styles.iconBoxInactive]}>
              <Hand size={24} color={selectedRole === 'PATIENT' ? "#ffffff" : "#a3988e"} />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Sou Paciente</Text>
              <Text style={styles.cardSubtitle}>Estou em tratamento ou acompanhamento</Text>
            </View>
          </TouchableOpacity>

          {/* Card: Caregiver */}
          <TouchableOpacity 
            style={[styles.card, selectedRole === 'CAREGIVER' && styles.cardSelected]}
            onPress={() => setSelectedRole('CAREGIVER')}
            accessibilityRole="radio"
            accessibilityState={{ checked: selectedRole === 'CAREGIVER' }}
          >
            <View style={[styles.iconBox, selectedRole === 'CAREGIVER' ? styles.iconBoxActive : styles.iconBoxInactive]}>
              <HeartHandshake size={24} color={selectedRole === 'CAREGIVER' ? "#ffffff" : "#a3988e"} />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Sou Cuidador(a)</Text>
              <Text style={styles.cardSubtitle}>Apoio um familiar ou amigo</Text>
            </View>
          </TouchableOpacity>

          {/* Card: Doctor */}
          <TouchableOpacity 
            style={[styles.card, selectedRole === 'DOCTOR' && styles.cardSelected]}
            onPress={() => setSelectedRole('DOCTOR')}
            accessibilityRole="radio"
            accessibilityState={{ checked: selectedRole === 'DOCTOR' }}
          >
            <View style={[styles.iconBox, selectedRole === 'DOCTOR' ? styles.iconBoxActive : styles.iconBoxInactive]}>
              <Stethoscope size={24} color={selectedRole === 'DOCTOR' ? "#ffffff" : "#a3988e"} />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Sou Médico(a) / Enfermeiro(a)</Text>
              <Text style={styles.cardSubtitle}>Acesso clínico e monitoramento</Text>
              
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>Requer verificação (CRM/Coren)</Text>
              </View>
            </View>
          </TouchableOpacity>

        </View>

        {/* Footer Action */}
        <View style={styles.footer}>
          <Button 
            title={
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16, marginRight: 8}}>Continuar</Text>
                <ArrowRight size={18} color="white" />
              </View>
            }
            onPress={handleContinue}
            disabled={!selectedRole}
          />
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fbf9f6',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    paddingHorizontal: 20,
  },
  progressDot: {
    height: 4,
    flex: 1,
    backgroundColor: '#e5e0dc',
    borderRadius: 2,
  },
  progressDotActive: {
    backgroundColor: '#f28b50',
  },
  stepText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8c8078',
  },
  chatArea: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 32,
    gap: 16,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4a3931',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chatBubble: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 20,
    borderTopLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chatText: {
    fontSize: 15,
    color: '#3d2b1f',
    lineHeight: 22,
    fontWeight: '500',
  },
  cardsContainer: {
    flex: 1,
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
  },
  cardSelected: {
    borderColor: '#f28b50',
    backgroundColor: '#fffcf9', // Very light orange tint
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconBoxInactive: {
    backgroundColor: '#efe9e4',
  },
  iconBoxActive: {
    backgroundColor: '#f28b50',
  },
  cardTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3d2b1f',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#8c8078',
    lineHeight: 18,
  },
  badgeContainer: {
    marginTop: 10,
    backgroundColor: '#efe9e4',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8c8078',
  },
  footer: {
    marginTop: 'auto',
  }
});
