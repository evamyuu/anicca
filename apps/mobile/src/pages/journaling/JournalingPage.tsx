/**
 * @fileoverview Diário emocional — mood check-ins with emotions and free text
 * (create, list, edit, delete). Entries also arrive from the WhatsApp Ani.
 *
 * @module pages/journaling/JournalingPage
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/shared/lib/zustand-persist';
import {
  listJournal,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  type JournalEntry,
} from '@/shared/api/journaling';
import { BRAND } from '@/shared/constants/brand-colors.const';
import { confirmAction, notify } from '@/shared/lib/notify';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';
import { Chip, EmptyState, FieldLabel, FormCard, Pill, PrimaryButton, SecondaryButton, TextField, formStyles } from '@/shared/ui/FormKit';

const W = BRAND.WARM;

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

const MOODS: { value: number; label: string; icon: MaterialIconName; color: string }[] = [
  { value: 1, label: 'Muito mal', icon: 'sentiment-very-dissatisfied', color: BRAND.PAIN.G5 },
  { value: 2, label: 'Mal',       icon: 'sentiment-dissatisfied',      color: BRAND.PAIN.G3 },
  { value: 3, label: 'Ok',        icon: 'sentiment-neutral',           color: BRAND.PAIN.G2 },
  { value: 4, label: 'Bem',       icon: 'sentiment-satisfied',         color: BRAND.PAIN.G1 },
  { value: 5, label: 'Muito bem', icon: 'sentiment-very-satisfied',    color: BRAND.SEMANTIC.SUCCESS },
];

const EMOTIONS = ['Cansada', 'Ansiosa', 'Triste', 'Com medo', 'Irritada', 'Tranquila', 'Esperançosa', 'Grata'];

const moodMeta = (value: number) => MOODS.find(m => m.value === value) ?? MOODS[2]!;

function aniReflection(entries: JournalEntry[]) {
  const recent = entries.slice(0, 3);
  if (recent.length >= 2 && recent.every(e => e.mood <= 2)) {
    return 'Seus últimos registros mostram dias difíceis. Que tal conversar com a psicóloga do hospital? Posso abrir um chamado para você.';
  }
  if (recent[0] && recent[0].mood >= 4) {
    return 'Que bom te ver bem! Anote o que ajudou hoje — isso vira um lembrete para os dias mais pesados.';
  }
  return 'Escrever sobre o que sente ajuda a aliviar a carga do tratamento. Ninguém além de você e sua equipe vê este diário.';
}

export function JournalingPage() {
  const insets = useSafeAreaInsets();
  const userId = useAuthStore(s => s.userId);
  const queryClient = useQueryClient();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [mood, setMood] = useState<number | null>(null);
  const [emotions, setEmotions] = useState<string[]>([]);
  const [text, setText] = useState('');

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['journaling', userId],
    queryFn: () => listJournal(userId!),
    enabled: !!userId,
  });

  const resetForm = () => {
    setEditingId(null);
    setMood(null);
    setEmotions([]);
    setText('');
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const input = { mood: mood ?? 3, emotions, text: text.trim() };
      return editingId ? updateJournalEntry(editingId, input) : createJournalEntry(userId!, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journaling'] });
      resetForm();
    },
    onError: () => notify('Erro', 'Não foi possível salvar no diário.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteJournalEntry(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['journaling'] }),
    onError: () => notify('Erro', 'Não foi possível excluir o registro.'),
  });

  const startEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setMood(entry.mood);
    setEmotions(entry.emotions);
    setText(entry.text);
  };

  const handleDelete = async (entry: JournalEntry) => {
    if (await confirmAction('Excluir registro', 'Apagar este registro do seu diário?', 'Excluir')) {
      if (editingId === entry.id) resetForm();
      deleteMutation.mutate(entry.id);
    }
  };

  const toggleEmotion = (e: string) =>
    setEmotions(prev => (prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]));

  return (
    <KeyboardAvoidingView style={[formStyles.screen, { paddingTop: insets.top }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Meu Diário" subtitle="Como você está se sentindo hoje?" />

      <ScrollView contentContainerStyle={formStyles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <FormCard>
          <View style={formStyles.rowBetween}>
            <Text style={formStyles.sectionTitle}>{editingId ? 'Editando registro' : 'Check-in de hoje'}</Text>
            {editingId && (
              <TouchableOpacity onPress={resetForm}>
                <Text style={styles.cancelLink}>Cancelar</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.moodRow}>
            {MOODS.map(m => {
              const selected = mood === m.value;
              return (
                <TouchableOpacity
                  key={m.value}
                  onPress={() => setMood(m.value)}
                  style={[styles.moodItem, selected && { backgroundColor: m.color + '26', borderColor: m.color }]}
                >
                  <MaterialIcons name={m.icon} size={28} color={selected ? m.color : W.TAUPE} />
                  <Text style={[styles.moodLabel, selected && { color: BRAND.PRIMARY.DEFAULT }]}>{m.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <FieldLabel>O que você está sentindo?</FieldLabel>
          <View style={formStyles.chipRow}>
            {EMOTIONS.map(e => (
              <Chip key={e} label={e} selected={emotions.includes(e)} onPress={() => toggleEmotion(e)} />
            ))}
          </View>

          <FieldLabel>Quer escrever mais?</FieldLabel>
          <TextField value={text} onChangeText={setText} placeholder="Escreva livremente sobre o seu dia..." multiline />

          <PrimaryButton
            title={editingId ? 'Salvar alterações' : 'Salvar no diário'}
            icon={editingId ? 'check' : 'edit-note'}
            onPress={() => saveMutation.mutate()}
            disabled={mood == null}
            loading={saveMutation.isPending}
          />
        </FormCard>

        <View style={styles.reflection}>
          <MaterialIcons name="auto-awesome" size={16} color={BRAND.SECONDARY.DEFAULT} />
          <Text style={styles.reflectionText}>{aniReflection(entries)}</Text>
        </View>

        <Text style={formStyles.sectionTitle}>Registros anteriores</Text>

        {isLoading && <ActivityIndicator color={BRAND.SECONDARY.DEFAULT} />}
        {!isLoading && entries.length === 0 && (
          <EmptyState icon="menu-book" title="Seu diário está vazio" subtitle="Faça o primeiro check-in acima ou conte para a Ani pelo WhatsApp." />
        )}

        {entries.map(entry => {
          const m = moodMeta(entry.mood);
          const when = new Date(entry.created_at).toLocaleString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
          return (
            <View key={entry.id} style={[styles.entry, editingId === entry.id && { borderColor: BRAND.SECONDARY.DEFAULT }]}>
              <View style={[formStyles.row, { gap: 12, alignItems: 'flex-start' }]}>
                <View style={[styles.entryMood, { backgroundColor: m.color + '26' }]}>
                  <MaterialIcons name={m.icon} size={22} color={m.color} />
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <View style={formStyles.rowBetween}>
                    <Text style={styles.entryTitle}>{m.label}</Text>
                    <Text style={styles.entryWhen}>{when}</Text>
                  </View>
                  {entry.emotions.length > 0 && (
                    <View style={[formStyles.chipRow, { gap: 4 }]}>
                      {entry.emotions.map(e => (
                        <Pill key={e} label={e} color={BRAND.PRIMARY.DEFAULT} background={W.BG} />
                      ))}
                    </View>
                  )}
                  {entry.text ? <Text style={formStyles.body}>{entry.text}</Text> : null}
                  {entry.source === 'whatsapp' && <Text style={styles.source}>via WhatsApp</Text>}
                </View>
              </View>
              <View style={styles.entryActions}>
                <SecondaryButton title="Editar" icon="edit" onPress={() => startEdit(entry)} style={{ flex: 1, height: 38 }} />
                <SecondaryButton title="Excluir" icon="delete-outline" tone="danger" onPress={() => handleDelete(entry)} style={{ flex: 1, height: 38 }} />
              </View>
            </View>
          );
        })}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  cancelLink: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: BRAND.SECONDARY.DEFAULT,
  },
  moodRow: {
    flexDirection: 'row',
    gap: 6,
  },
  moodItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: W.BG,
  },
  moodLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 9,
    color: W.TEXT_MUTED,
    textAlign: 'center',
  },
  reflection: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(114,90,193,0.2)',
    backgroundColor: 'rgba(114,90,193,0.06)',
  },
  reflectionText: {
    flex: 1,
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    lineHeight: 18,
    color: BRAND.PRIMARY.DEFAULT,
  },
  entry: {
    gap: 12,
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: W.BORDER,
    backgroundColor: BRAND.SURFACE.CARD,
  },
  entryMood: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: BRAND.PRIMARY.DEFAULT,
  },
  entryWhen: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 10,
    color: W.TAUPE,
  },
  source: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 10,
    color: BRAND.SEMANTIC.SUCCESS,
  },
  entryActions: {
    flexDirection: 'row',
    gap: 8,
  },
});
