/**
 * @fileoverview Implementation of DoctorHome.
 *
 * @module features/home/ui/DoctorHomex
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, Modal, TextInput, KeyboardAvoidingView, Image } from 'react-native';
import { Search, Sparkles, AlertTriangle, FileText, Calendar, UserPlus, Users, Activity, BookOpen, X, Mic, BrainCircuit, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { useAuthStore, useOnboardingStore } from '@/shared/lib/zustand-persist';
import { BRAND } from '@/shared/constants/brand-colors.const';

export function DoctorHome() {
  const router = useRouter();
  const [commandCenterOpen, setCommandCenterOpen] = useState(false);
  const [commandInput, setCommandInput] = useState('');
  
  const { 
    name, 
    doctorSpecialty,
    doctorInterests
  } = useOnboardingStore();

  const primaryInterest = doctorInterests?.[0];
  const doctorName = name || 'Doutor(a)';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* TOP HEADER */}
        <LinearGradient 
          colors={[BRAND.PRIMARY[800], BRAND.PRIMARY[700]]} // Dark blueish gray for Doctors
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.headerArea}
        >
          <View style={styles.profileRow}>
            <TouchableOpacity 
              style={[styles.avatarPlaceholder, { backgroundColor: BRAND.PRIMARY[700], borderWidth: 1, borderColor: BRAND.SURFACE.BORDER }]} 
              activeOpacity={0.8}
              onPress={() => router.push('/profile')}
            >
              <User size={24} color={BRAND.PRIMARY[400]} />
            </TouchableOpacity>
            <View style={styles.profileTextContainer}>
              <Text style={styles.greetingText}>BEM-VINDO,</Text>
              <Text style={styles.nameText}>Dr(a). {doctorName}</Text>
              <View style={styles.badge}>
                <BrainCircuit size={12} color={BRAND.PRIMARY[300]} style={{marginRight: 4}} />
                <Text style={styles.badgeText}>Médico • {doctorSpecialty || 'Especialista'}</Text>
              </View>
            </View>
          </View>

          {/* Search Bar - Triggers Command Center */}
          <TouchableOpacity 
            style={styles.searchBar} 
            activeOpacity={0.9}
            onPress={() => setCommandCenterOpen(true)}
          >
            <Sparkles size={16} color={BRAND.AUX.BLUE} style={{marginRight: 8}} />
            <Text style={styles.searchText}>Assistente Clínico IA...</Text>
            <Search size={16} color={BRAND.PRIMARY[400]} style={{marginLeft: 'auto'}} />
          </TouchableOpacity>

        </LinearGradient>

        <View style={styles.bodyArea}>
          
          {/* Daily AI Summary Card */}
          <View style={styles.summaryCard}>
            <BrainCircuit size={20} color={BRAND.AUX.BLUE} style={{marginTop: 2}} />
            <Text style={styles.summaryText}>
              Seu assistente clínico está ativo. Você não possui alertas críticos pendentes para o turno de hoje.
            </Text>
          </View>

          {/* DYNAMIC WIDGET 1 (Based on doctorInterests) */}
          <View style={styles.widgetContainer}>
            {primaryInterest === 'Sintomas e bem-estar entre consultas' && (
               <View style={styles.widgetCard}>
                 <View style={styles.widgetHeader}>
                   <Activity size={20} color={BRAND.AUX.BLUE} />
                   <Text style={styles.widgetTitle}>Evolução CTCAE (Pacientes)</Text>
                 </View>
                 <Text style={styles.widgetDesc}>Acompanhe o mapa temporal de sintomas dos seus pacientes para intervenção precoce.</Text>
                 <TouchableOpacity style={styles.widgetButton}>
                   <Text style={styles.widgetButtonText}>Ver Painel de Sintomas</Text>
                 </TouchableOpacity>
               </View>
            )}

            {primaryInterest === 'Briefing pré-consulta gerado por IA' && (
               <View style={styles.widgetCard}>
                 <View style={styles.widgetHeader}>
                   <FileText size={20} color={BRAND.AUX.BLUE} />
                   <Text style={styles.widgetTitle}>Briefing Pré-Consulta</Text>
                 </View>
                 <Text style={styles.widgetDesc}>Resumo automático dos últimos 30 dias para as consultas de hoje.</Text>
                 <TouchableOpacity style={styles.widgetButton}>
                   <Text style={styles.widgetButtonText}>Gerar Briefings</Text>
                 </TouchableOpacity>
               </View>
            )}

            {primaryInterest === 'Literatura e evidências científicas' && (
               <View style={styles.widgetCard}>
                 <View style={styles.widgetHeader}>
                   <BookOpen size={20} color={BRAND.AUX.BLUE} />
                   <Text style={styles.widgetTitle}>Busca OncoKB / PubMed</Text>
                 </View>
                 <Text style={styles.widgetDesc}>Encontre evidências e matching de ensaios clínicos com a IA.</Text>
                 <TouchableOpacity style={styles.widgetButton}>
                   <Text style={styles.widgetButtonText}>Pesquisar Literatura</Text>
                 </TouchableOpacity>
               </View>
            )}

            {primaryInterest === 'Score preditivo de risco de abandono' && (
               <View style={styles.widgetCard}>
                 <View style={styles.widgetHeader}>
                   <AlertTriangle size={20} color={BRAND.ERROR.DEFAULT} />
                   <Text style={styles.widgetTitle}>Alertas de Risco (ML)</Text>
                 </View>
                 <Text style={styles.widgetDesc}>1 paciente com alto risco de descontinuidade do tratamento.</Text>
                 <TouchableOpacity style={[styles.widgetButton, { backgroundColor: BRAND.ERROR.DEFAULT }]}>
                   <Text style={styles.widgetButtonText}>Analisar Score SHAP</Text>
                 </TouchableOpacity>
               </View>
            )}

            {primaryInterest === 'Conectar com meus pacientes' && (
               <View style={styles.widgetCard}>
                 <View style={styles.widgetHeader}>
                   <UserPlus size={20} color={BRAND.SEMANTIC.SUCCESS} />
                   <Text style={styles.widgetTitle}>Convite de Pacientes</Text>
                 </View>
                 <Text style={styles.widgetDesc}>Traga seus pacientes para a plataforma e acompanhe a jornada deles.</Text>
                 <TouchableOpacity style={[styles.widgetButton, { backgroundColor: BRAND.SEMANTIC.SUCCESS }]}>
                   <Text style={styles.widgetButtonText}>Gerar Link de Convite</Text>
                 </TouchableOpacity>
               </View>
            )}

            {/* Fallback Widget */}
            {!primaryInterest && (
               <View style={styles.widgetCard}>
                 <View style={styles.widgetHeader}>
                   <Users size={20} color={BRAND.AUX.BLUE} />
                   <Text style={styles.widgetTitle}>Lista de Pacientes</Text>
                 </View>
                 <Text style={styles.widgetDesc}>Gerencie os pacientes conectados a você na plataforma.</Text>
                 <TouchableOpacity style={styles.widgetButton}>
                   <Text style={styles.widgetButtonText}>Ver Pacientes</Text>
                 </TouchableOpacity>
               </View>
            )}
          </View>

          {/* Action Grid */}
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCardWhite}>
              <View style={styles.iconCircleBlue}><Users size={20} color={BRAND.AUX.BLUE} /></View>
              <Text style={styles.actionCardTitleDark}>Pacientes</Text>
              <Text style={styles.actionCardSubtitle}>24 conectados</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCardWhite}>
              <View style={styles.iconCircleBlue}><Calendar size={20} color={BRAND.AUX.BLUE} /></View>
              <Text style={styles.actionCardTitleDark}>Agenda</Text>
              <Text style={styles.actionCardSubtitle}>4 consultas hoje</Text>
            </TouchableOpacity>
          </View>

          <View style={{height: 100}} />
        </View>
      </ScrollView>

      {/* Command Center Modal (GenUI) */}
      <Modal visible={commandCenterOpen} animationType="fade" transparent>
        <KeyboardAvoidingView style={styles.commandModalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.commandContent}>
            <View style={styles.commandHeader}>
              <Text style={styles.commandTitle}>Assistente Clínico Multi-Agente</Text>
              <TouchableOpacity onPress={() => { setCommandCenterOpen(false); setCommandInput(''); }} style={styles.commandCloseBtn}>
                <X size={20} color={BRAND.PRIMARY[400]} />
              </TouchableOpacity>
            </View>
            <View style={styles.commandInputRow}>
              <BrainCircuit size={20} color={BRAND.AUX.BLUE} />
              <TextInput 
                style={styles.commandInput}
                placeholder={`Ex: Resuma os exames recentes da Rosa...`}
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
    backgroundColor: BRAND.PRIMARY[800], 
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: BRAND.PRIMARY[50],
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
    backgroundColor: BRAND.PRIMARY[700],
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
    backgroundColor: BRAND.SURFACE.BORDER, 
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
    color: BRAND.PRIMARY[400],
    fontSize: 16,
  },
  bodyArea: {
    flex: 1,
    paddingHorizontal: 24,
    marginTop: -20,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: BRAND.PRIMARY[50],
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  summaryText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: BRAND.AUX.BLUE,
    lineHeight: 20,
    fontWeight: '500',
  },
  widgetContainer: {
    marginBottom: 16,
  },
  widgetCard: {
    backgroundColor: BRAND.SURFACE.CARD,
    borderRadius: 24,
    padding: 20,
    shadowColor: BRAND.PRIMARY[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  widgetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BRAND.PRIMARY[800],
    marginLeft: 8,
  },
  widgetDesc: {
    fontSize: 16,
    color: BRAND.PRIMARY[400],
    lineHeight: 20,
    marginBottom: 16,
  },
  widgetButton: {
    backgroundColor: BRAND.AUX.BLUE,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  widgetButtonText: {
    color: BRAND.SURFACE.CARD,
    fontWeight: 'bold',
    fontSize: 16,
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
  iconCircleBlue: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BRAND.PRIMARY[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionCardTitleDark: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BRAND.PRIMARY[800],
    marginBottom: 4,
  },
  actionCardSubtitle: {
    fontSize: 16,
    color: BRAND.PRIMARY[400],
  },
  commandModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(31, 41, 55, 0.95)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  commandContent: {
    backgroundColor: BRAND.SURFACE.CARD,
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
    color: BRAND.PRIMARY[800],
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
    color: BRAND.PRIMARY[800],
  }
});