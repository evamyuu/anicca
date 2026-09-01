/**
 * @fileoverview User Profile Screen.
 * Configures basic patient data, Caregiver and Doctor connections, and Public/Private Network toggles (Rights).
 *
 * @module pages/profile/index
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch, Modal, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, User, Camera, ShieldCheck, FileBadge, Stethoscope, HeartHandshake, Scale, Settings, X } from 'lucide-react-native';

import { useOnboardingStore, useAuthStore } from '@/shared/lib/zustand-persist';
import { httpClient } from '@/shared/api/http-client';
import { GradientButton } from '@/shared/ui/GradientButton';
import { BRAND } from '@/shared/constants/brand-colors.const';

export default function ProfileScreen() {
  const router = useRouter();
  const { name, cpf, dateOfBirth, cancerType, profileType, treatmentModality } = useOnboardingStore();
  
  const [isSUS, setIsSUS] = useState(treatmentModality === 'sus');

  const displayRole = profileType === 'caregiver' ? 'Cuidador(a)' : profileType === 'doctor' ? 'Médico(a)' : 'Paciente';
  
  let displayDob = 'Não informado';
  if (dateOfBirth) {
    const parts = dateOfBirth.split('-');
    if (parts.length === 3) displayDob = `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  let displayCpf = 'Não informado';
  if (cpf && cpf.length === 14) {
    displayCpf = `***.${cpf.slice(4, 7)}.${cpf.slice(8, 11)}-**`;
  }

  const { userId } = useAuthStore();
  const [linkedDoctor, setLinkedDoctor] = useState(true); // Default visual state, could be dynamic later
  const [linkedCaregiver, setLinkedCaregiver] = useState(true);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color={BRAND.SURFACE.CARD} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meu Perfil</Text>
          <TouchableOpacity onPress={() => router.push('/profile/settings')} style={styles.backButton}>
            <Settings size={24} color={BRAND.SURFACE.CARD} />
          </TouchableOpacity>
        </View>

        {/* Top Dark Area (Avatar) */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <User size={40} color={BRAND.PRIMARY[400]} />
            <TouchableOpacity style={styles.avatarEditBtn} activeOpacity={0.8}>
              <Camera size={16} color={BRAND.SURFACE.CARD} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{name || 'Usuário'}</Text>
          <Text style={styles.userSub}>{displayRole} {cancerType ? `• Câncer de ${cancerType.charAt(0).toUpperCase() + cancerType.slice(1)}` : ''}</Text>
        </View>

        {/* Content Area (Light) */}
        <View style={styles.contentArea}>
          
          {/* Security Banner */}
          <View style={styles.securityBanner}>
            <ShieldCheck size={20} color={BRAND.PRIMARY[400]} />
            <Text style={styles.securityText}>Seus dados estão protegidos por criptografia de ponta a ponta (LGPD).</Text>
          </View>

          {/* Section: Basic Data */}
          <Text style={styles.sectionTitle}>Dados Básicos</Text>
          <View style={styles.cardGroup}>
            <View style={styles.cardRow}>
              <Text style={styles.rowLabel}>CPF</Text>
              <Text style={styles.rowValue}>{displayCpf}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.cardRow}>
              <Text style={styles.rowLabel}>Data de Nasc.</Text>
              <Text style={styles.rowValue}>{displayDob}</Text>
            </View>
          </View>

          {/* Section: Connections (Caregiver / Doctor) */}
          <Text style={styles.sectionTitle}>Rede de Apoio</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity 
              style={styles.cardRowAction} 
              activeOpacity={0.7}
              onPress={() => router.push('/profile/caregiver')}
            >
              <View style={styles.rowLeft}>
                <HeartHandshake size={20} color={BRAND.SECONDARY.DEFAULT} style={{marginRight: 12}} />
                <View>
                  <Text style={styles.connectionTitle}>Meus Cuidadores</Text>
                  <Text style={styles.connectionSub}>Gerencie seus cuidadores</Text>
                </View>
              </View>
              <Text style={styles.actionChevron}>{'>'}</Text>
            </TouchableOpacity>
            
            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.cardRowAction} 
              activeOpacity={0.7}
              onPress={() => router.push('/profile/doctor')}
            >
              <View style={styles.rowLeft}>
                <Stethoscope size={20} color={BRAND.PRIMARY[400]} style={{marginRight: 12}} />
                <View>
                  <Text style={styles.connectionTitle}>Equipe Médica</Text>
                  <Text style={styles.connectionSub}>Gerencie seus médicos</Text>
                </View>
              </View>
              <Text style={styles.actionChevron}>{'>'}</Text>
            </TouchableOpacity>
          </View>

          {/* Removed internal Modal entirely */}

          {/* Section: Healthcare System & Rights */}
          <Text style={styles.sectionTitle}>Sistema de Saúde e Direitos</Text>
          
          <View style={styles.cardGroup}>
            <View style={styles.cardRowToggle}>
              <View style={{flex: 1}}>
                <Text style={styles.rowLabelDark}>Tratamento pelo SUS</Text>
                <Text style={styles.rowHelper}>Adapta leis e prazos (ex: Lei dos 60 dias)</Text>
              </View>
              <Switch 
                value={isSUS}
                onValueChange={setIsSUS}
                trackColor={{ false: BRAND.SURFACE.BORDER, true: BRAND.SECONDARY.DEFAULT }}
                thumbColor={BRAND.SURFACE.CARD}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.rightsBanner} activeOpacity={0.9}>
            <View style={styles.rightsIconBox}>
              <Scale size={24} color={BRAND.SURFACE.CARD} />
            </View>
            <View style={{flex: 1}}>
               <Text style={styles.rightsTitle}>Meus Direitos</Text>
               <Text style={styles.rightsSubtitle}>Isenção de IR, Saque FGTS, Auxílio-Doença.</Text>
            </View>
            <Text style={{fontSize: 20, color: BRAND.SURFACE.CARD, fontWeight: 'bold'}}>{'>'}</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BRAND.PRIMARY.DEFAULT,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BRAND.SURFACE.CARD,
  },
  avatarSection: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: BRAND.PRIMARY[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  avatarEditBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: BRAND.SECONDARY.DEFAULT,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: BRAND.PRIMARY.DEFAULT,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: BRAND.SURFACE.CARD,
    marginBottom: 4,
  },
  userSub: {
    fontSize: 16,
    color: BRAND.PRIMARY[300],
  },
  contentArea: {
    flex: 1,
    backgroundColor: BRAND.BG.LIGHT,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND.SURFACE.CARD,
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: BRAND.SURFACE.BORDER,
  },
  securityText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: BRAND.PRIMARY[400],
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BRAND.PRIMARY.DEFAULT,
    marginBottom: 12,
    marginLeft: 4,
  },
  cardGroup: {
    backgroundColor: BRAND.SURFACE.CARD,
    borderRadius: 24,
    marginBottom: 24,
    shadowColor: BRAND.PRIMARY[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  cardRowAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  cardRowToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 16,
    color: BRAND.PRIMARY[400],
    fontWeight: '500',
  },
  rowLabelDark: {
    fontSize: 16,
    color: BRAND.PRIMARY.DEFAULT,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  rowHelper: {
    fontSize: 16,
    color: BRAND.PRIMARY[400],
  },
  rowValue: {
    fontSize: 16,
    color: BRAND.PRIMARY.DEFAULT,
    fontWeight: 'bold',
  },
  connectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BRAND.PRIMARY.DEFAULT,
    marginBottom: 2,
  },
  connectionSub: {
    fontSize: 16,
    color: BRAND.PRIMARY[400],
  },
  actionChevron: {
    fontSize: 20,
    color: BRAND.PRIMARY[400],
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: BRAND.PRIMARY[100],
    marginHorizontal: 20,
  },
  rightsBanner: {
    flexDirection: 'row',
    backgroundColor: BRAND.SECONDARY.DEFAULT,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: BRAND.SECONDARY.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  rightsIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  rightsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BRAND.SURFACE.CARD,
    marginBottom: 4,
  },
  rightsSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: BRAND.SURFACE.CARD,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 20,
    color: BRAND.PRIMARY.DEFAULT,
    marginBottom: 8,
  },
  modalSub: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    color: BRAND.PRIMARY[400],
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: BRAND.SURFACE.BORDER,
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Nunito_400Regular',
    color: BRAND.PRIMARY.DEFAULT,
    marginBottom: 20,
  },
  inputError: {
    borderColor: BRAND.ERROR.DEFAULT,
  },
  feedbackBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  feedbackSuccess: {
    backgroundColor: BRAND.BG.LIGHT,
    borderWidth: 1,
    borderColor: BRAND.PRIMARY[300],
  },
  feedbackError: {
    backgroundColor: BRAND.SECONDARY[100],
    borderWidth: 1,
    borderColor: BRAND.SECONDARY[300],
  },
  feedbackText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    textAlign: 'center',
  },
  feedbackTextSuccess: {
    color: BRAND.SURFACE.BORDER_DARK,
  },
  feedbackTextError: {
    color: BRAND.ERROR.DARK,
  },
  modalActions: {
    marginTop: 10,
  },
  loadingWrapper: {
    height: 41,
    justifyContent: 'center',
    alignItems: 'center',
  },
});