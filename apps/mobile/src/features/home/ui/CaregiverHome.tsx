/**
 * @fileoverview Caregiver Hub — matches the "Cuidador" frame in Figma (Startup One / Next).
 *
 * @module features/home/ui/CaregiverHome
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
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
  DEMO_CAREGIVER,
  DEMO_LABS,
  DEMO_APPOINTMENT,
  DEMO_CAREGIVER_TASKS,
  DEMO_CAREGIVER_TIPS,
  type CaregiverTask,
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

const TASK_TAG_COLOR: Record<CaregiverTask['tag'], string> = {
  Médico: BRAND.PRIMARY.DEFAULT,
  IA: BRAND.SECONDARY.DEFAULT,
  Rotina: W.TAUPE,
};

export function CaregiverHome() {
  const router = useRouter();
  const [commandCenterOpen, setCommandCenterOpen] = useState(false);
  const [tasks, setTasks] = useState(DEMO_CAREGIVER_TASKS);
  const userId = useAuthStore(s => s.userId);
  const patientName = DEMO_PATIENT.firstName;

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

  // The medication check-in task completes itself once the patient logs the dose (app or WhatsApp).
  const morningOndansetronTaken = scheduledMeds.some(m => m.name === 'Ondansetrona' && m.period === 'morning' && m.taken);
  const visibleTasks = tasks.map(t => (t.id === 'ondansetrona' && morningOndansetronTaken ? { ...t, done: true } : t));
  const doneTasks = visibleTasks.filter(t => t.done).length;

  const toggleTask = (id: string) =>
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, done: !t.done } : t)));

  return (
    <View style={hubStyles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <HubHeader
          name={DEMO_CAREGIVER.firstName}
          badge={` Cuidador • Apoiando ${patientName}`}
          badgeIcon="favorite"
          initials={DEMO_CAREGIVER.initials}
          searchPlaceholder={`Pergunte sobre ${patientName}...`}
          progress={{
            ratio: cycle.day / cycle.length,
            label: `${patientName} • D${cycle.day}/${cycle.length} • Ciclo ${cycle.current}/${cycle.total}`,
          }}
          onAvatarPress={() => router.push('/profile')}
          onSearchPress={() => setCommandCenterOpen(true)}
        />

        <View style={hubStyles.body}>
          <View style={hubStyles.grid}>
            <ActionTile
              variant="white"
              height={119}
              icon={
                <View style={styles.tileIconLight}>
                  <MaterialCommunityIcons name="pill" size={18} color={BRAND.PRIMARY.DEFAULT} />
                </View>
              }
              title={`Meds de ${patientName}`}
              subtitle={`${takenMeds} de ${scheduledMeds.length} tomados`}
              progress={scheduledMeds.length ? takenMeds / scheduledMeds.length : 0}
              onPress={() => router.push('/(tabs)/routine')}
            />
            <ActionTile
              variant="blue"
              height={119}
              icon={<IconBox name="device-thermostat" color={BRAND.SURFACE.CARD} background="rgba(255,255,255,0.2)" />}
              title="Sintomas"
              subtitle={`Registrar por ${patientName}`}
              onPress={() => router.push('/(tabs)/body-map')}
            />
            <ActionTile
              variant="purple"
              height={119}
              icon={<IconBox name="science" color={BRAND.SURFACE.CARD} background="rgba(255,255,255,0.1)" />}
              title="Exames"
              subtitle={DEMO_LABS.lastExamSummary}
              subtitleColor="#FBEBE2"
              onPress={() => router.push('/(tabs)/docs')}
            />
            <ActionTile
              variant="white"
              height={119}
              icon={<IconBox name="assignment" color={W.TAUPE} background={W.BG} />}
              title="Chamados"
              subtitle={ticketSummary}
              onPress={() => router.push('/tickets')}
            />
          </View>

          <AppointmentCard
            title={`Próxima consulta de ${patientName}`}
            when={DEMO_APPOINTMENT.when}
            doctor={`${DEMO_APPOINTMENT.doctor} • ${DEMO_APPOINTMENT.specialty}`}
          />

          {/* Tarefas do cuidador */}
          <Card style={{ borderColor: 'rgba(166,141,126,0.25)' }}>
            <View style={[hubCardStyles.rowBetween, { marginBottom: 6 }]}>
              <View style={[hubCardStyles.row, { gap: 8 }]}>
                <MaterialIcons name="check-circle-outline" size={16} color={BRAND.PRIMARY.DEFAULT} />
                <Text style={hubCardStyles.cardTitle}>Suas tarefas de hoje</Text>
              </View>
              <View style={styles.countPill}>
                <Text style={styles.countPillText}>{doneTasks}/{visibleTasks.length} feitas</Text>
              </View>
            </View>
            {visibleTasks.map((task, i) => (
              <TouchableOpacity
                key={task.id}
                activeOpacity={0.7}
                onPress={() => toggleTask(task.id)}
                style={[styles.taskRow, i < visibleTasks.length - 1 && styles.taskDivider]}
              >
                <View style={[styles.taskCheck, task.done && styles.taskCheckDone]}>
                  {task.done && <MaterialIcons name="check" size={11} color={BRAND.SURFACE.CARD} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.taskTitle, task.done && styles.taskTitleDone]}>{task.title}</Text>
                  <View style={[hubCardStyles.row, { gap: 8, marginTop: 4 }]}>
                    <Text style={[styles.taskTag, { color: task.done ? W.TAUPE : TASK_TAG_COLOR[task.tag] }]}>{task.tag}</Text>
                    <Text style={styles.taskWhen}>{task.when}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </Card>

          {/* Navegação oncológica (dicas da Ani) */}
          <LinearGradient
            colors={['rgba(114,90,193,0.08)', 'rgba(37,92,153,0.06)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.aniCard}
          >
            <View style={[hubCardStyles.row, { gap: 8 }]}>
              <IconBox name="explore" color={BRAND.PRIMARY.DEFAULT} background="rgba(114,90,193,0.15)" size={32} iconSize={17} radius={10} />
              <View>
                <Text style={hubCardStyles.cardTitle}>Navegação Oncológica · Ani</Text>
                <Text style={styles.aniSubtitle}>Orientações personalizadas para você</Text>
              </View>
            </View>
            {DEMO_CAREGIVER_TIPS.map(tip => (
              <View key={tip.id} style={styles.tip}>
                <MaterialIcons name={tip.icon} size={15} color={BRAND.PRIMARY.DEFAULT} style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.tipText}>{tip.text}</Text>
                  {tip.action && (
                    <TouchableOpacity
                      style={[hubCardStyles.row, { gap: 4, marginTop: 6 }]}
                      onPress={() => router.push({ pathname: '/(tabs)/chat', params: { initialQuery: tip.text } })}
                    >
                      <Text style={styles.tipAction}>{tip.action}</Text>
                      <MaterialIcons name="arrow-forward" size={11} color={BRAND.PRIMARY.DEFAULT} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </LinearGradient>

          <ScanBanner
            title="Envie um laudo para a Ani"
            subtitle="Ela explica em linguagem simples e sugere perguntas para o médico"
            onPress={() => router.push('/(tabs)/docs')}
          />
        </View>
      </ScrollView>

      <AniCommandModal
        visible={commandCenterOpen}
        title="Assistente Ani"
        placeholder={`Ex: Quais os efeitos da Capecitabina na ${patientName}?`}
        onClose={() => setCommandCenterOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tileIconLight: {
    width: 32,
    height: 32,
    borderRadius: 14,
    backgroundColor: W.BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countPill: {
    height: 19,
    paddingHorizontal: 8,
    borderRadius: 999,
    justifyContent: 'center',
    backgroundColor: 'rgba(166,141,126,0.12)',
  },
  countPillText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 10,
    color: W.TEXT_MUTED,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingTop: 10,
    paddingBottom: 11,
  },
  taskDivider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  taskCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: W.TAUPE,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCheckDone: {
    backgroundColor: W.TAN,
    borderColor: W.TAN,
  },
  taskTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    lineHeight: 15,
    color: BRAND.PRIMARY.DEFAULT,
  },
  taskTitleDone: {
    color: W.TAUPE,
    textDecorationLine: 'line-through',
  },
  taskTag: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 9,
    lineHeight: 13.5,
  },
  taskWhen: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 10,
    lineHeight: 15,
    color: W.TEXT_MUTED,
  },
  aniCard: {
    gap: 10,
    padding: 17,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(114,90,193,0.2)',
  },
  aniSubtitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 10,
    lineHeight: 15,
    color: W.TEXT_MUTED,
  },
  tip: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  tipText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    lineHeight: 17.9,
    color: BRAND.PRIMARY.DEFAULT,
  },
  tipAction: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 11,
    lineHeight: 16.5,
    color: BRAND.PRIMARY.DEFAULT,
  },
});
