/**
 * @fileoverview Rotina de Hoje — daily patient tracking screen (Figma "RoutineScreen").
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
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/shared/lib/zustand-persist';
import {
  getTodayRoutine,
  updateTemperature,
  updateHydration,
  updateSleep,
  updateMedications,
  type MedicationItem,
  type RoutineResponse,
} from '@/shared/api/routine';
import { BRAND } from '@/shared/constants/brand-colors.const';
import { DEMO_ROUTINE_SUBTITLE } from '@/shared/mocks/demo-data';

const W = BRAND.WARM;
const HYDRATION_GOAL = 8;
const FEVER_THRESHOLD = 37.8;

const PERIODS: { id: string; match: (p: string) => boolean; label: string; icon: React.ReactNode }[] = [
  {
    id: 'morning',
    match: p => p === 'morning',
    label: 'Manhã • 08:00',
    icon: <MaterialIcons name="wb-sunny" size={14} color={W.TEXT_MUTED} />,
  },
  {
    id: 'afternoon',
    match: p => p === 'afternoon',
    label: 'Tarde • 11:30–14:00',
    icon: <MaterialCommunityIcons name="weather-partly-cloudy" size={14} color={W.TEXT_MUTED} />,
  },
  {
    id: 'night',
    match: p => p === 'evening' || p === 'night',
    label: 'Noite • 20:00',
    icon: <MaterialIcons name="dark-mode" size={14} color={W.TEXT_MUTED} />,
  },
];

const MED_TAG_COLOR: Record<string, string> = {
  'Quimio oral': BRAND.SECONDARY.DEFAULT,
  'Anti-náusea': W.TAUPE,
  Suporte: W.TAN,
};

function temperatureStatus(t: number) {
  if (t >= FEVER_THRESHOLD) return 'Febre';
  if (t >= 37.3) return 'Subfebril';
  if (t < 35.5) return 'Baixa';
  return 'Normal';
}

function sleepTip(hours: number, quality: number) {
  if (hours < 6 || quality <= 2) {
    return 'Noite difícil? Conte para a Ani — insônia e cansaço são comuns na quimio e têm manejo.';
  }
  return 'Bom padrão de sono — continue assim! O descanso acelera a recuperação.';
}

export default function RoutineScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const userId = useAuthStore(s => s.userId);
  const queryClient = useQueryClient();
  const queryKey = ['routine', 'today', userId];

  const [localTemp, setLocalTemp] = useState('');

  const { data: routine, isLoading } = useQuery({
    queryKey,
    queryFn: () => getTodayRoutine(userId!),
    enabled: !!userId,
  });

  /** Optimistic update shared by every routine mutation. */
  function useRoutineMutation<T>(mutationFn: (val: T) => Promise<RoutineResponse>, patch: (val: T) => Partial<RoutineResponse>) {
    return useMutation({
      mutationFn,
      onMutate: async (val: T) => {
        await queryClient.cancelQueries({ queryKey });
        const previous = queryClient.getQueryData(queryKey);
        queryClient.setQueryData(queryKey, (old: RoutineResponse | undefined) => (old ? { ...old, ...patch(val) } : old));
        return { previous };
      },
      onError: (_err, _val, context) => queryClient.setQueryData(queryKey, context?.previous),
      onSettled: () => queryClient.invalidateQueries({ queryKey }),
    });
  }

  const tempMutation = useRoutineMutation((t: number) => updateTemperature(userId!, t), t => ({ temperature: t }));
  const hydraMutation = useRoutineMutation((g: number) => updateHydration(userId!, g), g => ({ hydration_glasses: g }));
  const sleepMutation = useRoutineMutation(
    ({ hours, quality }: { hours: number; quality: number }) => updateSleep(userId!, hours, quality),
    ({ hours, quality }) => ({ sleep_hours: hours, sleep_quality: quality })
  );
  const medsMutation = useRoutineMutation((meds: MedicationItem[]) => updateMedications(userId!, meds), meds => ({ medications: meds }));

  const meds = routine?.medications ?? [];
  const hydration = routine?.hydration_glasses ?? 0;
  const sleepHours = Math.round(routine?.sleep_hours ?? 7);
  const sleepQuality = routine?.sleep_quality ?? 5;
  const lastTemp = routine?.temperature;
  const checkedCount = meds.filter(m => m.taken).length;
  const hasFever = lastTemp != null && lastTemp >= FEVER_THRESHOLD;

  const toggleMed = (index: number) => {
    medsMutation.mutate(meds.map((m, i) => (i === index ? { ...m, taken: !m.taken } : m)));
  };

  const saveTemperature = () => {
    const parsed = parseFloat(localTemp.replace(',', '.'));
    if (!isNaN(parsed)) {
      tempMutation.mutate(parsed);
      setLocalTemp('');
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Rotina de Hoje</Text>
            <Text style={styles.headerSubtitle}>{DEMO_ROUTINE_SUBTITLE}</Text>
          </View>
          <View style={styles.progressBadge}>
            <Text style={styles.progressBig}>{checkedCount}/{meds.length}</Text>
            <Text style={styles.progressLabel}>meds</Text>
          </View>
        </View>

        {isLoading && <ActivityIndicator color={BRAND.SECONDARY.DEFAULT} style={{ marginVertical: 24 }} />}

        {/* ── TEMPERATURA ── */}
        <View style={[styles.card, styles.cardBordered]}>
          <View style={styles.cardTitleRow}>
            <MaterialIcons name="device-thermostat" size={18} color={BRAND.SECONDARY.DEFAULT} />
            <Text style={styles.cardTitle}>Temperatura Corporal</Text>
          </View>
          {hasFever && (
            <View style={styles.alertBanner}>
              <MaterialIcons name="warning" size={16} color={W.DANGER_ICON} />
              <Text style={styles.alertBannerText}>
                Febre acima de 37,8°C — procure o Pronto-Socorro. Sua equipe já foi avisada.
              </Text>
            </View>
          )}
          <View style={styles.tempRow}>
            <View style={styles.tempInputWrapper}>
              <Text style={styles.tempUnit}>°C</Text>
              <TextInput
                style={styles.tempInput}
                placeholder={lastTemp != null ? `Último: ${lastTemp}°C` : 'Ex: 36.5'}
                placeholderTextColor="rgba(64,50,41,0.5)"
                keyboardType="decimal-pad"
                value={localTemp}
                onChangeText={setLocalTemp}
                onSubmitEditing={saveTemperature}
              />
            </View>
            <TouchableOpacity
              style={[styles.saveBtn, !localTemp && styles.saveBtnDisabled]}
              activeOpacity={0.8}
              disabled={!localTemp || tempMutation.isPending}
              onPress={saveTemperature}
            >
              {tempMutation.isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Salvar</Text>
              )}
            </TouchableOpacity>
          </View>
          {lastTemp != null && (
            <Text style={styles.lastReading}>
              ✓ Última leitura: {lastTemp}°C — {temperatureStatus(lastTemp)}
            </Text>
          )}
        </View>

        {/* ── MEDICAMENTOS ── */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Medicamentos</Text>
            <TouchableOpacity style={styles.linkChip} onPress={() => router.push('/(tabs)/body-map')}>
              <Text style={styles.linkChipText}>Ver sintomas →</Text>
            </TouchableOpacity>
          </View>

          {meds.length === 0 && !isLoading && (
            <Text style={styles.emptyText}>
              Nenhum medicamento cadastrado. Peça à sua equipe para registrar sua prescrição.
            </Text>
          )}

          {PERIODS.map(period => {
            const items = meds.map((m, i) => ({ ...m, i })).filter(m => period.match(m.period));
            if (items.length === 0) return null;
            return (
              <View key={period.id} style={styles.periodSection}>
                <View style={styles.periodHeader}>
                  {period.icon}
                  <Text style={styles.periodTitle}>{period.label}</Text>
                </View>
                {items.map(med => (
                  <TouchableOpacity
                    key={med.i}
                    style={[styles.medRow, med.taken && styles.medRowDone]}
                    onPress={() => toggleMed(med.i)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.checkbox, med.taken && styles.checkboxDone]}>
                      {med.taken && <MaterialIcons name="check" size={14} color="#fff" />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.medNameRow}>
                        <Text style={[styles.medName, med.taken && styles.medNameDone]}>{med.name}</Text>
                        {med.type && (
                          <Text style={[styles.medTag, { color: MED_TAG_COLOR[med.type] ?? W.TAUPE }]}>{med.type}</Text>
                        )}
                      </View>
                      <Text style={styles.medDose}>
                        {[med.dose, med.instructions].filter(Boolean).join(' • ')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            );
          })}
        </View>

        {/* ── HIDRATAÇÃO ── */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleRow}>
              <MaterialIcons name="water-drop" size={18} color={W.TAUPE} />
              <Text style={styles.cardTitle}>Hidratação</Text>
            </View>
            <Text style={styles.cardHeaderRight}>{hydration}/{HYDRATION_GOAL} copos (200ml)</Text>
          </View>

          <View style={styles.dropsRow}>
            {Array.from({ length: HYDRATION_GOAL }, (_, i) => i + 1).map(drop => {
              const filled = drop <= hydration;
              return (
                <TouchableOpacity
                  key={drop}
                  onPress={() => hydraMutation.mutate(drop === hydration ? drop - 1 : drop)}
                  style={[styles.drop, filled && styles.dropFilled]}
                >
                  <MaterialIcons name="water-drop" size={16} color={filled ? '#fff' : '#CCCCCC'} />
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.tipBox}>
            <Text style={styles.tipText}>
              Durante a quimio, beba pelo menos 2L por dia para ajudar os rins a eliminar os resíduos do tratamento.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.hydraBtn}
            activeOpacity={0.85}
            disabled={hydration >= HYDRATION_GOAL || hydraMutation.isPending}
            onPress={() => hydraMutation.mutate(Math.min(HYDRATION_GOAL, hydration + 1))}
          >
            <MaterialIcons name="add" size={18} color="#fff" />
            <Text style={styles.hydraBtnText}>
              {hydration >= HYDRATION_GOAL ? 'Meta do dia batida!' : 'Bebi mais um copo'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── SONO ── */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <MaterialIcons name="dark-mode" size={18} color={BRAND.PRIMARY.DEFAULT} />
            <Text style={styles.cardTitle}>Sono</Text>
          </View>

          <View style={styles.sleepRow}>
            <View style={styles.sleepBox}>
              <Text style={styles.sleepBoxLabel}>Horas dormidas</Text>
              <View style={styles.sleepControl}>
                <TouchableOpacity
                  style={styles.sleepControlBtn}
                  onPress={() => sleepMutation.mutate({ hours: Math.max(0, sleepHours - 1), quality: sleepQuality })}
                >
                  <Text style={styles.sleepControlText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.sleepValue}>{sleepHours}h</Text>
                <TouchableOpacity
                  style={styles.sleepControlBtn}
                  onPress={() => sleepMutation.mutate({ hours: Math.min(24, sleepHours + 1), quality: sleepQuality })}
                >
                  <Text style={styles.sleepControlText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.sleepBox}>
              <Text style={styles.sleepBoxLabel}>Qualidade</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map(star => (
                  <TouchableOpacity key={star} onPress={() => sleepMutation.mutate({ hours: sleepHours, quality: star })}>
                    <MaterialIcons
                      name={star <= sleepQuality ? 'star' : 'star-border'}
                      size={20}
                      color={star <= sleepQuality ? BRAND.SECONDARY.DEFAULT : W.TAUPE}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={[styles.tipBox, { backgroundColor: 'rgba(64,50,41,0.08)' }]}>
            <Text style={styles.tipText}>{sleepTip(sleepHours, sleepQuality)}</Text>
          </View>
        </View>

        {/* ── CTA BODY MAP ── */}
        <TouchableOpacity style={styles.ctaCard} activeOpacity={0.88} onPress={() => router.push('/(tabs)/body-map')}>
          <View style={{ flex: 1 }}>
            <Text style={styles.ctaTitle}>Registrar Sintomas / Body Map</Text>
            <Text style={styles.ctaSubtitle}>Toque na região do corpo ou use a escala CTCAE</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const CARD_SHADOW = {
  shadowColor: BRAND.PRIMARY.DEFAULT,
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.08,
  shadowRadius: 15,
  elevation: 3,
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: W.BG,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    gap: 16,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 22,
    lineHeight: 33,
    color: BRAND.PRIMARY.DEFAULT,
  },
  headerSubtitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    lineHeight: 18,
    color: W.TEXT_MUTED,
  },
  progressBadge: {
    minWidth: 52,
    height: 56,
    paddingHorizontal: 10,
    paddingTop: 7,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: BRAND.SECONDARY.DEFAULT,
  },
  progressBig: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 18,
    lineHeight: 27,
    color: '#fff',
  },
  progressLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 9,
    lineHeight: 13.5,
    color: 'rgba(255,255,255,0.8)',
  },

  /* Cards */
  card: {
    backgroundColor: BRAND.SURFACE.CARD,
    borderRadius: 22,
    padding: 16,
    gap: 12,
    ...CARD_SHADOW,
  },
  cardBordered: {
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    lineHeight: 21,
    color: BRAND.PRIMARY.DEFAULT,
  },
  cardHeaderRight: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    lineHeight: 18,
    color: W.TEXT_MUTED,
  },
  linkChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,154,92,0.1)',
  },
  linkChipText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    lineHeight: 16.5,
    color: BRAND.SECONDARY.DEFAULT,
  },
  emptyText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    lineHeight: 18,
    color: W.TEXT_MUTED,
  },

  /* Alert */
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(251,44,54,0.08)',
  },
  alertBannerText: {
    flex: 1,
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    lineHeight: 17,
    color: W.DANGER,
  },

  /* Temperatura */
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tempInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 41,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: W.BG,
  },
  tempUnit: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: W.TEXT_MUTED,
  },
  tempInput: {
    flex: 1,
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: BRAND.PRIMARY.DEFAULT,
  },
  saveBtn: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BRAND.SECONDARY.DEFAULT,
  },
  saveBtnDisabled: {
    opacity: 0.85,
  },
  saveBtnText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: '#fff',
  },
  lastReading: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    lineHeight: 16.5,
    color: W.TEXT_MUTED,
  },

  /* Medicamentos */
  periodSection: {
    gap: 8,
  },
  periodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  periodTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 12,
    lineHeight: 18,
    color: W.TEXT_MUTED,
  },
  medRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 13,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: W.BG,
  },
  medRowDone: {
    borderColor: W.TEXT_MUTED,
    backgroundColor: 'rgba(166,141,126,0.08)',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#DDDDDD',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxDone: {
    borderColor: W.TEXT_MUTED,
    backgroundColor: W.TEXT_MUTED,
  },
  medNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    columnGap: 8,
  },
  medName: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    lineHeight: 19.5,
    color: BRAND.PRIMARY.DEFAULT,
  },
  medNameDone: {
    color: W.TEXT_MUTED,
  },
  medTag: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 9,
    lineHeight: 13.5,
  },
  medDose: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    lineHeight: 16.5,
    color: W.TEXT_MUTED,
  },

  /* Hidratação */
  dropsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  drop: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: W.BG,
  },
  dropFilled: {
    backgroundColor: W.TAUPE,
  },
  tipBox: {
    paddingHorizontal: 12,
    paddingTop: 11,
    paddingBottom: 13,
    borderRadius: 14,
    backgroundColor: 'rgba(166,141,126,0.08)',
  },
  tipText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    lineHeight: 16.5,
    color: BRAND.PRIMARY.DEFAULT,
  },
  hydraBtn: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 16,
    backgroundColor: W.TAUPE,
    marginBottom: 4,
  },
  hydraBtnText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: '#fff',
  },

  /* Sono */
  sleepRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sleepBox: {
    flex: 1,
    gap: 4,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: W.BG,
  },
  sleepBoxLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 10,
    lineHeight: 15,
    color: W.TEXT_MUTED,
  },
  sleepControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sleepControlBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  sleepControlText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    lineHeight: 24,
    color: BRAND.PRIMARY.DEFAULT,
  },
  sleepValue: {
    flex: 1,
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 18,
    lineHeight: 27,
    textAlign: 'center',
    color: BRAND.PRIMARY.DEFAULT,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 2,
    paddingTop: 2,
  },

  /* CTA */
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 22,
    backgroundColor: BRAND.SECONDARY.DEFAULT,
    shadowColor: BRAND.SECONDARY.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
  ctaTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    lineHeight: 21,
    color: '#fff',
  },
  ctaSubtitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    lineHeight: 16.5,
    color: 'rgba(255,255,255,0.8)',
  },
});
