/**
 * @fileoverview Implementation of CaregiverHome.
 *
 * @module features/home/ui/CaregiverHomex
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, Modal, TextInput, KeyboardAvoidingView, Image } from 'react-native';
import { Search, Sparkles, AlertTriangle, Pill, Thermometer, FileText, Calendar, Camera, User, X, Mic, CheckCircle2, HeartHandshake } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { useAuthStore, useOnboardingStore } from '@/shared/lib/zustand-persist';
import { getTodayRoutine } from '@/shared/api/routine';
import { BRAND } from '@/shared/constants/brand-colors.const';

export function CaregiverHome() {
  const router = useRouter();
  const [commandCenterOpen, setCommandCenterOpen] = useState(false);
  const [commandInput, setCommandInput] = useState('');
  
  const userId = useAuthStore(s => s.userId);
  const { 
    name, 
    caregiverName,
    cancerType, 
    journeyPhase, 
    caregiverPriorities
  } = useOnboardingStore();

  const primaryPriority = caregiverPriorities?.[0];
  const patientFirstName = name || 'paciente';

  const { data: routine } = useQuery({
    queryKey: ['routine', 'today', userId],
    queryFn: () => getTodayRoutine(userId!),
    enabled: !!userId,
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* TOP HEADER */}
        <LinearGradient 
          colors={[BRAND.AUX.GREEN, BRAND.AUX.GREEN]} // Different color for Caregiver
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.headerArea}
        >
          <View style={styles.profileRow}>
            <TouchableOpacity 
              style={[styles.avatarPlaceholder, { backgroundColor: BRAND.AUX.GREEN, borderWidth: 1, borderColor: BRAND.PRIMARY[400] }]} 
              activeOpacity={0.8}
              onPress={() => router.push('/profile')}
            >
              <User size={24} color={BRAND.PRIMARY[50]} />
            </TouchableOpacity>
            <View style={styles.profileTextContainer}>
              <Text style={styles.greetingText}>OLÁ, CUIDADOR(A)</Text>
              <Text style={styles.nameText}>{caregiverName || 'Bem-vindo'}</Text>
              <View style={styles.badge}>
                <HeartHandshake size={12} color={BRAND.PRIMARY[300]} style={{marginRight: 4}} />
                <Text style={styles.badgeText}>Apoiando {patientFirstName}</Text>
              </View>
            </View>
          </View>

          {/* Search Bar - Triggers Command Center */}
          <TouchableOpacity 
            style={styles.searchBar} 
            activeOpacity={0.9}
            onPress={() => setCommandCenterOpen(true)}
          >
            <Sparkles size={16} color={BRAND.SECONDARY.DEFAULT} style={{marginRight: 8}} />
            <Text style={styles.searchText}>Pergunte sobre {patientFirstName}...</Text>
            <Search size={16} color={BRAND.PRIMARY[400]} style={{marginLeft: 'auto'}} />
          </TouchableOpacity>

        </LinearGradient>

        <View style={styles.bodyArea}>
          
          {/* Daily AI Summary Card */}
          <View style={styles.summaryCard}>
            <Sparkles size={20} color={BRAND.SECONDARY.DEFAULT} style={{marginTop: 2}} />
            <Text style={styles.summaryText}>
              A jornada de cuidado continua. Lembre-se de registrar a rotina de {patientFirstName} para manter a equipe informada.
            </Text>
          </View>

          {/* Action Grid (Dynamic highlights based on caregiver priorities) */}
          <View style={styles.actionGrid}>
            
            <TouchableOpacity 
              style={primaryPriority === 'Acompanhar sintomas e bem-estar' ? styles.actionCardOrange : styles.actionCardWhite} 
              onPress={() => router.push('/(tabs)/body-map')}
            >
              <View style={primaryPriority === 'Acompanhar sintomas e bem-estar' ? styles.iconCircleTranslucentOrange : styles.iconCircleBeige}>
                <Thermometer size={20} color={primaryPriority === 'Acompanhar sintomas e bem-estar' ? BRAND.SURFACE.CARD : BRAND.PRIMARY.DEFAULT} />
              </View>
              <Text style={primaryPriority === 'Acompanhar sintomas e bem-estar' ? styles.actionCardTitleWhite : styles.actionCardTitleDark}>Sintomas</Text>
              <Text style={primaryPriority === 'Acompanhar sintomas e bem-estar' ? styles.actionCardSubtitleLight : styles.actionCardSubtitle}>De {patientFirstName}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={primaryPriority === 'Organizar rotina de medicamentos' ? styles.actionCardOrange : styles.actionCardWhite} 
              onPress={() => router.push('/(tabs)/routine')}
            >
              <View style={primaryPriority === 'Organizar rotina de medicamentos' ? styles.iconCircleTranslucentOrange : styles.iconCircleBeige}>
                <Pill size={20} color={primaryPriority === 'Organizar rotina de medicamentos' ? BRAND.SURFACE.CARD : BRAND.PRIMARY.DEFAULT} />
              </View>
              <Text style={primaryPriority === 'Organizar rotina de medicamentos' ? styles.actionCardTitleWhite : styles.actionCardTitleDark}>Medicamentos</Text>
              <Text style={primaryPriority === 'Organizar rotina de medicamentos' ? styles.actionCardSubtitleLight : styles.actionCardSubtitle}>Pendências</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={primaryPriority === 'Encontrar apoio emocional para mim' ? styles.actionCardBrown : styles.actionCardWhite} 
            >
              <View style={primaryPriority === 'Encontrar apoio emocional para mim' ? styles.iconCircleTranslucentBrown : styles.iconCircleBeige}>
                <HeartHandshake size={20} color={primaryPriority === 'Encontrar apoio emocional para mim' ? BRAND.SURFACE.BORDER : BRAND.PRIMARY.DEFAULT} />
              </View>
              <Text style={primaryPriority === 'Encontrar apoio emocional para mim' ? styles.actionCardTitleLight : styles.actionCardTitleDark}>Bem-estar</Text>
              <Text style={primaryPriority === 'Encontrar apoio emocional para mim' ? styles.actionCardSubtitleBrown : styles.actionCardSubtitle}>Apoio ao cuidador</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCardWhite}>
              <View style={styles.iconCircleBeige}><Calendar size={20} color={BRAND.PRIMARY.DEFAULT} /></View>
              <Text style={styles.actionCardTitleDark}>Agenda</Text>
              <Text style={styles.actionCardSubtitle}>Consultas</Text>
            </TouchableOpacity>

          </View>

          {/* Timeline do Paciente */}
          <TouchableOpacity style={styles.card} activeOpacity={0.8}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={styles.iconCircleBeige}><Calendar size={24} color={BRAND.PRIMARY.DEFAULT} /></View>
              <View style={{flex: 1, marginLeft: 16}}>
                <Text style={styles.appointmentTitle}>Jornada de {patientFirstName}</Text>
                <Text style={styles.appointmentDesc}>Fase atual: {journeyPhase || 'Não informado'}</Text>
              </View>
              <Text style={{fontSize: 20, color: BRAND.PRIMARY[400], fontWeight: 'bold'}}>{'>'}</Text>
            </View>
          </TouchableOpacity>

          <View style={{height: 100}} />
        </View>
      </ScrollView>

      {/* Command Center Modal (GenUI) */}
      <Modal visible={commandCenterOpen} animationType="fade" transparent>
        <KeyboardAvoidingView style={styles.commandModalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.commandContent}>
            <View style={styles.commandHeader}>
              <Text style={styles.commandTitle}>Assistente Ani</Text>
              <TouchableOpacity onPress={() => { setCommandCenterOpen(false); setCommandInput(''); }} style={styles.commandCloseBtn}>
                <X size={20} color={BRAND.PRIMARY[400]} />
              </TouchableOpacity>
            </View>
            <View style={styles.commandInputRow}>
              <Sparkles size={20} color={BRAND.SECONDARY.DEFAULT} />
              <TextInput 
                style={styles.commandInput}
                placeholder={`Ex: Quais os efeitos do remédio do ${patientFirstName}?`}
                placeholderTextColor={BRAND.PRIMARY[400]}
                autoFocus
                value={commandInput}
                onChangeText={setCommandInput}
              />
              <TouchableOpacity>
                <Mic size={20} color={BRAND.PRIMARY[400]} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BRAND.AUX.GREEN, // Dark Green
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: BRAND.BG.LIGHT,
  },
  headerArea: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 24 : 10,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: BRAND.PRIMARY[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileTextContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BRAND.PRIMARY[300],
    letterSpacing: 1,
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BRAND.SURFACE.CARD,
    marginBottom: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND.SURFACE.CARD_DARK, 
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 16,
    color: BRAND.SURFACE.BORDER,
    fontWeight: '600',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    height: 44,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  searchText: {
    color: BRAND.PRIMARY[300],
    fontSize: 16,
  },
  bodyArea: {
    flex: 1,
    paddingHorizontal: 24,
    marginTop: -20,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: BRAND.PRIMARY[100],
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  summaryText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: BRAND.PRIMARY.DEFAULT,
    lineHeight: 20,
    fontWeight: '500',
  },
  card: {
    backgroundColor: BRAND.SURFACE.CARD,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: BRAND.PRIMARY[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionCardWhite: {
    width: '48%',
    backgroundColor: BRAND.SURFACE.CARD,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    shadowColor: BRAND.PRIMARY[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  actionCardOrange: {
    width: '48%',
    backgroundColor: BRAND.SECONDARY.DEFAULT,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    shadowColor: BRAND.SECONDARY.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 2,
  },
  actionCardBrown: {
    width: '48%',
    backgroundColor: BRAND.PRIMARY.DEFAULT,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
  },
  iconCircleBeige: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BRAND.PRIMARY[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconCircleTranslucentOrange: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconCircleTranslucentBrown: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionCardTitleDark: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BRAND.PRIMARY.DEFAULT,
    marginBottom: 4,
  },
  actionCardTitleWhite: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BRAND.SURFACE.CARD,
    marginBottom: 4,
  },
  actionCardTitleLight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BRAND.SURFACE.CARD,
    marginBottom: 4,
  },
  actionCardSubtitle: {
    fontSize: 16,
    color: BRAND.PRIMARY[400],
  },
  actionCardSubtitleLight: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  actionCardSubtitleBrown: {
    fontSize: 16,
    color: BRAND.PRIMARY[300],
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BRAND.PRIMARY.DEFAULT,
    marginBottom: 2,
  },
  appointmentDesc: {
    fontSize: 16,
    color: BRAND.PRIMARY[400],
  },
  commandModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(74, 57, 49, 0.95)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  commandContent: {
    backgroundColor: BRAND.BG.LIGHT,
    borderRadius: 32,
    padding: 24,
  },
  commandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  commandTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BRAND.PRIMARY.DEFAULT,
  },
  commandCloseBtn: {
    padding: 4,
  },
  commandInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND.SURFACE.CARD,
    borderRadius: 24,
    height: 56,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: BRAND.SURFACE.BORDER,
  },
  commandInput: {
    flex: 1,
    marginHorizontal: 12,
    fontSize: 16,
    color: BRAND.PRIMARY.DEFAULT,
  }
});