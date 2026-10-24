/**
 * @fileoverview Patient Hub — matches the "HubScreen" frame in Figma (Startup One / Next).
 *
 * @module features/home/ui/PatientHome
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/shared/lib/zustand-persist';
import { getTodayRoutine } from '@/shared/api/routine';
import { useTicketSummary } from '../model/useTicketSummary';
import { BRAND } from '@/shared/constants/brand-colors.const';
import {
  DEMO_PATIENT,
  DEMO_JOURNEY,
  DEMO_LABS,
  DEMO_APPOINTMENT,
  type JourneyStep,
} from '@/shared/mocks/demo-data';
import {
  HubHeader,
  Card,
  IconBox,
  ActionTile,
  AppointmentCard,
  ScanBanner,
  AniCommandModal,
  hubStyles,
  hubCardStyles,
} from './HubComponents';

const W = BRAND.WARM;
const FEVER_THRESHOLD = 37.8;

function JourneyIcon({ id, color }: { id: JourneyStep['id']; color: string }) {
  if (id === 'diagnosis') return <MaterialCommunityIcons name="bacteria-outline" size={12} color={color} />;
  const name = id === 'treatment' ? 'medication' : id === 'deadline' ? 'gavel' : 'location-on';
  return <MaterialIcons name={name} size={12} color={color} />;
}

export function PatientHome() {
  const router = useRouter();
  const [commandCenterOpen, setCommandCenterOpen] = useState(false);
  const userId = useAuthStore(s => s.userId);

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('dark');
    }, [])
  );

  const ticketSummary = useTicketSummary(userId);
  const { data: routine } = useQuery({
    queryKey: ['routine', 'today', userId],
    queryFn: () => getTodayRoutine(userId!),
    enabled: !!userId,
  });

  const { cycle } = DEMO_PATIENT;
  const scheduledMeds = (routine?.medications ?? []).filter(m => !m.as_needed);
  const takenMeds = scheduledMeds.filter(m => m.taken).length;
  const morningPending = scheduledMeds.some(m => m.period === 'morning' && !m.taken);
  const hasFever = (routine?.temperature ?? 0) >= FEVER_THRESHOLD;

  const summary = [
    `Dia ${cycle.day} do ciclo.`,
    'Neutrófilos baixos — cuidado com exposição.',
    hasFever
      ? `Temperatura ${routine?.temperature}°C — siga o protocolo de emergência.`
      : morningPending
        ? 'Meds da manhã pendentes.'
        : 'Meds da manhã em dia.',
  ].join(' ');

  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const openEmergency = () => setEmergencyOpen(true);

  return (
    <View style={hubStyles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <HubHeader
          name={DEMO_PATIENT.firstName}
          badge={` Paciente • ${DEMO_PATIENT.protocol} C${cycle.current}/${cycle.total} D${cycle.day}`}
          badgeIcon="local-florist"
          avatar={DEMO_PATIENT.avatar}
          searchPlaceholder="Navegue com Ani..."
          progress={{
            ratio: cycle.day / cycle.length,
            label: `D${cycle.day}/${cycle.length} • Ciclo ${cycle.current}/${cycle.total}`,
          }}
          onAvatarPress={() => router.push('/profile')}
          onSearchPress={() => setCommandCenterOpen(true)}
        />

        <View style={hubStyles.body}>
          {/* Resumo do dia (Ani) */}
          <LinearGradient
            colors={[BRAND.SURFACE.CARD, W.BG]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.summaryCard}
          >
            <MaterialIcons name="auto-awesome" size={20} color={BRAND.SECONDARY.DEFAULT} />
            <Text style={styles.summaryText}>{summary}</Text>
          </LinearGradient>

          {/* Minha Jornada */}
          <Card>
            <View style={[hubCardStyles.rowBetween, { marginBottom: 12 }]}>
              <View style={[hubCardStyles.row, { gap: 8 }]}>
                <MaterialIcons name="balance" size={16} color={BRAND.PRIMARY.DEFAULT} />
                <Text style={hubCardStyles.cardTitle}>Minha Jornada</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillText}>{DEMO_JOURNEY.onTime ? '✓ No prazo' : '! Fora do prazo'}</Text>
              </View>
            </View>
            <View style={styles.timeline}>
              <View style={styles.timelineLine} />
              {DEMO_JOURNEY.steps.map(step => {
                const color = step.id === 'today' ? BRAND.SECONDARY.DEFAULT : W.TAUPE;
                return (
                  <View key={step.id} style={styles.timelineStep}>
                    <View style={[styles.timelineDot, { borderColor: color }]}>
                      <JourneyIcon id={step.id} color={color} />
                    </View>
                    <Text style={styles.timelineLabel}>{step.label}</Text>
                    <Text style={styles.timelineDate}>{step.date}</Text>
                    {step.badge && (
                      <View style={[styles.pill, styles.timelineBadge]}>
                        <Text style={styles.timelineBadgeText}>{step.badge}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </Card>

          {/* Protocolo de Emergência */}
          <TouchableOpacity activeOpacity={0.88} onPress={openEmergency} style={[hubCardStyles.card, hubCardStyles.rowBetween, styles.emergencyCard]}>
            <View style={[hubCardStyles.row, { gap: 12, flex: 1 }]}>
              <IconBox name="warning" color={W.DANGER_ICON} background="rgba(251,44,54,0.1)" size={40} iconSize={20} radius={14} />
              <View style={{ flex: 1 }}>
                <Text style={[hubCardStyles.cardTitle, { color: W.DANGER }]}>Protocolo de Emergência</Text>
                <Text style={hubCardStyles.cardMeta}>Febre ≥ 37.8°C → Pronto-Socorro</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={W.DANGER} />
          </TouchableOpacity>

          {/* Exame em destaque */}
          <View style={styles.labCard}>
            <View style={hubCardStyles.rowBetween}>
              <View style={[hubCardStyles.row, { gap: 10, flex: 1 }]}>
                <IconBox name="science" color={BRAND.SECONDARY.DEFAULT} background="rgba(255,154,92,0.2)" size={32} iconSize={16} radius={10} />
                <View>
                  <Text style={styles.labTitle}>
                    {`${DEMO_LABS.neutrophils.label} `}
                    <Text style={{ color: BRAND.SECONDARY.DEFAULT }}>
                      {DEMO_LABS.neutrophils.value} {DEMO_LABS.neutrophils.unit}
                    </Text>
                  </Text>
                  <Text style={styles.labMeta}>
                    {DEMO_LABS.neutrophils.date} • Normal: {DEMO_LABS.neutrophils.range}
                  </Text>
                </View>
              </View>
              <View style={[styles.pill, { backgroundColor: 'rgba(255,154,92,0.2)' }]}>
                <Text style={styles.pillText}>{DEMO_LABS.neutrophils.status}</Text>
              </View>
            </View>
            <View style={[hubCardStyles.row, { gap: 6, alignItems: 'flex-start' }]}>
              <MaterialIcons name="warning" size={14} color={BRAND.SECONDARY.DEFAULT} style={{ marginTop: 1 }} />
              <Text style={styles.labAdvice}>{DEMO_LABS.neutrophils.advice}</Text>
            </View>
          </View>

          {/* Atalhos */}
          <View style={hubStyles.grid}>
            <ActionTile
              variant="white"
              height={127}
              icon={
                <View style={styles.tileIconLight}>
                  <MaterialCommunityIcons name="pill" size={18} color={BRAND.PRIMARY.DEFAULT} />
                </View>
              }
              title="Meus Meds"
              subtitle={`${takenMeds} de ${scheduledMeds.length} tomados`}
              progress={scheduledMeds.length ? takenMeds / scheduledMeds.length : 0}
              onPress={() => router.push('/(tabs)/routine')}
            />
            <ActionTile
              variant="orange"
              height={127}
              icon={<IconBox name="device-thermostat" color={BRAND.SURFACE.CARD} background="rgba(255,255,255,0.2)" />}
              title="Sintomas"
              subtitle="Registrar agora"
              onPress={() => router.push('/(tabs)/body-map')}
            />
            <ActionTile
              variant="brown"
              height={110}
              icon={<IconBox name="science" color={BRAND.SURFACE.CARD} background="rgba(255,255,255,0.1)" />}
              title="Exames"
              subtitle={DEMO_LABS.lastExamSummary}
              subtitleColor={W.TAN}
              onPress={() => router.push('/(tabs)/docs')}
            />
            <ActionTile
              variant="white"
              height={110}
              icon={<IconBox name="assignment" color={W.TAUPE} background={W.BG} />}
              title="Chamados"
              subtitle={ticketSummary}
              onPress={() => router.push('/tickets')}
            />
          </View>

          <AppointmentCard
            title="Próxima Consulta"
            when={DEMO_APPOINTMENT.when}
            doctor={`${DEMO_APPOINTMENT.doctor} • ${DEMO_APPOINTMENT.specialty}`}
          />

          <ScanBanner
            title="Tire foto de um laudo"
            subtitle="A Ani explica em linguagem simples + sugere perguntas"
            onPress={() => router.push('/(tabs)/docs')}
          />
        </View>
      </ScrollView>

      <AniCommandModal
        visible={commandCenterOpen}
        title="Navegue com Ani"
        placeholder="Ex: Posso tomar vacina com neutrófilos baixos?"
        onClose={() => setCommandCenterOpen(false)}
      />

      <Modal visible={emergencyOpen} transparent animationType="fade" onRequestClose={() => setEmergencyOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setEmergencyOpen(false)}>
          <Pressable style={styles.modalCard}>
            <View style={[hubCardStyles.row, { gap: 12, marginBottom: 14 }]}>
              <IconBox name="warning" color={W.DANGER_ICON} background="rgba(251,44,54,0.1)" size={40} iconSize={20} radius={14} />
              <View style={{ flex: 1 }}>
                <Text style={[hubCardStyles.cardTitle, { color: W.DANGER, fontSize: 16 }]}>Protocolo de Emergência</Text>
                <Text style={hubCardStyles.cardMeta}>Febre ≥ 37,8°C durante a quimio é urgência</Text>
              </View>
            </View>
            {EMERGENCY_STEPS.map((step, i) => (
              <View key={step} style={styles.emergencyStep}>
                <View style={styles.emergencyNum}>
                  <Text style={styles.emergencyNumText}>{i + 1}</Text>
                </View>
                <Text style={styles.emergencyText}>{step}</Text>
              </View>
            ))}
            <Text style={[hubCardStyles.cardMeta, { marginTop: 6, marginBottom: 16 }]}>
              A Ani avisa {DEMO_APPOINTMENT.doctor} e seu cuidador automaticamente.
            </Text>
            <TouchableOpacity style={styles.emergencyButton} onPress={() => setEmergencyOpen(false)}>
              <Text style={styles.emergencyButtonText}>Entendi</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const EMERGENCY_STEPS = [
  'Não tome antitérmico antes de falar com a equipe.',
  'Vá ao Pronto-Socorro mais próximo e diga que faz quimioterapia.',
  'Leve a carteirinha do tratamento e a lista de medicamentos.',
];

const styles = StyleSheet.create({
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: W.BORDER,
    shadowColor: BRAND.PRIMARY.DEFAULT,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 3,
  },
  summaryText: {
    flex: 1,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    lineHeight: 16.5,
    color: BRAND.PRIMARY.DEFAULT,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(166,141,126,0.15)',
  },
  pillText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 10,
    lineHeight: 15,
    color: BRAND.PRIMARY.DEFAULT,
  },
  timeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 75,
  },
  timelineLine: {
    position: 'absolute',
    top: 11,
    left: 12,
    right: 12,
    height: 2,
    borderRadius: 999,
    backgroundColor: W.TAUPE,
  },
  timelineStep: {
    flex: 1,
    alignItems: 'center',
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: BRAND.SURFACE.CARD,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  timelineLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 9,
    lineHeight: 11.25,
    color: BRAND.PRIMARY.DEFAULT,
    textAlign: 'center',
  },
  timelineDate: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 9,
    lineHeight: 13.5,
    color: W.TEXT_MUTED,
    textAlign: 'center',
  },
  timelineBadge: {
    marginTop: 2,
    paddingHorizontal: 4,
  },
  timelineBadgeText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 8,
    lineHeight: 12,
    color: BRAND.PRIMARY.DEFAULT,
  },
  emergencyCard: {
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 16,
  },
  labCard: {
    gap: 12,
    padding: 17,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,154,92,0.3)',
    backgroundColor: 'rgba(255,154,92,0.08)',
  },
  labTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 12,
    lineHeight: 18,
    color: BRAND.PRIMARY.DEFAULT,
  },
  labMeta: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 10,
    lineHeight: 15,
    color: W.TEXT_MUTED,
  },
  labAdvice: {
    flex: 1,
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    lineHeight: 16.5,
    color: BRAND.PRIMARY.DEFAULT,
  },
  tileIconLight: {
    width: 32,
    height: 32,
    borderRadius: 14,
    backgroundColor: W.BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(64, 50, 41, 0.6)',
  },
  modalCard: {
    padding: 22,
    borderRadius: 28,
    backgroundColor: BRAND.SURFACE.CARD,
  },
  emergencyStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  emergencyNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(251,44,54,0.1)',
  },
  emergencyNumText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 11,
    color: W.DANGER,
  },
  emergencyText: {
    flex: 1,
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    lineHeight: 19,
    color: BRAND.PRIMARY.DEFAULT,
  },
  emergencyButton: {
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: W.DANGER,
  },
  emergencyButtonText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: BRAND.SURFACE.CARD,
  },
});
