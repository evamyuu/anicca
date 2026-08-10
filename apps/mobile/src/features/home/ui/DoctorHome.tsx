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
import { Search, Sparkles, AlertTriangle, FileText, Calendar, UserPlus, Users, Activity, BookOpen, X, Mic, BrainCircuit } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { useAuthStore, useOnboardingStore } from '@/shared/lib/zustand-persist';

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
          colors={['#1F2937', '#374151']} // Dark blueish gray for Doctors
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
              <Image 
                source={{uri: 'https://i.pravatar.cc/150?img=68'}} 
                style={{width: '100%', height: '100%', borderRadius: 25}}
              />
            </TouchableOpacity>
            <View style={styles.profileTextContainer}>
              <Text style={styles.greetingText}>BEM-VINDO,</Text>
              <Text style={styles.nameText}>Dr(a). {doctorName}</Text>
              <View style={styles.badge}>
                <BrainCircuit size={12} color="#bdae9f" style={{marginRight: 4}} />
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
            <Sparkles size={16} color="#60A5FA" style={{marginRight: 8}} />
            <Text style={styles.searchText}>Assistente Clínico IA...</Text>
            <Search size={16} color="#9CA3AF" style={{marginLeft: 'auto'}} />
          </TouchableOpacity>

        </LinearGradient>

        <View style={styles.bodyArea}>
          
          {/* Daily AI Summary Card */}
          <View style={styles.summaryCard}>
            <BrainCircuit size={20} color="#3B82F6" style={{marginTop: 2}} />
            <Text style={styles.summaryText}>
              "Bom dia. Você tem 2 pacientes com alertas de sintomas (Grau 3) e 4 consultas agendadas para hoje."
            </Text>
          </View>

          {/* DYNAMIC WIDGET 1 (Based on doctorInterests) */}
          <View style={styles.widgetContainer}>
            {primaryInterest === 'Sintomas e bem-estar entre consultas' && (
               <View style={styles.widgetCard}>
                 <View style={styles.widgetHeader}>
                   <Activity size={20} color="#3B82F6" />
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
                   <FileText size={20} color="#3B82F6" />
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
                   <BookOpen size={20} color="#3B82F6" />
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
                   <AlertTriangle size={20} color="#EF4444" />
                   <Text style={styles.widgetTitle}>Alertas de Risco (ML)</Text>
                 </View>
                 <Text style={styles.widgetDesc}>1 paciente com alto risco de descontinuidade do tratamento.</Text>
                 <TouchableOpacity style={[styles.widgetButton, { backgroundColor: '#EF4444' }]}>
                   <Text style={styles.widgetButtonText}>Analisar Score SHAP</Text>
                 </TouchableOpacity>
               </View>
            )}

            {primaryInterest === 'Conectar com meus pacientes' && (
               <View style={styles.widgetCard}>
                 <View style={styles.widgetHeader}>
                   <UserPlus size={20} color="#10B981" />
                   <Text style={styles.widgetTitle}>Convite de Pacientes</Text>
                 </View>
                 <Text style={styles.widgetDesc}>Traga seus pacientes para a plataforma e acompanhe a jornada deles.</Text>
                 <TouchableOpacity style={[styles.widgetButton, { backgroundColor: '#10B981' }]}>
                   <Text style={styles.widgetButtonText}>Gerar Link de Convite</Text>
                 </TouchableOpacity>
               </View>
            )}

            {/* Fallback Widget */}
            {!primaryInterest && (
               <View style={styles.widgetCard}>
                 <View style={styles.widgetHeader}>
                   <Users size={20} color="#3B82F6" />
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
              <View style={styles.iconCircleBlue}><Users size={20} color="#3B82F6" /></View>
              <Text style={styles.actionCardTitleDark}>Pacientes</Text>
              <Text style={styles.actionCardSubtitle}>24 conectados</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCardWhite}>
              <View style={styles.iconCircleBlue}><Calendar size={20} color="#3B82F6" /></View>
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
                <X size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <View style={styles.commandInputRow}>
              <BrainCircuit size={20} color="#3B82F6" />
              <TextInput 
                style={styles.commandInput}
                placeholder={`Ex: Resuma os exames recentes da Rosa...`}
                placeholderTextColor="#9CA3AF"
                autoFocus
                value={commandInput}
                onChangeText={setCommandInput}
              />
              <TouchableOpacity>
                <Mic size={20} color="#9CA3AF" />
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
    backgroundColor: '#1F2937', 
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#F3F4F6',
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
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileTextContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4B5563', 
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    color: '#E5E7EB',
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
    color: '#9CA3AF',
    fontSize: 15,
  },
  bodyArea: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: -20,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#DBEAFE',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  summaryText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#1E3A8A',
    lineHeight: 20,
    fontWeight: '500',
  },
  widgetContainer: {
    marginBottom: 16,
  },
  widgetCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
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
    color: '#1F2937',
    marginLeft: 8,
  },
  widgetDesc: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  widgetButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  widgetButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionCardWhite: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  iconCircleBlue: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionCardTitleDark: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  actionCardSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  commandModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(31, 41, 55, 0.95)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  commandContent: {
    backgroundColor: '#ffffff',
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
    color: '#1F2937',
  },
  commandCloseBtn: {
    padding: 4,
  },
  commandInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    height: 56,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  commandInput: {
    flex: 1,
    marginHorizontal: 12,
    fontSize: 15,
    color: '#1F2937',
  }
});