/**
 * @fileoverview Body Map record details — view, edit (grade, type, note) and delete.
 *
 * @module pages/body-map/BodyMapDetailsPage
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthStore } from '@/shared/lib/zustand-persist';
import { getBodyMapHistory, updateBodyMapEntry, deleteBodyMapEntry } from '@/shared/api/body-map';
import { BRAND } from '@/shared/constants/brand-colors.const';
import { confirmAction, notify } from '@/shared/lib/notify';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';
import { Chip, FieldLabel, FormCard, Pill, PrimaryButton, SecondaryButton, TextField, formStyles } from '@/shared/ui/FormKit';

import { BodyFigure, type BodyRegionId } from './BodyFigure';
import {
  LEGEND,
  SOURCE_LABEL,
  SYMPTOM_TYPES,
  gradeLabel,
  intensityColor,
  regionLabel,
  type BodySide,
  type SymptomType,
} from './body-map-meta';

const W = BRAND.WARM;

function guidance(grade: number) {
  if (grade >= 4) return 'Sintoma intenso. Se vier com febre, falta de ar ou piora rápida, vá ao Pronto-Socorro. A Ani já avisou sua equipe.';
  if (grade >= 3) return 'Sintoma moderado a forte. A Dra. Sandra recebeu o alerta no painel — registre de novo se mudar.';
  if (grade >= 1) return 'Sintoma leve. Continue registrando a evolução; isso ajuda a equipe a ajustar o tratamento.';
  return 'Sem dor registrada nesta região.';
}

export function BodyMapDetailsPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = useAuthStore(s => s.userId);
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [intensity, setIntensity] = useState(0);
  const [symptomType, setSymptomType] = useState<SymptomType>('dor');
  const [note, setNote] = useState('');

  const { data: history, isLoading } = useQuery({
    queryKey: ['body-map', userId],
    queryFn: () => getBodyMapHistory(userId!),
    enabled: !!userId,
  });

  const entry = history?.find(h => h.id === id);

  const resetForm = () => {
    if (!entry) return;
    setIntensity(entry.intensity);
    setSymptomType((entry.symptom_types[0] as SymptomType) ?? 'outro');
    setNote(entry.description || '');
  };

  useEffect(resetForm, [entry]);

  const updateMutation = useMutation({
    mutationFn: () => updateBodyMapEntry(id!, { intensity, symptom_types: [symptomType], description: note.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['body-map', userId] });
      setIsEditing(false);
    },
    onError: () => notify('Erro', 'Não foi possível salvar as alterações.'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteBodyMapEntry(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['body-map', userId] });
      router.back();
    },
    onError: () => notify('Erro', 'Não foi possível excluir o registro.'),
  });

  const handleDelete = async () => {
    if (await confirmAction('Excluir registro', 'Este sintoma sai do seu Body Map e do painel da equipe. Continuar?', 'Excluir')) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <View style={[formStyles.screen, styles.center]}>
        <ActivityIndicator color={BRAND.SECONDARY.DEFAULT} size="large" />
      </View>
    );
  }

  if (!entry) {
    return (
      <View style={[formStyles.screen, { paddingTop: insets.top }]}>
        <ScreenHeader title="Detalhes do sintoma" />
        <View style={styles.center}>
          <Text style={formStyles.meta}>Registro não encontrado — ele pode ter sido excluído.</Text>
        </View>
      </View>
    );
  }

  const side = entry.body_view as BodySide;
  const region = regionLabel(entry.body_region, side);
  const shownGrade = isEditing ? intensity : entry.intensity;
  const color = intensityColor(shownGrade);
  const type = SYMPTOM_TYPES.find(s => s.id === entry.symptom_types[0]);
  const cvNotes = typeof entry.cv_classification === 'string' ? entry.cv_classification : entry.cv_classification?.clinical_notes;
  const when = new Date(entry.registered_at).toLocaleString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={[formStyles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Detalhes do sintoma"
        subtitle={`${side === 'back' ? 'Costas' : 'Frente'} • ${entry.source ? SOURCE_LABEL[entry.source] ?? 'via App' : 'via App'}`}
        right={
          <TouchableOpacity onPress={handleDelete} style={styles.deleteIcon} accessibilityLabel="Excluir registro">
            <MaterialIcons name="delete-outline" size={20} color={W.DANGER} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={formStyles.content} showsVerticalScrollIndicator={false}>
        {/* Resumo */}
        <FormCard style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
          <View style={styles.figureBox}>
            <BodyFigure
              width={86}
              height={136}
              fills={{ [entry.body_region as BodyRegionId]: color }}
              onRegionPress={() => {}}
            />
          </View>
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={styles.region}>{region}</Text>
            <View style={[formStyles.row, { gap: 6, flexWrap: 'wrap' }]}>
              <Pill label={gradeLabel(shownGrade)} color={BRAND.SURFACE.CARD} background={color} />
              <Pill label={type?.label ?? entry.symptom_types.join(', ')} color={BRAND.PRIMARY.DEFAULT} background={W.BG} />
            </View>
            <Text style={formStyles.meta}>{when}</Text>
            {entry.suggested_ctcae_grade != null && (
              <Text style={formStyles.meta}>CTCAE sugerido: grau {entry.suggested_ctcae_grade}</Text>
            )}
          </View>
        </FormCard>

        {!isEditing ? (
          <>
            <FormCard>
              <View style={formStyles.rowBetween}>
                <Text style={formStyles.sectionTitle}>Observações</Text>
                <TouchableOpacity style={styles.editLink} onPress={() => setIsEditing(true)}>
                  <MaterialIcons name="edit" size={14} color={BRAND.SECONDARY.DEFAULT} />
                  <Text style={styles.editLinkText}>Editar</Text>
                </TouchableOpacity>
              </View>
              <Text style={[formStyles.body, !entry.description && { color: W.TAUPE }]}>
                {entry.description || 'Nenhuma observação informada.'}
              </Text>
            </FormCard>

            {(entry.photo_url || cvNotes) && (
              <FormCard>
                <View style={[formStyles.row, { gap: 8 }]}>
                  <MaterialIcons name="center-focus-strong" size={18} color={BRAND.AUX.PURPLE} />
                  <Text style={formStyles.sectionTitle}>Análise visual</Text>
                </View>
                {entry.photo_url ? <Image source={{ uri: entry.photo_url }} style={styles.photo} resizeMode="cover" /> : null}
                {cvNotes ? <Text style={formStyles.body}>{cvNotes}</Text> : null}
              </FormCard>
            )}

            <View style={[styles.guidance, { borderColor: color + '66', backgroundColor: color + '14' }]}>
              <MaterialIcons name="auto-awesome" size={16} color={BRAND.SECONDARY.DEFAULT} />
              <Text style={styles.guidanceText}>{guidance(entry.intensity)}</Text>
            </View>

            <SecondaryButton title="Excluir registro" icon="delete-outline" tone="danger" onPress={handleDelete} />
          </>
        ) : (
          <>
            <FormCard>
              <FieldLabel>Intensidade / Grau</FieldLabel>
              <View style={styles.gradeRow}>
                {LEGEND.map((l, i) => (
                  <TouchableOpacity
                    key={l.label}
                    onPress={() => setIntensity(i)}
                    style={[styles.gradeBtn, intensity === i && { backgroundColor: l.color, borderColor: l.color }]}
                  >
                    <Text style={[styles.gradeText, intensity === i && { color: BRAND.SURFACE.CARD }]}>{i === 5 ? '4+' : i}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <FieldLabel>Tipo de sintoma</FieldLabel>
              <View style={formStyles.chipRow}>
                {SYMPTOM_TYPES.map(s => (
                  <Chip key={s.id} label={s.label} selected={symptomType === s.id} onPress={() => setSymptomType(s.id)} />
                ))}
              </View>

              <FieldLabel>Observações</FieldLabel>
              <TextField value={note} onChangeText={setNote} placeholder="Como está, quando piora, o que ajuda..." multiline />
            </FormCard>

            <PrimaryButton
              title="Salvar alterações"
              icon="check"
              onPress={() => updateMutation.mutate()}
              loading={updateMutation.isPending}
            />
            <SecondaryButton
              title="Cancelar"
              onPress={() => {
                resetForm();
                setIsEditing(false);
              }}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  deleteIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(251,44,54,0.08)',
  },
  figureBox: {
    width: 104,
    height: 150,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: W.BG_SOFT,
  },
  region: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 18,
    lineHeight: 24,
    color: BRAND.PRIMARY.DEFAULT,
  },
  editLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,154,92,0.1)',
  },
  editLinkText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: BRAND.SECONDARY.DEFAULT,
  },
  photo: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    backgroundColor: W.BG,
  },
  guidance: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  guidanceText: {
    flex: 1,
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    lineHeight: 18,
    color: BRAND.PRIMARY.DEFAULT,
  },
  gradeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  gradeBtn: {
    flex: 1,
    height: 40,
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
});
