/**
 * @fileoverview Rotina de Hoje — daily patient tracking screen.
 *
 * @module pages/tabs/routine
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  Thermometer,
  Sun,
  Moon,
  Check,
  Droplets,
  Droplet,
  Star,
  Minus,
  Plus,
  ChevronRight,
  Pill,
  AlertCircle,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/shared/lib/zustand-persist';
import {
  getTodayRoutine,
  updateTemperature,
  updateHydration,
  updateSleep,
  updateMedications,
  type MedicationItem,
} from '@/shared/api/routine';
import { BRAND } from '@/shared/constants/brand-colors.const';

const HYDRATION_GOAL = 8;

export default function RoutineScreen() {
  const router = useRouter();
  const userId = useAuthStore(s => s.userId);
  const queryClient = useQueryClient();

  const [localTemp, setLocalTemp] = useState('');
  const [localSleepHours, setLocalSleepHours] = useState(7);

  const { data: routine, isLoading } = useQuery({
    queryKey: ['routine', 'today', userId],
    queryFn: () => getTodayRoutine(userId!),
    enabled: !!userId,
  });

  const tempMutation = useMutation({
    mutationFn: (val: number) => updateTemperature(userId!, val),
    onMutate: async (newTemp) => {
      await queryClient.cancelQueries({ queryKey: ['routine', 'today', userId] });
      const previous = queryClient.getQueryData(['routine', 'today', userId]);
      queryClient.setQueryData(['routine', 'today', userId], (old: any) => ({ ...old, temperature: newTemp }));
      return { previous };
    },
    onError: (_err, _val, context) => queryClient.setQueryData(['routine', 'today', userId], context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['routine', 'today', userId] }),
  });

  const hydraMutation = useMutation({
    mutationFn: (val: number) => updateHydration(userId!, val),
    onMutate: async (newVal) => {
      await queryClient.cancelQueries({ queryKey: ['routine', 'today', userId] });
      const previous = queryClient.getQueryData(['routine', 'today', userId]);
      queryClient.setQueryData(['routine', 'today', userId], (old: any) => ({ ...old, hydration_glasses: newVal }));
      return { previous };
    },
    onError: (_err, _val, context) => queryClient.setQueryData(['routine', 'today', userId], context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['routine', 'today', userId] }),
  });

  const sleepMutation = useMutation({
    mutationFn: ({ hours, quality }: { hours: number; quality: number }) =>
      updateSleep(userId!, hours, quality),
    onMutate: async (newSleep) => {
      await queryClient.cancelQueries({ queryKey: ['routine', 'today', userId] });
      const previous = queryClient.getQueryData(['routine', 'today', userId]);
      queryClient.setQueryData(['routine', 'today', userId], (old: any) => ({
        ...old,
        sleep_hours: newSleep.hours,
        sleep_quality: newSleep.quality,
      }));
      return { previous };
    },
    onError: (_err, _val, context) => queryClient.setQueryData(['routine', 'today', userId], context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['routine', 'today', userId] }),
  });

  const medsMutation = useMutation({
    mutationFn: (meds: MedicationItem[]) => updateMedications(userId!, meds),
    onMutate: async (newMeds) => {
      await queryClient.cancelQueries({ queryKey: ['routine', 'today', userId] });
      const previous = queryClient.getQueryData(['routine', 'today', userId]);
      queryClient.setQueryData(['routine', 'today', userId], (old: any) => ({ ...old, medications: newMeds }));
      return { previous };
    },
    onError: (_err, _val, context) => queryClient.setQueryData(['routine', 'today', userId], context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['routine', 'today', userId] }),
  });

  const meds = routine?.medications ?? [];
  const hydration = routine?.hydration_glasses ?? 0;
  const sleepHours = routine?.sleep_hours ?? localSleepHours;
  const sleepQuality = routine?.sleep_quality ?? 5;
  const lastTemp = routine?.temperature;

  const morningMeds = meds.map((m, i) => ({ ...m, i })).filter(m => m.period === 'morning');
  const afternoonMeds = meds.map((m, i) => ({ ...m, i })).filter(m => m.period === 'afternoon');
  const eveningMeds = meds.map((m, i) => ({ ...m, i })).filter(m => m.period === 'evening' || m.period === 'night');
  const checkedCount = meds.filter(m => m.taken).length;

  const toggleMed = (index: number) => {
    const updated = meds.map((m, i) =>
      i === index ? { ...m, taken: !m.taken } : m
    ) as MedicationItem[];
    medsMutation.mutate(updated);
  };

  const dateStr = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const tempAlert = lastTemp !== undefined && lastTemp !== null && lastTemp >= 37.8;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── HEADER ── */}
        <LinearGradient
          colors={[BRAND.PRIMARY.DEFAULT, BRAND.PRIMARY[400]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Rotina de Hoje</Text>
            <Text style={styles.headerDate}>{dateStr}</Text>
          </View>
          {meds.length > 0 && (
            <View style={styles.progressBadge}>
              <Text style={styles.progressBig}>{checkedCount}</Text>
              <Text style={styles.progressSmall}>/{meds.length}</Text>
              <Text style={styles.progressLabel}>meds</Text>
            </View>
          )}
        </LinearGradient>

        {isLoading && (
          <ActivityIndicator color={BRAND.SECONDARY.DEFAULT} style={{ marginVertical: 32 }} />
        )}

        {/* ── TEMPERATURA ── */}
        <View style={styles.sectionLabel}>
          <Thermometer size={16} color={BRAND.PRIMARY[400]} />
          <Text style={styles.sectionLabelText}>Temperatura Corporal</Text>
        </View>

        <View style={styles.card}>
          {tempAlert && (
            <View style={styles.alertBanner}>
              <AlertCircle size={16} color={BRAND.ERROR.DEFAULT} />
              <Text style={styles.alertBannerText}>Temperatura acima de 37,8°C — entre em contato com sua equipe médica.</Text>
            </View>
          )}
          <View style={styles.tempRow}>
            <View style={styles.tempInputWrapper}>
              <Text style={styles.tempUnit}>°C</Text>
              <TextInput
                style={styles.tempInput}
                placeholder={lastTemp ? `Último: ${lastTemp}°C` : 'Ex: 36.5'}
                placeholderTextColor={BRAND.PRIMARY[300]}
                keyboardType="decimal-pad"
                value={localTemp}
                onChangeText={setLocalTemp}
              />
            </View>
            <TouchableOpacity
              style={[styles.saveBtn, !localTemp && styles.saveBtnDisabled]}
              activeOpacity={0.8}
              disabled={!localTemp || tempMutation.isPending}
              onPress={() => {
                const parsed = parseFloat(localTemp.replace(',', '.'));
                if (!isNaN(parsed)) {
                  tempMutation.mutate(parsed);
                  setLocalTemp('');
                }
              }}
            >
              {tempMutation.isPending
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.saveBtnText}>Salvar</Text>}
            </TouchableOpacity>
          </View>
          {lastTemp !== undefined && lastTemp !== null && (
            <Text style={styles.lastReading}>✓ Última leitura: {lastTemp}°C</Text>
          )}
        </View>

        {/* ── MEDICAMENTOS ── */}
        <View style={styles.sectionLabel}>
          <Pill size={16} color={BRAND.PRIMARY[400]} />
          <Text style={styles.sectionLabelText}>Medicamentos</Text>
        </View>

        {meds.length === 0 && !isLoading ? (
          <View style={[styles.card, styles.emptyCard]}>
            <Pill size={32} color={BRAND.PRIMARY[300]} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>Nenhum medicamento cadastrado</Text>
            <Text style={styles.emptySubtitle}>
              Peça à sua equipe médica para registrar sua medicação no sistema.
            </Text>
          </View>
        ) : (
          <View style={styles.card}>
            {morningMeds.length > 0 && (
              <View style={styles.periodSection}>
                <View style={styles.periodHeader}>
                  <Sun size={16} color={BRAND.SECONDARY.DEFAULT} />
                  <Text style={styles.periodTitle}>Manhã • 08:00</Text>
                </View>
                {morningMeds.map(med => (
                  <TouchableOpacity
                    key={med.i}
                    style={[styles.medRow, med.taken && styles.medRowDone]}
                    onPress={() => toggleMed(med.i)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.checkbox, med.taken && styles.checkboxDone]}>
                      {med.taken && <Check size={14} color="#fff" />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.medName, med.taken && styles.medNameDone]}>{med.name}</Text>
                      {med.dose ? <Text style={styles.medDose}>{med.dose}</Text> : null}
                    </View>
                    {med.type && (
                      <View style={styles.medTypeBadge}>
                        <Text style={styles.medTypeText}>{med.type}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {afternoonMeds.length > 0 && (
              <View style={styles.periodSection}>
                <View style={styles.periodHeader}>
                  <Sun size={16} color={BRAND.PRIMARY[400]} />
                  <Text style={styles.periodTitle}>Tarde • 14:00</Text>
                </View>
                {afternoonMeds.map(med => (
                  <TouchableOpacity
                    key={med.i}
                    style={[styles.medRow, med.taken && styles.medRowDone]}
                    onPress={() => toggleMed(med.i)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.checkbox, med.taken && styles.checkboxDone]}>
                      {med.taken && <Check size={14} color="#fff" />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.medName, med.taken && styles.medNameDone]}>{med.name}</Text>
                      {med.dose ? <Text style={styles.medDose}>{med.dose}</Text> : null}
                    </View>
                    {med.type && (
                      <View style={styles.medTypeBadge}>
                        <Text style={styles.medTypeText}>{med.type}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {eveningMeds.length > 0 && (
              <View style={styles.periodSection}>
                <View style={styles.periodHeader}>
                  <Moon size={16} color={BRAND.PRIMARY[400]} />
                  <Text style={styles.periodTitle}>Noite • 20:00</Text>
                </View>
                {eveningMeds.map(med => (
                  <TouchableOpacity
                    key={med.i}
                    style={[styles.medRow, med.taken && styles.medRowDone]}
                    onPress={() => toggleMed(med.i)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.checkbox, med.taken && styles.checkboxDone]}>
                      {med.taken && <Check size={14} color="#fff" />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.medName, med.taken && styles.medNameDone]}>{med.name}</Text>
                      {med.dose ? <Text style={styles.medDose}>{med.dose}</Text> : null}
                    </View>
                    {med.type && (
                      <View style={styles.medTypeBadge}>
                        <Text style={styles.medTypeText}>{med.type}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── HIDRATAÇÃO ── */}
        <View style={styles.sectionLabel}>
          <Droplets size={16} color={BRAND.PRIMARY[400]} />
          <Text style={styles.sectionLabelText}>Hidratação</Text>
          <Text style={styles.sectionLabelRight}>{hydration}/{HYDRATION_GOAL} copos</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.dropsGrid}>
            {Array.from({ length: HYDRATION_GOAL }, (_, i) => i + 1).map(drop => (
              <TouchableOpacity
                key={drop}
                onPress={() => hydraMutation.mutate(drop === hydration ? drop - 1 : drop)}
                style={[styles.dropItem, drop <= hydration && styles.dropItemFilled]}
              >
                <Droplet
                  size={20}
                  color={drop <= hydration ? '#fff' : BRAND.PRIMARY[300]}
                  fill={drop <= hydration ? '#fff' : 'transparent'}
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.hydraHint}>
            <Text style={styles.hydraHintText}>
              Durante a quimio, beba pelo menos 2L por dia para ajudar os rins a eliminar resíduos do tratamento.
            </Text>
          </View>

          <View style={styles.hydraActions}>
            <TouchableOpacity
              style={styles.hydraBtn}
              activeOpacity={0.8}
              disabled={hydration <= 0 || hydraMutation.isPending}
              onPress={() => hydraMutation.mutate(Math.max(0, hydration - 1))}
            >
              <Minus size={18} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.hydraCount}>{hydration} copos</Text>
            <TouchableOpacity
              style={[styles.hydraBtn, styles.hydraBtnPrimary]}
              activeOpacity={0.8}
              disabled={hydration >= HYDRATION_GOAL || hydraMutation.isPending}
              onPress={() => hydraMutation.mutate(Math.min(HYDRATION_GOAL, hydration + 1))}
            >
              {hydraMutation.isPending
                ? <ActivityIndicator color="#fff" size="small" />
                : <><Plus size={18} color="#fff" /><Text style={styles.hydraBtnText}>  Bebi mais um</Text></>}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── SONO ── */}
        <View style={styles.sectionLabel}>
          <Moon size={16} color={BRAND.PRIMARY[400]} />
          <Text style={styles.sectionLabelText}>Sono</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.sleepRow}>
            <View style={styles.sleepBox}>
              <Text style={styles.sleepBoxLabel}>Horas dormidas</Text>
              <View style={styles.sleepControl}>
                <TouchableOpacity
                  style={styles.sleepControlBtn}
                  onPress={() => {
                    const h = Math.max(0, Math.round(sleepHours) - 1);
                    setLocalSleepHours(h);
                    sleepMutation.mutate({ hours: h, quality: sleepQuality });
                  }}
                >
                  <Minus size={16} color={BRAND.PRIMARY.DEFAULT} />
                </TouchableOpacity>
                <Text style={styles.sleepValue}>{Math.round(sleepHours ?? 7)}h</Text>
                <TouchableOpacity
                  style={styles.sleepControlBtn}
                  onPress={() => {
                    const h = Math.min(24, Math.round(sleepHours) + 1);
                    setLocalSleepHours(h);
                    sleepMutation.mutate({ hours: h, quality: sleepQuality });
                  }}
                >
                  <Plus size={16} color={BRAND.PRIMARY.DEFAULT} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.sleepBox}>
              <Text style={styles.sleepBoxLabel}>Qualidade</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map(star => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => sleepMutation.mutate({ hours: Math.round(sleepHours), quality: star })}
                  >
                    <Star
                      size={22}
                      color={star <= sleepQuality ? BRAND.SECONDARY.DEFAULT : BRAND.SURFACE.BORDER}
                      fill={star <= sleepQuality ? BRAND.SECONDARY.DEFAULT : 'transparent'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* ── CTA BODY MAP ── */}
        <TouchableOpacity
          style={styles.ctaCard}
          activeOpacity={0.88}
          onPress={() => router.push('/(tabs)/body-map')}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.ctaTitle}>Registrar Sintomas</Text>
            <Text style={styles.ctaSubtitle}>Toque no corpo ou use a escala CTCAE</Text>
          </View>
          <ChevronRight size={22} color="#fff" />
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BRAND.BG.LIGHT,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 16,
    paddingBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#fff',
    marginBottom: 4,
  },
  headerDate: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: 'rgba(255,255,255,0.75)',
    textTransform: 'capitalize',
  },
  progressBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    marginLeft: 16,
  },
  progressBig: {
    fontSize: 22,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#fff',
    lineHeight: 26,
  },
  progressSmall: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: 'rgba(255,255,255,0.7)',
  },
  progressLabel: {
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  /* Section Labels */
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 10,
  },
  sectionLabelText: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: BRAND.PRIMARY[400],
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sectionLabelRight: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    color: BRAND.PRIMARY[400],
    marginLeft: 'auto',
  },

  /* Cards */
  card: {
    backgroundColor: BRAND.SURFACE.CARD,
    borderRadius: 20,
    marginHorizontal: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: BRAND.SURFACE.BORDER,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: BRAND.PRIMARY.DEFAULT,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: BRAND.PRIMARY[400],
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 260,
  },

  /* Alert */
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: BRAND.ERROR.LIGHT,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  alertBannerText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    color: BRAND.ERROR.DEFAULT,
    lineHeight: 18,
  },

  /* Temperatura */
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tempInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND.BG.LIGHT,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1,
    borderColor: BRAND.SURFACE.BORDER,
  },
  tempUnit: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
    color: BRAND.PRIMARY[400],
    marginRight: 8,
  },
  tempInput: {
    flex: 1,
    fontSize: 17,
    fontFamily: 'Nunito_600SemiBold',
    color: BRAND.PRIMARY.DEFAULT,
  },
  saveBtn: {
    backgroundColor: BRAND.SECONDARY.DEFAULT,
    borderRadius: 14,
    paddingHorizontal: 20,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: BRAND.PRIMARY[200],
  },
  saveBtnText: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
    color: '#fff',
  },
  lastReading: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: BRAND.PRIMARY[400],
    marginTop: 10,
  },

  /* Medicamentos */
  periodSection: {
    marginBottom: 16,
  },
  periodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  periodTitle: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: BRAND.PRIMARY[400],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  medRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND.PRIMARY[50],
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  medRowDone: {
    backgroundColor: BRAND.SURFACE.CARD,
    borderWidth: 1,
    borderColor: BRAND.SURFACE.BORDER,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: BRAND.PRIMARY[300],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxDone: {
    backgroundColor: BRAND.AUX.GREEN,
    borderColor: BRAND.AUX.GREEN,
  },
  medName: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
    color: BRAND.PRIMARY.DEFAULT,
  },
  medNameDone: {
    color: BRAND.PRIMARY[300],
    textDecorationLine: 'line-through',
  },
  medDose: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: BRAND.PRIMARY[400],
    marginTop: 2,
  },
  medTypeBadge: {
    backgroundColor: BRAND.SECONDARY[100],
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  medTypeText: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    color: BRAND.SECONDARY[700],
  },

  /* Hidratação */
  dropsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 16,
  },
  dropItem: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BRAND.PRIMARY[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropItemFilled: {
    backgroundColor: BRAND.PRIMARY[300],
  },
  hydraHint: {
    backgroundColor: BRAND.BG.LIGHT,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  hydraHintText: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: BRAND.PRIMARY.DEFAULT,
    lineHeight: 18,
    textAlign: 'center',
  },
  hydraActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hydraBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: BRAND.PRIMARY[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  hydraBtnPrimary: {
    flex: 1,
    width: undefined,
    backgroundColor: BRAND.SECONDARY.DEFAULT,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  hydraBtnText: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
    color: '#fff',
  },
  hydraCount: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: BRAND.PRIMARY.DEFAULT,
    minWidth: 70,
    textAlign: 'center',
  },

  /* Sono */
  sleepRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sleepBox: {
    flex: 1,
    backgroundColor: BRAND.BG.LIGHT,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  sleepBoxLabel: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    color: BRAND.PRIMARY[400],
    marginBottom: 12,
  },
  sleepControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sleepControlBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BRAND.SURFACE.BORDER,
  },
  sleepValue: {
    fontSize: 22,
    fontFamily: 'Nunito_800ExtraBold',
    color: BRAND.PRIMARY.DEFAULT,
    minWidth: 40,
    textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 6,
  },

  /* CTA */
  ctaCard: {
    backgroundColor: BRAND.SECONDARY.DEFAULT,
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: '#fff',
    marginBottom: 4,
  },
  ctaSubtitle: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: 'rgba(255,255,255,0.85)',
  },
});
