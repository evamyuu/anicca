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
          colors={['#354238', '#546A59']} // Different color for Caregiver
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
                source={{uri: 'https://i.pravatar.cc/150?img=32'}} 
                style={{width: '100%', height: '100%', borderRadius: 25}}
              />
            </TouchableOpacity>
            <View style={styles.profileTextContainer}>
              <Text style={styles.greetingText}>OLÁ, CUIDADOR(A)</Text>
              <Text style={styles.nameText}>{caregiverName || 'Bem-vindo'}</Text>
              <View style={styles.badge}>
                <HeartHandshake size={12} color="#bdae9f" style={{marginRight: 4}} />
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
            <Sparkles size={16} color="#f28b50" style={{marginRight: 8}} />
            <Text style={styles.searchText}>Pergunte sobre {patientFirstName}...</Text>
            <Search size={16} color="#a3988e" style={{marginLeft: 'auto'}} />
          </TouchableOpacity>

        </LinearGradient>

        <View style={styles.bodyArea}>
          
          {/* Daily AI Summary Card */}
          <View style={styles.summaryCard}>
            <Sparkles size={20} color="#f28b50" style={{marginTop: 2}} />
            <Text style={styles.summaryText}>
              "Como vai o {patientFirstName} hoje? Lembre-se que as medicações da manhã estão pendentes."
            </Text>
          </View>

          {/* Action Grid (Dynamic highlights based on caregiver priorities) */}
          <View style={styles.actionGrid}>
            
            <TouchableOpacity 
              style={primaryPriority === 'Acompanhar sintomas e bem-estar' ? styles.actionCardOrange : styles.actionCardWhite} 
              onPress={() => router.push('/(tabs)/body-map')}
            >
              <View style={primaryPriority === 'Acompanhar sintomas e bem-estar' ? styles.iconCircleTranslucentOrange : styles.iconCircleBeige}>
                <Thermometer size={20} color={primaryPriority === 'Acompanhar sintomas e bem-estar' ? "#ffffff" : "#3d2b1f"} />
              </View>
              <Text style={primaryPriority === 'Acompanhar sintomas e bem-estar' ? styles.actionCardTitleWhite : styles.actionCardTitleDark}>Sintomas</Text>
              <Text style={primaryPriority === 'Acompanhar sintomas e bem-estar' ? styles.actionCardSubtitleLight : styles.actionCardSubtitle}>De {patientFirstName}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={primaryPriority === 'Organizar rotina de medicamentos' ? styles.actionCardOrange : styles.actionCardWhite} 
              onPress={() => router.push('/(tabs)/routine')}
            >
              <View style={primaryPriority === 'Organizar rotina de medicamentos' ? styles.iconCircleTranslucentOrange : styles.iconCircleBeige}>
                <Pill size={20} color={primaryPriority === 'Organizar rotina de medicamentos' ? "#ffffff" : "#3d2b1f"} />
              </View>
              <Text style={primaryPriority === 'Organizar rotina de medicamentos' ? styles.actionCardTitleWhite : styles.actionCardTitleDark}>Medicamentos</Text>
              <Text style={primaryPriority === 'Organizar rotina de medicamentos' ? styles.actionCardSubtitleLight : styles.actionCardSubtitle}>Pendências</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={primaryPriority === 'Encontrar apoio emocional para mim' ? styles.actionCardBrown : styles.actionCardWhite} 
            >
              <View style={primaryPriority === 'Encontrar apoio emocional para mim' ? styles.iconCircleTranslucentBrown : styles.iconCircleBeige}>
                <HeartHandshake size={20} color={primaryPriority === 'Encontrar apoio emocional para mim' ? "#e5e0dc" : "#3d2b1f"} />
              </View>
              <Text style={primaryPriority === 'Encontrar apoio emocional para mim' ? styles.actionCardTitleLight : styles.actionCardTitleDark}>Bem-estar</Text>
              <Text style={primaryPriority === 'Encontrar apoio emocional para mim' ? styles.actionCardSubtitleBrown : styles.actionCardSubtitle}>Apoio ao cuidador</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCardWhite}>
              <View style={styles.iconCircleBeige}><Calendar size={20} color="#3d2b1f" /></View>
              <Text style={styles.actionCardTitleDark}>Agenda</Text>
              <Text style={styles.actionCardSubtitle}>Consultas</Text>
            </TouchableOpacity>

          </View>

          {/* Timeline do Paciente */}
          <TouchableOpacity style={styles.card} activeOpacity={0.8}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={styles.iconCircleBeige}><Calendar size={24} color="#3d2b1f" /></View>
              <View style={{flex: 1, marginLeft: 16}}>
                <Text style={styles.appointmentTitle}>Jornada de {patientFirstName}</Text>
                <Text style={styles.appointmentDesc}>Fase atual: {journeyPhase || 'Não informado'}</Text>
              </View>
              <Text style={{fontSize: 20, color: '#a3988e', fontWeight: 'bold'}}>{'>'}</Text>
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
                <X size={20} color="#8c8078" />
              </TouchableOpacity>
            </View>
            <View style={styles.commandInputRow}>
              <Sparkles size={20} color="#f28b50" />
              <TextInput 
                style={styles.commandInput}
                placeholder={`Ex: Quais os efeitos do remédio do ${patientFirstName}?`}
                placeholderTextColor="#a3988e"
                autoFocus
                value={commandInput}
                onChangeText={setCommandInput}
              />
              <TouchableOpacity>
                <Mic size={20} color="#a3988e" />
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
    backgroundColor: '#354238', // Dark Green
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#fbf9f6',
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
    backgroundColor: '#efe9e4',
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
    color: '#b5c4b8',
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
    backgroundColor: '#2b362e', 
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    color: '#e5e0dc',
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
    color: '#b5c4b8',
    fontSize: 15,
  },
  bodyArea: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: -20,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#efe9e4',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  summaryText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#4a3931',
    lineHeight: 20,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
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
  actionCardOrange: {
    width: '48%',
    backgroundColor: '#f28b50',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#f28b50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 2,
  },
  actionCardBrown: {
    width: '48%',
    backgroundColor: '#4a3931',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
  },
  iconCircleBeige: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#efe9e4',
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
    fontSize: 15,
    fontWeight: 'bold',
    color: '#3d2b1f',
    marginBottom: 4,
  },
  actionCardTitleWhite: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  actionCardTitleLight: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  actionCardSubtitle: {
    fontSize: 12,
    color: '#8c8078',
  },
  actionCardSubtitleLight: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  actionCardSubtitleBrown: {
    fontSize: 12,
    color: '#bdae9f',
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3d2b1f',
    marginBottom: 2,
  },
  appointmentDesc: {
    fontSize: 12,
    color: '#8c8078',
  },
  commandModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(74, 57, 49, 0.95)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  commandContent: {
    backgroundColor: '#fbf9f6',
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
    color: '#3d2b1f',
  },
  commandCloseBtn: {
    padding: 4,
  },
  commandInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    height: 56,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e5e0dc',
  },
  commandInput: {
    flex: 1,
    marginHorizontal: 12,
    fontSize: 15,
    color: '#3d2b1f',
  }
});