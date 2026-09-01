/**
 * @fileoverview Implementation of PatientHome.
 *
 * @module features/home/ui/PatientHomex
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, Modal, TextInput, KeyboardAvoidingView, Image } from 'react-native';
import { Search, Sparkles, Scale, AlertTriangle, FlaskConical, Pill, Thermometer, FileText, Calendar, Camera, User, X, Mic, CheckCircle2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { useAuthStore, useOnboardingStore } from '@/shared/lib/zustand-persist';
import { getTodayRoutine } from '@/shared/api/routine';
import { BRAND } from '@/shared/constants/brand-colors.const';

export function PatientHome() {
  const router = useRouter();
  const [commandCenterOpen, setCommandCenterOpen] = useState(false);
  const [commandInput, setCommandInput] = useState('');
  const [genUICard, setGenUICard] = useState<any>(null);
  
  const userId = useAuthStore(s => s.userId);
  const { 
    name, 
    cancerType, 
    journeyPhase, 
    treatmentModality,
    diagnosisDate,
    concerns 
  } = useOnboardingStore();

  const patientName = name || 'Paciente';
  
  const { data: routine } = useQuery({
    queryKey: ['routine', 'today', userId],
    queryFn: () => getTodayRoutine(userId!),
    enabled: !!userId,
  });

  const isSUS = treatmentModality === 'sus';
  const isPrivate = treatmentModality === 'convenio';
  const isMixed = treatmentModality === 'misto';
  
  const has60DaysRight = !!diagnosisDate && (isSUS || isMixed);
  const isTreatmentActive = journeyPhase === 'Tratamento ativo';
  const isWaiting = journeyPhase === 'Aguardando orientações';
  
  const primaryConcern = concerns?.[0];

  const simulateCommandQuery = (text: string) => {
    setCommandInput(text);
  };

  const handleCommandSubmit = () => {
    if (commandInput.trim()) {
      setCommandCenterOpen(false);
      // Pushing to chat with the input as a param to start a conversation
      router.push({ pathname: '/(tabs)/chat', params: { initialQuery: commandInput } });
      setCommandInput('');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* TOP HEADER */}
        <LinearGradient 
          colors={[BRAND.PRIMARY.DEFAULT, BRAND.PRIMARY[400]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.headerArea}
        >
          <View style={styles.profileRow}>
            <TouchableOpacity 
              style={styles.avatarPlaceholder} 
              activeOpacity={0.8}
              onPress={() => router.push('/profile')}
            >
              <User size={24} color={BRAND.PRIMARY[400]} />
            </TouchableOpacity>
            <View style={styles.profileTextContainer}>
              <Text style={styles.greetingText}>OLÁ,</Text>
              <Text style={styles.nameText}>{patientName}</Text>
              <View style={styles.badge}>
                <User size={12} color={BRAND.PRIMARY[300]} style={{marginRight: 4}} />
                <Text style={styles.badgeText}>Paciente • {cancerType || 'Não informado'} • {journeyPhase || 'Não informado'}</Text>
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
            <Text style={styles.searchText}>Navegue com Ani...</Text>
            <Search size={16} color={BRAND.PRIMARY[400]} style={{marginLeft: 'auto'}} />
          </TouchableOpacity>

          {/* Progress Bar (Only if in treatment) */}
          {isTreatmentActive && (
            <View style={styles.progressRow}>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBarFill, { width: '40%' }]} />
              </View>
              <Text style={styles.progressText}>D8/21 • Ciclo 2/6</Text>
            </View>
          )}
        </LinearGradient>

        <View style={styles.bodyArea}>
          
          {/* Daily Summary Card */}
          <View style={styles.summaryCard}>
            <Sparkles size={20} color={BRAND.SECONDARY.DEFAULT} style={{marginTop: 2}} />
            <Text style={styles.summaryText}>
              {isWaiting 
                ? "Estamos analisando seus dados. Que tal conferir o que significa o seu diagnóstico?" 
                : isTreatmentActive 
                  ? "Sua jornada de tratamento está ativa. Não se esqueça de registrar seus medicamentos e sintomas do dia."
                  : "Acompanhamento ativo. Mantenha sua rotina atualizada."}
            </Text>
          </View>

          {/* Law 60 Days / Legal Rights Card */}
          {(isSUS || isMixed) && (
            <TouchableOpacity style={styles.card} activeOpacity={0.8}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Scale size={20} color={BRAND.PRIMARY.DEFAULT} />
                  <Text style={styles.cardTitle}>Seus Direitos no SUS</Text>
                </View>
                {has60DaysRight && (
                  <View style={styles.tagSuccess}>
                    <Text style={styles.tagSuccessText}>✓ Prazo 60 dias ativo</Text>
                  </View>
                )}
              </View>
              {has60DaysRight ? (
                <View style={styles.timelineContainer}>
                  <View style={styles.timelineLine} />
                  <View style={styles.timelineStep}>
                    <View style={styles.timelineDotFinished} />
                    <Text style={styles.timelineTitle}>Diagnóstico</Text>
                    <Text style={styles.timelineDate}>{diagnosisDate}</Text>
                  </View>
                  <View style={styles.timelineStep}>
                    <View style={styles.timelineDotActive} />
                    <Text style={styles.timelineTitle}>Hoje</Text>
                    <Text style={styles.timelineDate}>{new Date().toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})}</Text>
                  </View>
                  <View style={styles.timelineStep}>
                    <View style={styles.timelineDotPending} />
                    <Text style={styles.timelineTitle}>Prazo legal</Text>
                    <Text style={styles.timelineDate}>Aguardando</Text>
                  </View>
                </View>
              ) : (
                <Text style={{color: BRAND.PRIMARY[400], fontSize: 16}}>Você pode gerar petições para defensoria pública aqui caso precise de ajuda com medicamentos.</Text>
              )}
            </TouchableOpacity>
          )}

          {/* Private Insurance Approvals Card */}
          {(isPrivate || isMixed) && (
            <TouchableOpacity style={styles.card} activeOpacity={0.8}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View style={styles.iconCircleBeige}><CheckCircle2 size={24} color={BRAND.PRIMARY.DEFAULT} /></View>
                <View style={{flex: 1, marginLeft: 16}}>
                  <Text style={styles.appointmentTitle}>Tickets e Aprovações</Text>
                  <Text style={styles.appointmentDesc}>Acompanhe suas solicitações com o plano de saúde</Text>
                </View>
                <Text style={{fontSize: 20, color: BRAND.PRIMARY[400], fontWeight: 'bold'}}>{'>'}</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Action Grid (Dynamic highlights) */}
          <View style={styles.actionGrid}>
            
            {/* Meds */}
            <TouchableOpacity 
              style={primaryConcern === 'Organizar rotina de medicamentos' ? styles.actionCardOrange : styles.actionCardWhite} 
              onPress={() => router.push('/(tabs)/routine')}
            >
              <View style={primaryConcern === 'Organizar rotina de medicamentos' ? styles.iconCircleTranslucentOrange : styles.iconCircleBeige}>
                <Pill size={20} color={primaryConcern === 'Organizar rotina de medicamentos' ? BRAND.SURFACE.CARD : BRAND.PRIMARY.DEFAULT} />
              </View>
              <Text style={primaryConcern === 'Organizar rotina de medicamentos' ? styles.actionCardTitleWhite : styles.actionCardTitleDark}>Meus Meds</Text>
              <Text style={primaryConcern === 'Organizar rotina de medicamentos' ? styles.actionCardSubtitleLight : styles.actionCardSubtitle}>
                {routine?.medications.filter((m: any) => m.taken).length || 0} de {routine?.medications.length || 0} tomados
              </Text>
            </TouchableOpacity>

            {/* Symptoms / Body Map */}
            <TouchableOpacity 
              style={isTreatmentActive || primaryConcern === 'Lidar com sintomas do tratamento' ? styles.actionCardOrange : styles.actionCardWhite} 
              onPress={() => router.push('/(tabs)/body-map')}
            >
              <View style={isTreatmentActive || primaryConcern === 'Lidar com sintomas do tratamento' ? styles.iconCircleTranslucentOrange : styles.iconCircleBeige}>
                <Thermometer size={20} color={isTreatmentActive || primaryConcern === 'Lidar com sintomas do tratamento' ? BRAND.SURFACE.CARD : BRAND.PRIMARY.DEFAULT} />
              </View>
              <Text style={isTreatmentActive || primaryConcern === 'Lidar com sintomas do tratamento' ? styles.actionCardTitleWhite : styles.actionCardTitleDark}>Sintomas</Text>
              <Text style={isTreatmentActive || primaryConcern === 'Lidar com sintomas do tratamento' ? styles.actionCardSubtitleLight : styles.actionCardSubtitle}>Registrar agora</Text>
            </TouchableOpacity>

            {/* Exams */}
            <TouchableOpacity 
              style={primaryConcern === 'Entender laudos e exames' ? styles.actionCardBrown : styles.actionCardWhite} 
              onPress={() => router.push('/(tabs)/docs')}
            >
              <View style={primaryConcern === 'Entender laudos e exames' ? styles.iconCircleTranslucentBrown : styles.iconCircleBeige}>
                <FlaskConical size={20} color={primaryConcern === 'Entender laudos e exames' ? BRAND.SURFACE.BORDER : BRAND.PRIMARY.DEFAULT} />
              </View>
              <Text style={primaryConcern === 'Entender laudos e exames' ? styles.actionCardTitleLight : styles.actionCardTitleDark}>Exames</Text>
              <Text style={primaryConcern === 'Entender laudos e exames' ? styles.actionCardSubtitleBrown : styles.actionCardSubtitle}>Meus Documentos</Text>
            </TouchableOpacity>
            
            {/* Journaling / FAQ */}
            <TouchableOpacity style={styles.actionCardWhite}>
              <View style={styles.iconCircleBeige}><FileText size={20} color={BRAND.PRIMARY.DEFAULT} /></View>
              <Text style={styles.actionCardTitleDark}>
                {primaryConcern === 'Apoio emocional' ? 'Journaling' : 'FAQ de Câncer'}
              </Text>
              <Text style={styles.actionCardSubtitle}>Ler e interagir</Text>
            </TouchableOpacity>

          </View>

          {/* Bottom OCR CTA */}
          <TouchableOpacity style={styles.ocrBanner} activeOpacity={0.9} onPress={() => router.push('/(tabs)/docs')}>
            <View style={styles.iconCircleTranslucentOrange}><Camera size={24} color={BRAND.SURFACE.CARD} /></View>
            <View style={{flex: 1, marginLeft: 16}}>
              <Text style={styles.ocrTitle}>Tire foto de um laudo</Text>
              <Text style={styles.ocrSubtitle}>A Ani explica em linguagem simples + sugere perguntas</Text>
            </View>
            <Text style={{fontSize: 20, color: BRAND.SURFACE.CARD, fontWeight: 'bold'}}>{'>'}</Text>
          </TouchableOpacity>
          <View style={{height: 100}} />
        </View>
      </ScrollView>

      {/* Command Center Modal (GenUI) */}
      <Modal visible={commandCenterOpen} animationType="fade" transparent>
        <KeyboardAvoidingView style={styles.commandModalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.commandContent}>
            <View style={styles.commandHeader}>
              <Text style={styles.commandTitle}>Navegue com Ani</Text>
              <TouchableOpacity onPress={() => { setCommandCenterOpen(false); setGenUICard(null); setCommandInput(''); }} style={styles.commandCloseBtn}>
                <X size={20} color={BRAND.PRIMARY[400]} />
              </TouchableOpacity>
            </View>
            {genUICard && (
              <View style={styles.genUICardBox}>
                 <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
                    <FlaskConical size={16} color={BRAND.SECONDARY.DEFAULT} />
                    <Text style={styles.genUICardTitle}>{genUICard.title}</Text>
                 </View>
                 <Text style={styles.genUICardValue}>{genUICard.value}</Text>
                 <TouchableOpacity style={styles.genUIActionBtn}>
                   <Text style={styles.genUIActionBtnText}>{genUICard.action}</Text>
                 </TouchableOpacity>
              </View>
            )}
            <View style={styles.commandInputRow}>
              <Sparkles size={20} color={BRAND.SECONDARY.DEFAULT} />
              <TextInput 
                style={styles.commandInput}
                placeholder="Ex: Como estão meus exames?"
                placeholderTextColor={BRAND.PRIMARY[400]}
                autoFocus
                value={commandInput}
                onChangeText={simulateCommandQuery}
                onSubmitEditing={handleCommandSubmit}
              />
              <TouchableOpacity onPress={handleCommandSubmit}>
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
    backgroundColor: BRAND.PRIMARY.DEFAULT,
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
    color: BRAND.PRIMARY[400],
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
    backgroundColor: BRAND.SURFACE.BORDER_DARK, // Darker brown pill
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
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    marginRight: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: BRAND.SECONDARY.DEFAULT,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 16,
    color: BRAND.PRIMARY[300],
    fontWeight: '600',
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BRAND.PRIMARY.DEFAULT,
    marginLeft: 8,
  },
  tagSuccess: {
    backgroundColor: BRAND.BG.LIGHT,
    borderWidth: 1,
    borderColor: BRAND.SURFACE.BORDER,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagSuccessText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BRAND.PRIMARY.DEFAULT,
  },
  timelineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
    paddingBottom: 20,
  },
  timelineLine: {
    position: 'absolute',
    top: 8,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: BRAND.PRIMARY[100],
    zIndex: 1,
  },
  timelineStep: {
    alignItems: 'center',
    zIndex: 2,
    flex: 1,
  },
  timelineDotFinished: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: BRAND.PRIMARY[400],
    borderWidth: 3,
    borderColor: BRAND.SURFACE.CARD,
    marginBottom: 8,
  },
  timelineDotActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: BRAND.SURFACE.CARD,
    borderWidth: 5,
    borderColor: BRAND.SECONDARY.DEFAULT,
    marginBottom: 6,
  },
  timelineDotPending: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: BRAND.SURFACE.CARD,
    borderWidth: 2,
    borderColor: BRAND.SURFACE.BORDER,
    marginBottom: 8,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BRAND.PRIMARY.DEFAULT,
    marginBottom: 2,
  },
  timelineDate: {
    fontSize: 16,
    color: BRAND.PRIMARY[400],
  },
  timelineBadge: {
    backgroundColor: BRAND.PRIMARY[100],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  timelineBadgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BRAND.SURFACE.BORDER_DARK,
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
  miniProgressBar: {
    height: 4,
    backgroundColor: BRAND.PRIMARY[100],
    borderRadius: 2,
    marginTop: 12,
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: BRAND.PRIMARY[200],
    borderRadius: 2,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BRAND.PRIMARY.DEFAULT,
    marginBottom: 2,
  },
  appointmentSubtitle: {
    fontSize: 16,
    color: BRAND.SURFACE.BORDER_DARK,
    fontWeight: '600',
    marginBottom: 2,
  },
  appointmentDesc: {
    fontSize: 16,
    color: BRAND.PRIMARY[400],
  },
  ocrBanner: {
    flexDirection: 'row',
    backgroundColor: BRAND.SECONDARY.DEFAULT, // Would be gradient in real implementation
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: BRAND.SECONDARY.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  ocrTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BRAND.SURFACE.CARD,
    marginBottom: 4,
  },
  ocrSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 16,
  },
  commandModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(74, 57, 49, 0.95)', // Dark translucent background
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  commandContent: {
    backgroundColor: BRAND.BG.LIGHT,
    borderRadius: 32,
    padding: 24,
    shadowColor: BRAND.PRIMARY[900],
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
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
  },
  genUICardBox: {
    backgroundColor: BRAND.SECONDARY[50],
    borderWidth: 1,
    borderColor: BRAND.SECONDARY[100],
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  genUICardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BRAND.PRIMARY[400],
    marginLeft: 8,
  },
  genUICardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BRAND.PRIMARY.DEFAULT,
    marginBottom: 16,
  },
  genUIActionBtn: {
    backgroundColor: BRAND.SECONDARY.DEFAULT,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  genUIActionBtnText: {
    color: BRAND.SURFACE.CARD,
    fontWeight: 'bold',
    fontSize: 16,
  }
});