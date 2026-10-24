/**
 * @fileoverview Body Map interativo (Figma "BodyMapScreen").
 * Cada grupo muscular da silhueta é clicável e fica colorido pelo grau do
 * sintoma registrado (app, WhatsApp ou cuidador), com anexo de foto para a
 * análise de visão computacional.
 *
 * @module pages/body-map/BodyMapPage
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Modal, Pressable, TextInput, ActivityIndicator, Image, RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { useAuthStore } from '@/shared/lib/zustand-persist';
import { createBodyMapEntry, getBodyMapHistory, uploadBodyMapPhoto } from '@/shared/api/body-map';
import { BRAND } from '@/shared/constants/brand-colors.const';
import { GradientButton } from '@/shared/ui/GradientButton';
import { notify } from '@/shared/lib/notify';

import { BodyFigure, type BodyRegionId } from './BodyFigure';
import {
  LEGEND,
  SOURCE_LABEL,
  SYMPTOM_TYPES,
  intensityColor,
  regionLabel,
  type BodySide,
  type SymptomType,
} from './body-map-meta';

const W = BRAND.WARM;

interface SymptomRecord {
  id?: string | undefined;
  zoneId: string;
  intensity: number;
  type: SymptomType;
  note: string;
  side: BodySide;
  timestamp: string;
  source?: string | undefined;
  imageUri?: string | undefined;
}

function SegmentedPill<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.segment}>
      {options.map(o => (
        <TouchableOpacity
          key={o.id}
          onPress={() => onChange(o.id)}
          style={[styles.segmentItem, value === o.id && styles.segmentItemActive]}
        >
          <Text style={[styles.segmentText, value === o.id && styles.segmentTextActive]}>{o.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function SymptomModal({
  zoneId,
  side,
  saving,
  onClose,
  onSave,
}: {
  zoneId: BodyRegionId | null;
  side: BodySide;
  saving: boolean;
  onClose: () => void;
  onSave: (record: SymptomRecord) => void;
}) {
  const [intensity, setIntensity] = useState(0);
  const [symptomType, setSymptomType] = useState<SymptomType | null>(null);
  const [note, setNote] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  if (!zoneId) return null;

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const reset = () => {
    setIntensity(0);
    setSymptomType(null);
    setNote('');
    setImageUri(null);
  };

  const handleSave = () => {
    if (!symptomType) return;
    onSave({
      zoneId,
      intensity,
      type: symptomType,
      note,
      side,
      timestamp: new Date().toISOString(),
      imageUri: imageUri || undefined,
    });
    reset();
  };

  return (
    <Modal transparent animationType="fade" visible={!!zoneId} onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalCard}>
          <View style={[styles.rowBetween, { marginBottom: 18 }]}>
            <Text style={styles.modalTitle}>{regionLabel(zoneId, side)}</Text>
            <TouchableOpacity onPress={onClose} accessibilityRole="button" style={styles.modalClose}>
              <MaterialIcons name="close" size={18} color={W.TEXT_MUTED} />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalLabel}>Intensidade / Grau</Text>
          <View style={styles.gradeRow}>
            {LEGEND.map((l, i) => (
              <TouchableOpacity
                key={l.label}
                onPress={() => setIntensity(i)}
                style={[
                  styles.gradeBtn,
                  intensity === i && { backgroundColor: l.color, borderColor: l.color },
                ]}
              >
                <Text style={[styles.gradeText, intensity === i && { color: BRAND.SURFACE.CARD }]}>
                  {i === 5 ? '4+' : i}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.modalLabel}>Tipo de sintoma</Text>
          <View style={styles.typeWrap}>
            {SYMPTOM_TYPES.map(s => (
              <TouchableOpacity
                key={s.id}
                onPress={() => setSymptomType(s.id)}
                style={[styles.typeChip, symptomType === s.id && styles.typeChipActive]}
              >
                <Text style={[styles.typeChipText, symptomType === s.id && { color: BRAND.SURFACE.CARD }]}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            placeholder="Observação (opcional)..."
            placeholderTextColor={W.TAUPE}
            value={note}
            onChangeText={setNote}
            multiline
            style={styles.noteInput}
          />

          <View style={styles.photoRow}>
            {imageUri ? (
              <View style={{ width: 56, height: 56 }}>
                <Image source={{ uri: imageUri }} style={{ width: 56, height: 56, borderRadius: 12 }} />
                <TouchableOpacity onPress={() => setImageUri(null)} style={styles.photoRemove}>
                  <MaterialIcons name="close" size={12} color={BRAND.ERROR.DEFAULT} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={handlePickImage} style={styles.photoBtn}>
                <MaterialIcons name="photo-camera" size={16} color={W.TEXT_MUTED} />
                <Text style={styles.photoBtnText}>Anexar foto (visão computacional)</Text>
              </TouchableOpacity>
            )}
          </View>

          <GradientButton
            title={saving ? 'Registrando...' : 'Registrar sintoma'}
            onPress={handleSave}
            disabled={!symptomType || saving}
            colors={[BRAND.SECONDARY[600], BRAND.SECONDARY[700]]}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function BodyMapPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [side, setSide] = useState<BodySide>('front');
  const [gender, setGender] = useState<'homem' | 'mulher'>('mulher');
  const [viewMode, setViewMode] = useState<'mapa' | 'historico'>('mapa');
  const [selectedZone, setSelectedZone] = useState<BodyRegionId | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{ title: string; body: string } | null>(null);
  const lastSeenRef = useRef<string | null>(null);

  const userId = useAuthStore(s => s.userId);
  const queryClient = useQueryClient();

  const { data: history, isLoading, refetch } = useQuery({
    queryKey: ['body-map', userId],
    queryFn: () => getBodyMapHistory(userId!),
    enabled: !!userId,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Symptoms reported in another channel (WhatsApp, caregiver) arrive via the hub sync.
  useEffect(() => {
    if (!history?.length) return;
    const newest = [...history].sort((a, b) => b.registered_at.localeCompare(a.registered_at))[0]!;
    const source = newest.source;
    if (lastSeenRef.current && newest.registered_at > lastSeenRef.current && source && source !== 'app') {
      setToast({
        title: `Novo sintoma ${SOURCE_LABEL[source] ?? ''}`.trim(),
        body: `${regionLabel(newest.body_region, newest.body_view as BodySide)} • grau ${newest.intensity === 5 ? '4+' : newest.intensity}`,
      });
    }
    lastSeenRef.current = newest.registered_at;
  }, [history]);

  const saveMutation = useMutation({
    mutationFn: async (record: SymptomRecord) => {
      const entry = await createBodyMapEntry({
        patient_id: userId!,
        body_region: record.zoneId,
        body_view: record.side,
        intensity: record.intensity,
        symptom_types: [record.type],
        description: record.note,
      });
      if (record.imageUri) {
        await uploadBodyMapPhoto(entry.id, record.imageUri);
      }
      return entry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['body-map', userId] });
    },
  });

  const records: SymptomRecord[] = (history ?? []).map(h => ({
    id: h.id,
    zoneId: h.body_region,
    intensity: h.intensity,
    type: h.symptom_types[0] as SymptomType,
    note: h.description || '',
    side: h.body_view as BodySide,
    timestamp: h.registered_at,
    source: h.source,
  }));

  const fills: Partial<Record<BodyRegionId, string>> = {};
  for (const r of records) {
    if (r.side !== side) continue;
    const zone = r.zoneId as BodyRegionId;
    const current = records
      .filter(o => o.side === side && o.zoneId === zone)
      .reduce((max, o) => Math.max(max, o.intensity), 0);
    fills[zone] = intensityColor(current);
  }

  const handleSave = (record: SymptomRecord) => {
    saveMutation.mutate(record, {
      onSuccess: () => {
        setSelectedZone(null);
        setToast({ title: 'Sintoma registrado', body: `${regionLabel(record.zoneId, record.side)} — a Ani já avisou sua equipe.` });
      },
      onError: err => {
        notify('Erro', 'Não foi possível salvar o sintoma. Tente novamente.');
        console.error(err);
      },
    });
  };

  const recentRecords = [...records].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[BRAND.PRIMARY.DEFAULT]} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.push('/(tabs)'))} style={{ paddingVertical: 4 }}>
            <MaterialIcons name="chevron-left" size={22} color={W.TEXT_MUTED} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Body Map</Text>
            <Text style={styles.subtitle}>Toque na região para registrar um sintoma</Text>
          </View>
          <View style={styles.viewToggle}>
            {(['mapa', 'historico'] as const).map(mode => (
              <TouchableOpacity
                key={mode}
                onPress={() => setViewMode(mode)}
                style={[styles.viewToggleItem, viewMode === mode && styles.viewToggleItemActive]}
              >
                <Text style={[styles.viewToggleText, viewMode === mode && { color: BRAND.SURFACE.CARD }]}>
                  {mode === 'mapa' ? 'Mapa' : 'Histórico'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {viewMode === 'mapa' && (
          <View style={{ paddingHorizontal: 20, gap: 16 }}>
            <View style={styles.rowBetween}>
              <SegmentedPill
                options={[{ id: 'homem', label: 'Homem' }, { id: 'mulher', label: 'Mulher' }]}
                value={gender}
                onChange={setGender}
              />
              <SegmentedPill
                options={[{ id: 'front', label: 'Frente' }, { id: 'back', label: 'Costas' }]}
                value={side}
                onChange={setSide}
              />
            </View>

            <View style={styles.legend}>
              {LEGEND.map(l => (
                <View key={l.label} style={styles.legendItem}>
                  <View style={[styles.legendBar, { backgroundColor: l.color }]} />
                  <Text style={styles.legendText} numberOfLines={1}>{l.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.mapCard}>
              <BodyFigure width={240} height={380} fills={fills} onRegionPress={setSelectedZone} />
              {isLoading && <ActivityIndicator style={StyleSheet.absoluteFill} color={BRAND.SECONDARY.DEFAULT} />}
            </View>

            <TouchableOpacity style={styles.ctcaeLink} activeOpacity={0.85} onPress={() => router.push('/symptom/ctcae')}>
              <View style={styles.ctcaeIcon}>
                <MaterialIcons name="fact-check" size={18} color={BRAND.PRIMARY.DEFAULT} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyTitle}>Prefere responder por sintoma?</Text>
                <Text style={styles.historyMeta}>Use a escala CTCAE: náusea, fadiga, diarreia, mucosite...</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={W.TAUPE} />
            </TouchableOpacity>
          </View>
        )}

        {viewMode === 'historico' && (
          <View style={{ paddingHorizontal: 20, gap: 10 }}>
            {recentRecords.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum sintoma registrado ainda.</Text>
            ) : (
              recentRecords.map(r => {
                const sType = SYMPTOM_TYPES.find(s => s.id === r.type);
                const color = intensityColor(r.intensity);
                const time = new Date(r.timestamp).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
                return (
                  <TouchableOpacity
                    key={r.id ?? r.timestamp}
                    activeOpacity={0.8}
                    onPress={() => r.id && router.push(`/body-map-details/${r.id}`)}
                    style={styles.historyRow}
                  >
                    <View style={[styles.historyDot, { backgroundColor: color + '33', borderColor: color }]}>
                      <Text style={styles.historyDotText}>{r.intensity === 5 ? '4+' : r.intensity}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyTitle}>{regionLabel(r.zoneId, r.side)}</Text>
                      <Text style={styles.historyMeta} numberOfLines={2}>
                        {sType?.label ?? r.type}
                        {r.note ? ` — ${r.note}` : ''}
                      </Text>
                      <Text style={styles.historyTime}>
                        {time}
                        {r.source && SOURCE_LABEL[r.source] ? ` • ${SOURCE_LABEL[r.source]}` : ''}
                      </Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={18} color={W.TAUPE} />
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}
      </ScrollView>

      {toast && (
        <View style={[styles.toast, { top: insets.top + 12 }]} pointerEvents="none">
          <MaterialIcons name="check-circle" size={20} color={BRAND.SURFACE.CARD} />
          <View style={{ flex: 1 }}>
            <Text style={styles.toastTitle}>{toast.title}</Text>
            <Text style={styles.toastBody}>{toast.body}</Text>
          </View>
        </View>
      )}

      <SymptomModal
        zoneId={selectedZone}
        side={side}
        saving={saveMutation.isPending}
        onClose={() => setSelectedZone(null)}
        onSave={handleSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: W.BG_SOFT,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 20,
    lineHeight: 30,
    color: BRAND.PRIMARY.DEFAULT,
  },
  subtitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    lineHeight: 16.5,
    color: W.GREY,
    maxWidth: 170,
  },
  viewToggle: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: BRAND.SURFACE.CARD,
    shadowColor: BRAND.PRIMARY.DEFAULT,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 3,
  },
  viewToggleItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewToggleItemActive: {
    backgroundColor: BRAND.PRIMARY.DEFAULT,
  },
  viewToggleText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 11,
    lineHeight: 16.5,
    color: W.GREY,
  },

  /* Segmented pills */
  segment: {
    width: '48.2%',
    flexDirection: 'row',
    padding: 4,
    borderRadius: 999,
    backgroundColor: BRAND.SURFACE.CARD,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 1,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 999,
    alignItems: 'center',
  },
  segmentItemActive: {
    backgroundColor: W.CHIP,
  },
  segmentText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    lineHeight: 16.5,
    color: W.GREY,
  },
  segmentTextActive: {
    color: BRAND.PRIMARY.DEFAULT,
  },

  /* Legend */
  legend: {
    flexDirection: 'row',
    gap: 4,
  },
  legendItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  legendBar: {
    width: '100%',
    height: 8,
    borderRadius: 999,
  },
  legendText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 9,
    lineHeight: 13.5,
    color: W.TEXT_MUTED,
  },

  /* Map */
  mapCard: {
    height: 420,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND.SURFACE.CARD,
    shadowColor: BRAND.PRIMARY.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },

  ctcaeLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: W.BORDER,
    backgroundColor: BRAND.SURFACE.CARD,
  },
  ctcaeIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: W.BG,
  },

  /* History */
  emptyText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: W.TEXT_MUTED,
    textAlign: 'center',
    marginTop: 40,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: BRAND.SURFACE.CARD,
    shadowColor: BRAND.PRIMARY.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1,
  },
  historyDot: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyDotText: {
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
  historyMeta: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    lineHeight: 16.5,
    color: W.TEXT_MUTED,
  },
  historyTime: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 10,
    lineHeight: 15,
    color: W.TAUPE,
    marginTop: 2,
  },

  /* Toast */
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: BRAND.PRIMARY.DEFAULT,
    shadowColor: BRAND.PRIMARY.DEFAULT,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  toastTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: BRAND.SURFACE.CARD,
  },
  toastBody: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: W.PEACH,
  },

  /* Modal */
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
    elevation: 10,
  },
  modalTitle: {
    flex: 1,
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 18,
    color: BRAND.PRIMARY.DEFAULT,
  },
  modalClose: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: W.BG,
  },
  modalLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: W.TEXT_MUTED,
    marginBottom: 10,
  },
  gradeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 20,
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
  typeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  typeChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: W.BORDER,
    backgroundColor: W.BG,
  },
  typeChipActive: {
    borderColor: BRAND.PRIMARY.DEFAULT,
    backgroundColor: BRAND.PRIMARY.DEFAULT,
  },
  typeChipText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: W.TEXT_MUTED,
  },
  noteInput: {
    minHeight: 72,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: W.BORDER,
    backgroundColor: W.BG,
    color: BRAND.PRIMARY.DEFAULT,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  photoRow: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: W.BG,
  },
  photoBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: W.TEXT_MUTED,
  },
  photoRemove: {
    position: 'absolute',
    top: -6,
    right: -6,
    padding: 3,
    borderRadius: 10,
    backgroundColor: BRAND.SURFACE.CARD,
    elevation: 2,
  },
});
