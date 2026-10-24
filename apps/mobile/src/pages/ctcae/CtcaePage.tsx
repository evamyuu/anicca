/**
 * @fileoverview Sintomas CTCAE — self-grading of common chemotherapy adverse events
 * (NCI CTCAE v5.0, patient-friendly wording). Records go to the care team panel.
 *
 * @module pages/ctcae/CtcaePage
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/shared/lib/zustand-persist';
import { listSymptoms, createSymptoms, deleteSymptom, type SymptomRecord } from '@/shared/api/symptoms';
import { BRAND } from '@/shared/constants/brand-colors.const';
import { confirmAction, notify } from '@/shared/lib/notify';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';
import { EmptyState, FieldLabel, FormCard, Pill, PrimaryButton, TextField, formStyles } from '@/shared/ui/FormKit';

const W = BRAND.WARM;

const GRADE_COLORS = [BRAND.PAIN.NONE, BRAND.PAIN.G1, BRAND.PAIN.G2, BRAND.PAIN.G3, BRAND.PAIN.G5];

interface CtcaeSymptom {
  id: string;
  label: string;
  icon: React.ReactNode;
  /** Descriptions for grades 0…max (CTCAE caps some symptoms at grade 3). */
  grades: string[];
}

const SYMPTOMS: CtcaeSymptom[] = [
  {
    id: 'nausea', label: 'Náusea', icon: <MaterialCommunityIcons name="emoticon-sick-outline" size={18} color={BRAND.PRIMARY.DEFAULT} />,
    grades: ['Não tive', 'Perda de apetite, sem mudar a alimentação', 'Come menos, sem perder peso nem desidratar', 'Não consegue comer nem beber o suficiente'],
  },
  {
    id: 'vomito', label: 'Vômito', icon: <MaterialIcons name="sick" size={18} color={BRAND.PRIMARY.DEFAULT} />,
    grades: ['Não tive', '1–2 vezes em 24 horas', '3–5 vezes em 24 horas', '6 vezes ou mais / precisou de soro', 'Risco de vida — procure urgência'],
  },
  {
    id: 'diarreia', label: 'Diarreia', icon: <MaterialIcons name="water-drop" size={18} color={BRAND.PRIMARY.DEFAULT} />,
    grades: ['Não tive', 'Até 3 evacuações a mais que o normal', '4–6 evacuações a mais por dia', '7 ou mais por dia ou perda de controle', 'Risco de vida — procure urgência'],
  },
  {
    id: 'fadiga', label: 'Fadiga', icon: <MaterialIcons name="battery-2-bar" size={18} color={BRAND.PRIMARY.DEFAULT} />,
    grades: ['Não tive', 'Cansaço que melhora com descanso', 'Não melhora com descanso, limita tarefas do dia', 'Não melhora com descanso, limita o autocuidado'],
  },
  {
    id: 'mucosite', label: 'Mucosite (boca)', icon: <MaterialIcons name="sentiment-dissatisfied" size={18} color={BRAND.PRIMARY.DEFAULT} />,
    grades: ['Não tive', 'Feridas leves, sem dor importante', 'Dor moderada, precisa mudar a dieta', 'Dor forte, não consegue comer', 'Risco de vida — procure urgência'],
  },
  {
    id: 'neuropatia', label: 'Formigamento (neuropatia)', icon: <MaterialIcons name="back-hand" size={18} color={BRAND.PRIMARY.DEFAULT} />,
    grades: ['Não tive', 'Leve, não atrapalha', 'Moderado, atrapalha tarefas (abotoar, escrever)', 'Forte, atrapalha o autocuidado', 'Risco de vida — procure urgência'],
  },
  {
    id: 'mao_pe', label: 'Síndrome mão-pé', icon: <MaterialIcons name="front-hand" size={18} color={BRAND.PRIMARY.DEFAULT} />,
    grades: ['Não tive', 'Vermelhidão ou inchaço sem dor', 'Descamação, bolhas ou dor que limita tarefas', 'Lesões com dor forte, limita o autocuidado'],
  },
];

export function CtcaePage() {
  const insets = useSafeAreaInsets();
  const userId = useAuthStore(s => s.userId);
  const queryClient = useQueryClient();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['symptoms', userId],
    queryFn: () => listSymptoms(userId!),
    enabled: !!userId,
  });

  const answered = Object.entries(answers);

  const saveMutation = useMutation({
    mutationFn: () =>
      createSymptoms(
        userId!,
        answered.map(([id, grade]) => ({
          symptom_id: id,
          symptom_label: SYMPTOMS.find(s => s.id === id)?.label ?? id,
          grade,
          notes: notes.trim(),
        }))
      ),
    onSuccess: created => {
      queryClient.invalidateQueries({ queryKey: ['symptoms'] });
      setAnswers({});
      setNotes('');
      const severe = created.filter(r => r.grade >= 3);
      notify(
        severe.length ? 'Atenção' : 'Sintomas registrados',
        severe.length
          ? `${severe.map(r => r.symptom_label).join(', ')} em grau 3 ou mais. A equipe foi avisada — se piorar, procure o Pronto-Socorro.`
          : 'Obrigada! A Dra. Sandra vai ver a sua autoavaliação no painel.'
      );
    },
    onError: () => notify('Erro', 'Não foi possível registrar. Tente novamente.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSymptom(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['symptoms'] }),
    onError: () => notify('Erro', 'Não foi possível excluir o registro.'),
  });

  const handleDelete = async (record: SymptomRecord) => {
    if (await confirmAction('Excluir registro', `Excluir "${record.symptom_label} — grau ${record.grade}"?`, 'Excluir')) {
      deleteMutation.mutate(record.id);
    }
  };

  return (
    <View style={[formStyles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader title="Escala CTCAE" subtitle="Classificação de efeitos adversos (NCI CTCAE v5.0)" />

      <ScrollView contentContainerStyle={formStyles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={formStyles.meta}>Marque como cada sintoma esteve nas últimas 24 horas. Deixe em branco o que não quiser responder.</Text>

        {SYMPTOMS.map(symptom => {
          const grade = answers[symptom.id];
          return (
            <FormCard key={symptom.id}>
              <View style={[formStyles.row, { gap: 10 }]}>
                <View style={styles.symptomIcon}>{symptom.icon}</View>
                <Text style={[formStyles.sectionTitle, { flex: 1 }]}>{symptom.label}</Text>
                {grade != null && (
                  <TouchableOpacity onPress={() => setAnswers(({ [symptom.id]: _removed, ...rest }) => rest)}>
                    <Text style={styles.clear}>Limpar</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.gradeRow}>
                {symptom.grades.map((_, g) => {
                  const selected = grade === g;
                  return (
                    <TouchableOpacity
                      key={g}
                      onPress={() => setAnswers(prev => ({ ...prev, [symptom.id]: g }))}
                      style={[styles.gradeBtn, selected && { backgroundColor: GRADE_COLORS[g], borderColor: GRADE_COLORS[g] }]}
                    >
                      <Text style={[styles.gradeText, selected && { color: BRAND.SURFACE.CARD }]}>{g}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={[formStyles.meta, grade != null && { color: BRAND.PRIMARY.DEFAULT }]}>
                {grade != null ? `Grau ${grade}: ${symptom.grades[grade]}` : 'Toque no grau que melhor descreve'}
              </Text>
            </FormCard>
          );
        })}

        <FormCard>
          <FieldLabel>Observações (opcional)</FieldLabel>
          <TextField value={notes} onChangeText={setNotes} placeholder="Ex: piora à noite, melhorou com o remédio..." multiline />
        </FormCard>

        <PrimaryButton
          title={answered.length ? `Registrar ${answered.length} sintoma${answered.length > 1 ? 's' : ''}` : 'Registrar sintomas'}
          icon="send"
          onPress={() => saveMutation.mutate()}
          disabled={answered.length === 0}
          loading={saveMutation.isPending}
        />

        <Text style={[formStyles.sectionTitle, { marginTop: 8 }]}>Histórico</Text>
        {isLoading && <ActivityIndicator color={BRAND.SECONDARY.DEFAULT} />}
        {!isLoading && history.length === 0 && (
          <EmptyState icon="fact-check" title="Nenhuma autoavaliação ainda" subtitle="Seus registros aparecem aqui e no painel da equipe." />
        )}
        {history.map(record => (
          <View key={record.id} style={styles.historyRow}>
            <View style={[styles.historyGrade, { backgroundColor: (GRADE_COLORS[record.grade] ?? BRAND.PAIN.NONE) + '33', borderColor: GRADE_COLORS[record.grade] }]}>
              <Text style={styles.historyGradeText}>{record.grade}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.historyTitle}>{record.symptom_label}</Text>
              <Text style={formStyles.meta} numberOfLines={2}>
                {new Date(record.registered_at).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                {record.notes ? ` — ${record.notes}` : ''}
              </Text>
            </View>
            {record.grade >= 3 && <Pill label="Alerta" color={W.DANGER} background="rgba(251,44,54,0.1)" />}
            <TouchableOpacity onPress={() => handleDelete(record)} style={styles.historyDelete} accessibilityLabel="Excluir registro">
              <MaterialIcons name="delete-outline" size={18} color={W.DANGER} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  symptomIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: W.BG,
  },
  clear: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: BRAND.SECONDARY.DEFAULT,
  },
  gradeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  gradeBtn: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: W.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: W.BG,
  },
  gradeText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: W.TEXT_MUTED,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: W.BORDER,
    backgroundColor: BRAND.SURFACE.CARD,
  },
  historyGrade: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyGradeText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: BRAND.PRIMARY.DEFAULT,
  },
  historyTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    lineHeight: 19.5,
    color: BRAND.PRIMARY.DEFAULT,
  },
  historyDelete: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(251,44,54,0.06)',
  },
});
