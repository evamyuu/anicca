/**
 * @fileoverview Routine Screen for daily patient tracking (Temperature, Meds).
 * Implements the Figma 3 UI design.
 *
 * @module pages/tabs/routine
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { Thermometer, Sun, Moon, Check, Droplets, Droplet, Star, Minus, Plus, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function RoutineScreen() {
  const router = useRouter();
  const [temperature, setTemperature] = useState('');
  
  // Hydration state (out of 8 cups)
  const [hydration, setHydration] = useState(4);
  
  // Sleep state
  const [sleepHours, setSleepHours] = useState(7);
  
  // Local state to simulate checking off medications
  const [meds, setMeds] = useState([
    { id: 1, time: 'morning', name: 'Capecitabina', type: 'Quimio oral', dose: '500mg • 2 comprimidos • Com o café da manhã', checked: true },
    { id: 2, time: 'morning', name: 'Dexametasona', type: 'Anti-náusea', dose: '4mg • 1 comprimido • Com o café da manhã', checked: true },
    { id: 3, time: 'morning', name: 'Ondansetrona', type: 'Anti-náusea', dose: '8mg • 1 comprimido • Em jejum ou com água', checked: false },
    { id: 4, time: 'afternoon', name: 'Omeprazol', type: 'Suporte', dose: '20mg • 1 cápsula • 30 min antes do almoço', checked: false },
  ]);

  const toggleMed = (id: number) => {
    setMeds(meds.map(med => med.id === id ? { ...med, checked: !med.checked } : med));
  };

  const morningMeds = meds.filter(m => m.time === 'morning');
  const afternoonMeds = meds.filter(m => m.time === 'afternoon');
  const checkedCount = meds.filter(m => m.checked).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Title */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Rotina de Hoje</Text>
            <Text style={styles.headerSubtitle}>Sexta, 23 Mai • Ciclo 2, Dia 8</Text>
          </View>
          <View style={styles.progressBadge}>
            <Text style={styles.progressBadgeTextBig}>{checkedCount}/{meds.length}</Text>
            <Text style={styles.progressBadgeTextSmall}>meds</Text>
          </View>
        </View>

        {/* Temperature Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Thermometer size={20} color="#f28b50" />
            <Text style={styles.cardTitle}>Temperatura Corporal</Text>
          </View>
          
          <View style={styles.tempInputRow}>
            <View style={styles.tempInputContainer}>
              <Text style={styles.tempUnit}>°C</Text>
              <TextInput 
                style={styles.tempInput}
                placeholder="Último: 36.7°C"
                placeholderTextColor="#a3988e"
                keyboardType="decimal-pad"
                value={temperature}
                onChangeText={setTemperature}
              />
            </View>
            <TouchableOpacity style={styles.saveButton} activeOpacity={0.8}>
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.lastReadingText}>✓ Última leitura: 36.7°C — Normal</Text>
        </View>

        {/* Medications List */}
        <View style={styles.medsContainer}>
          <View style={styles.medsHeader}>
            <Text style={styles.medsTitle}>Medicamentos</Text>
            <TouchableOpacity>
              <Text style={styles.symptomsLink}>Ver sintomas →</Text>
            </TouchableOpacity>
          </View>

          {/* Morning Section */}
          <View style={styles.timeSection}>
            <View style={styles.timeHeader}>
              <Sun size={18} color="#8c8078" />
              <Text style={styles.timeTitle}>Manhã • 08:00</Text>
            </View>
            
            {morningMeds.map(med => (
              <TouchableOpacity 
                key={med.id} 
                style={[styles.medItem, med.checked && styles.medItemChecked]} 
                onPress={() => toggleMed(med.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, med.checked && styles.checkboxChecked]}>
                  {med.checked && <Check size={16} color="#ffffff" />}
                </View>
                <View style={styles.medTextContainer}>
                  <View style={styles.medNameRow}>
                    <Text style={[styles.medName, med.checked && styles.medNameChecked]}>{med.name}</Text>
                    <Text style={[styles.medType, med.checked && styles.medTypeChecked]}>{med.type}</Text>
                  </View>
                  <Text style={[styles.medDose, med.checked && styles.medDoseChecked]}>{med.dose}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Afternoon Section */}
          <View style={styles.timeSection}>
            <View style={styles.timeHeader}>
              <Moon size={18} color="#8c8078" />
              <Text style={styles.timeTitle}>Tarde • 11:30–14:00</Text>
            </View>
            
            {afternoonMeds.map(med => (
              <TouchableOpacity 
                key={med.id} 
                style={[styles.medItem, med.checked && styles.medItemChecked]} 
                onPress={() => toggleMed(med.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, med.checked && styles.checkboxChecked]}>
                  {med.checked && <Check size={16} color="#ffffff" />}
                </View>
                <View style={styles.medTextContainer}>
                  <View style={styles.medNameRow}>
                    <Text style={[styles.medName, med.checked && styles.medNameChecked]}>{med.name}</Text>
                    <Text style={[styles.medType, med.checked && styles.medTypeChecked]}>{med.type}</Text>
                  </View>
                  <Text style={[styles.medDose, med.checked && styles.medDoseChecked]}>{med.dose}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

        </View>

        {/* Hydration Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderFlex}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Droplets size={20} color="#8c8078" />
              <Text style={styles.cardTitle}>Hidratação</Text>
            </View>
            <Text style={styles.cardHeaderRightText}>{hydration}/8 copos (200ml)</Text>
          </View>
          
          <View style={styles.dropsRow}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(drop => (
              <View key={`drop_${drop}`} style={[styles.dropCircle, drop <= hydration ? styles.dropCircleFilled : styles.dropCircleEmpty]}>
                <Droplet size={14} color={drop <= hydration ? "#ffffff" : "#a3988e"} fill={drop <= hydration ? "#ffffff" : "transparent"} />
              </View>
            ))}
          </View>
          
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerText}>
              Durante a quimio, beba pelo menos 2L por dia para ajudar os rins a eliminar os resíduos do tratamento.
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.actionBtnBrown} 
            activeOpacity={0.8}
            onPress={() => setHydration(Math.min(8, hydration + 1))}
          >
            <Plus size={16} color="#ffffff" style={{marginRight: 8}} />
            <Text style={styles.actionBtnBrownText}>Bebi mais um copo</Text>
          </TouchableOpacity>
        </View>

        {/* Sleep Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderFlex}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Moon size={20} color="#8c8078" />
              <Text style={styles.cardTitle}>Sono</Text>
            </View>
          </View>
          
          <View style={styles.sleepRow}>
            <View style={styles.sleepInputBox}>
              <Text style={styles.sleepInputLabel}>Horas dormidas</Text>
              <View style={styles.sleepControlRow}>
                <TouchableOpacity onPress={() => setSleepHours(Math.max(0, sleepHours - 1))} style={styles.sleepControlBtn}>
                  <Minus size={16} color="#4a3931" />
                </TouchableOpacity>
                <Text style={styles.sleepValue}>{sleepHours}h</Text>
                <TouchableOpacity onPress={() => setSleepHours(Math.min(24, sleepHours + 1))} style={styles.sleepControlBtn}>
                  <Plus size={16} color="#4a3931" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.sleepInputBox}>
              <Text style={styles.sleepInputLabel}>Qualidade</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map(star => (
                   <Star key={`star_${star}`} size={16} color="#f28b50" />
                ))}
              </View>
            </View>
          </View>
          
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerText}>
              Bom padrão de sono — continue assim! O descanso acelera a recuperação.
            </Text>
          </View>
        </View>

        {/* Large CTA for Body Map */}
        <TouchableOpacity 
          style={styles.bigOrangeCta}
          activeOpacity={0.9}
          onPress={() => router.push('/symptoms/bodymap')}
        >
           <View style={{flex: 1}}>
             <Text style={styles.bigOrangeCtaTitle}>Registrar Sintomas / Body Map</Text>
             <Text style={styles.bigOrangeCtaSubtitle}>Toque na região do corpo ou use a escala CTCAE</Text>
           </View>
           <ChevronRight size={24} color="#ffffff" />
        </TouchableOpacity>

        {/* Spacer for bottom tabs */}
        <View style={{height: 100}} />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fbf9f6', // Full light background for Routine
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3d2b1f',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8c8078',
  },
  progressBadge: {
    backgroundColor: '#f28b50',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBadgeTextBig: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  progressBadgeTextSmall: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: -2,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3d2b1f',
    marginLeft: 8,
  },
  tempInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tempInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#efe9e4',
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  tempUnit: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8c8078',
    marginRight: 8,
  },
  tempInput: {
    flex: 1,
    fontSize: 16,
    color: '#3d2b1f',
    height: '100%',
  },
  saveButton: {
    backgroundColor: '#f28b50',
    height: 52,
    paddingHorizontal: 24,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  lastReadingText: {
    fontSize: 12,
    color: '#5a4a42',
  },
  medsContainer: {
    flex: 1,
  },
  medsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  medsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3d2b1f',
  },
  symptomsLink: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#f28b50',
  },
  timeSection: {
    marginBottom: 24,
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8c8078',
    marginLeft: 8,
  },
  medItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#efe9e4',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  medItemChecked: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e0dc',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d5cfc9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  checkboxChecked: {
    backgroundColor: '#8c8078',
    borderColor: '#8c8078',
  },
  medTextContainer: {
    flex: 1,
  },
  medNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  medName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#3d2b1f',
    marginRight: 8,
  },
  medNameChecked: {
    color: '#8c8078',
    textDecorationLine: 'line-through',
  },
  medType: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#f28b50',
  },
  medTypeChecked: {
    color: '#a3988e',
  },
  medDose: {
    fontSize: 12,
    color: '#5a4a42',
    lineHeight: 18,
  },
  medDoseChecked: {
    color: '#a3988e',
  },
  cardHeaderFlex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderRightText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#8c8078',
  },
  dropsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dropCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropCircleFilled: {
    backgroundColor: '#bdae9f',
  },
  dropCircleEmpty: {
    backgroundColor: '#efe9e4',
  },
  infoBanner: {
    backgroundColor: '#fbf9f6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  infoBannerText: {
    fontSize: 12,
    color: '#3d2b1f',
    lineHeight: 18,
    textAlign: 'center',
  },
  actionBtnBrown: {
    backgroundColor: '#a3988e',
    borderRadius: 16,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnBrownText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  sleepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sleepInputBox: {
    width: '48%',
    backgroundColor: '#efe9e4',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  sleepInputLabel: {
    fontSize: 11,
    color: '#8c8078',
    marginBottom: 12,
  },
  sleepControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
  },
  sleepControlBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sleepValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3d2b1f',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  bigOrangeCta: {
    backgroundColor: '#f28b50',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#f28b50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  bigOrangeCtaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  bigOrangeCtaSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  }
});
