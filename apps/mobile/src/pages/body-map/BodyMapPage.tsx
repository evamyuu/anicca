/**
 * @fileoverview Body Map interativo com silhueta SVG clicável.
 * Permite registrar sintomas por região corporal (frente e costas),
 * com escala de intensidade 0-10, tipo de sintoma e nota livre.
 * Agora com suporte a anexo de imagens (Visão Computacional).
 *
 * @module pages/body-map/BodyMapPage
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  Modal, Pressable, TextInput, Alert, ActivityIndicator, Image, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, G, Rect } from 'react-native-svg';
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { useAuthStore } from '@/shared/lib/zustand-persist';
import { getBodyMapHistory, createBodyMapEntry } from '@/shared/api/body-map';
import { BRAND } from '@/shared/constants/brand-colors.const';

import BodyMapWoman from '../../../assets/images/bodymap/bodymap-woman.svg';


type BodySide = 'front' | 'back';
type SymptomType = 'dor' | 'dormencia' | 'inchaco' | 'vermelhidao' | 'ferida' | 'formigamento' | 'outro';

interface ZoneHitArea {
  id: string;
  label: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

interface SymptomRecord {
  zoneId: string;
  zoneLabel: string;
  intensity: number;
  type: SymptomType;
  note: string;
  side: BodySide;
  timestamp: string;
  imageUri?: string;
}


const SYMPTOM_TYPES: { id: SymptomType; label: string; emoji: string }[] = [
  { id: 'dor',         label: 'Dor',         emoji: '⚡' },
  { id: 'dormencia',   label: 'Dormência',   emoji: '😶' },
  { id: 'inchaco',     label: 'Inchaço',     emoji: '🫧' },
  { id: 'vermelhidao', label: 'Vermelhidão', emoji: '🔴' },
  { id: 'ferida',      label: 'Ferida',      emoji: '🩹' },
  { id: 'formigamento',label: 'Formigamento',emoji: '🐜' },
  { id: 'outro',       label: 'Outro',       emoji: '❓' },
];

function intensityColor(v: number): string {
  if (v === 0) return '#255C99'; // Blue (Sem dor)
  if (v === 1) return '#98B378'; // Green (Grau 1)
  if (v === 2) return '#FCD34D'; // Yellow (Grau 2)
  if (v === 3) return '#FB923C'; // Orange (Grau 3)
  if (v === 4) return '#F97316'; // Dark Orange (Grau 4)
  return '#EF4444'; // Red (Grau 4+)
}

const FRONT_ZONES: ZoneHitArea[] = [
  { id: 'head',          label: 'Cabeça',           cx: 60,  cy: 14,  rx: 14,  ry: 14  },
  { id: 'neck',          label: 'Pescoço',           cx: 60,  cy: 32,  rx: 8,   ry: 6   },
  { id: 'chest_left',    label: 'Peito esquerdo',    cx: 46,  cy: 52,  rx: 12,  ry: 12  },
  { id: 'chest_right',   label: 'Peito direito',     cx: 74,  cy: 52,  rx: 12,  ry: 12  },
  { id: 'abdomen',       label: 'Abdômen',           cx: 60,  cy: 80,  rx: 18,  ry: 14  },
  { id: 'pelvis',        label: 'Pelve / Quadril',   cx: 60,  cy: 105, rx: 20,  ry: 12  },
  { id: 'arm_left',      label: 'Braço esquerdo',    cx: 34,  cy: 72,  rx: 8,   ry: 20  },
  { id: 'arm_right',     label: 'Braço direito',     cx: 86,  cy: 72,  rx: 8,   ry: 20  },
  { id: 'leg_left',      label: 'Perna esquerda',    cx: 47,  cy: 155, rx: 12,  ry: 32  },
  { id: 'leg_right',     label: 'Perna direita',     cx: 73,  cy: 155, rx: 12,  ry: 32  },
  { id: 'foot_left',     label: 'Pé esquerdo',       cx: 45,  cy: 200, rx: 10,  ry: 8   },
  { id: 'foot_right',    label: 'Pé direito',        cx: 75,  cy: 200, rx: 10,  ry: 8   },
];

const BACK_ZONES: ZoneHitArea[] = [
  { id: 'back_head',     label: 'Nuca / Cabeça',     cx: 60,  cy: 14,  rx: 14,  ry: 14  },
  { id: 'shoulders',     label: 'Ombros',            cx: 60,  cy: 38,  rx: 26,  ry: 10  },
  { id: 'upper_back',    label: 'Costas superiores', cx: 60,  cy: 58,  rx: 18,  ry: 14  },
  { id: 'lower_back',    label: 'Lombar',            cx: 60,  cy: 82,  rx: 18,  ry: 14  },
  { id: 'gluteus',       label: 'Glúteos',           cx: 60,  cy: 106, rx: 20,  ry: 12  },
  { id: 'back_arm_left', label: 'Braço esq. (costas)', cx: 34, cy: 72, rx: 8,   ry: 20  },
  { id: 'back_arm_right',label: 'Braço dir. (costas)', cx: 86, cy: 72, rx: 8,   ry: 20  },
  { id: 'back_leg_left', label: 'Coxa/Perna esq.',   cx: 47,  cy: 155, rx: 12,  ry: 32  },
  { id: 'back_leg_right',label: 'Coxa/Perna dir.',   cx: 73,  cy: 155, rx: 12,  ry: 32  },
];

function BodySvg({
  side,
  records,
  onZonePress,
}: {
  side: BodySide;
  records: SymptomRecord[];
  onZonePress: (zone: ZoneHitArea) => void;
}) {
  const zones = side === 'front' ? FRONT_ZONES : BACK_ZONES;

  function getZoneColor(zoneId: string) {
    const rec = records.filter(r => r.zoneId === zoneId && r.side === side);
    if (rec.length === 0) return 'transparent';
    const maxIntensity = Math.max(...rec.map(r => r.intensity));
    return intensityColor(maxIntensity) + '88';
  }

  return (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={() => onZonePress({ id: 'panturrilhas', label: 'Panturrilhas', cx: 60, cy: 100, rx: 10, ry: 10 })}
      style={{ width: '100%', height: 380, alignItems: 'center', justifyContent: 'center' }}
    >
      <BodyMapWoman width="100%" height="100%" style={{ position: 'absolute' }} />
      <Svg width="100%" height="100%" viewBox="0 -10 120 235" pointerEvents="box-none">
        {zones.map((zone) => {
          const fillColor = getZoneColor(zone.id);
          const hasRecord = records.some(r => r.zoneId === zone.id && r.side === side);
          return (
            <G key={zone.id} onPress={() => onZonePress(zone)}>
              <Path
                d={`M ${zone.cx - zone.rx},${zone.cy} 
                    A ${zone.rx},${zone.ry} 0 1,1 ${zone.cx + zone.rx},${zone.cy}
                    A ${zone.rx},${zone.ry} 0 1,1 ${zone.cx - zone.rx},${zone.cy}`}
                fill={fillColor}
                stroke={hasRecord ? intensityColor(Math.max(...records.filter(r => r.zoneId === zone.id && r.side === side).map(r => r.intensity))) : BRAND.PRIMARY.DEFAULT + '66'}
                strokeWidth={hasRecord ? "1.5" : "0.5"}
                strokeDasharray={hasRecord ? undefined : "2,2"}
                opacity={hasRecord ? 0.9 : 0.4}
              />
              {hasRecord && (
                <Circle cx={zone.cx} cy={zone.cy} r={3} fill="#fff" opacity={0.9} />
              )}
            </G>
          );
        })}
      </Svg>
    </TouchableOpacity>
  );
}

function SymptomModal({
  zone,
  side,
  onClose,
  onSave,
}: {
  zone: ZoneHitArea | null;
  side: BodySide;
  onClose: () => void;
  onSave: (record: SymptomRecord) => void;
}) {
  const [intensity, setIntensity] = useState(0);
  const [symptomType, setSymptomType] = useState<SymptomType>('dor');
  const [note, setNote] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  if (!zone) return null;

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    onSave({
      zoneId: zone.id,
      zoneLabel: zone.label,
      intensity,
      type: symptomType,
      note,
      side,
      timestamp: new Date().toISOString(),
      imageUri: imageUri || undefined,
    });
    setIntensity(0);
    setSymptomType('dor');
    setNote('');
    setImageUri(null);
  };

  return (
    <Modal transparent animationType="fade" visible={!!zone} onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(74, 57, 49, 0.6)', justifyContent: 'center', paddingHorizontal: 20 }}
        onPress={onClose}
      >
        <Pressable style={{ backgroundColor: '#fff', borderRadius: 24, padding: 24, elevation: 10 }}>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ color: BRAND.PRIMARY.DEFAULT, fontFamily: 'Nunito_800ExtraBold', fontSize: 20 }}>
              {zone.label}
            </Text>
            <TouchableOpacity onPress={onClose} accessibilityRole="button">
              <X size={20} color="#8a7d75" />
            </TouchableOpacity>
          </View>

          {/* Intensity */}
          <Text style={{ color: '#8a7d75', fontFamily: 'Nunito_700Bold', fontSize: 13, marginBottom: 12 }}>
            Intensidade / Grau
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, gap: 8 }}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setIntensity(i)}
                style={{
                  flex: 1, height: 44, borderRadius: 12,
                  alignItems: 'center', justifyContent: 'center',
                  backgroundColor: intensity === i ? (i === 0 ? '#98B378' : '#e6a86c') : '#f8f6f4',
                }}
              >
                <Text style={{ 
                  color: intensity === i ? '#fff' : '#c9c2bc', 
                  fontSize: 16, 
                  fontFamily: 'Nunito_800ExtraBold' 
                }}>{i}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Type */}
          <Text style={{ color: '#8a7d75', fontFamily: 'Nunito_700Bold', fontSize: 13, marginBottom: 12 }}>
            Tipo
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
            {SYMPTOM_TYPES.map((s) => (
              <TouchableOpacity
                key={s.id}
                onPress={() => setSymptomType(s.id)}
                style={{
                  paddingVertical: 10, paddingHorizontal: 16, borderRadius: 14,
                  backgroundColor: symptomType === s.id ? BRAND.PRIMARY.DEFAULT : '#fbf9f6',
                }}
              >
                <Text style={{ 
                  color: symptomType === s.id ? '#fff' : '#8a7d75', 
                  fontFamily: 'Nunito_700Bold', 
                  fontSize: 13 
                }}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Note */}
          <View style={{ position: 'relative' }}>
            <TextInput
              placeholder="Observação (opcional)..."
              placeholderTextColor="#c9c2bc"
              value={note}
              onChangeText={setNote}
              multiline
              style={{
                backgroundColor: '#fbf9f6', borderRadius: 16, padding: 16,
                color: BRAND.PRIMARY.DEFAULT, fontFamily: 'Nunito_600SemiBold', fontSize: 14,
                minHeight: 80, textAlignVertical: 'top', marginBottom: 24,
              }}
            />
            
            {/* Photo Attachment (Absolute positioned inside the note area or below it) */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: -12, marginBottom: 24 }}>
              {imageUri ? (
                <View style={{ position: 'relative', width: 60, height: 60 }}>
                  <Image source={{ uri: imageUri }} style={{ width: 60, height: 60, borderRadius: 12 }} />
                  <TouchableOpacity
                    onPress={() => setImageUri(null)}
                    style={{ position: 'absolute', top: -6, right: -6, backgroundColor: '#fff', borderRadius: 12, padding: 2, elevation: 2 }}
                  >
                    <X size={14} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handlePickImage}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#f4f1ed', borderRadius: 12 }}
                >
                  <Camera size={16} color="#8a7d75" />
                  <Text style={{ color: '#8a7d75', fontFamily: 'Nunito_600SemiBold', fontSize: 12 }}>Anexar foto</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSave}
            style={{
              backgroundColor: BRAND.PRIMARY.DEFAULT, borderRadius: 16, paddingVertical: 18,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: '#fff', fontFamily: 'Nunito_800ExtraBold', fontSize: 16 }}>
              Registrar Sintoma
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function BodyMapPage() {
  const router = useRouter();
  const [side, setSide] = useState<BodySide>('front');
  const [gender, setGender] = useState<'homem' | 'mulher'>('mulher');
  const [viewMode, setViewMode] = useState<'mapa' | 'historico'>('mapa');
  const [selectedZone, setSelectedZone] = useState<ZoneHitArea | null>(null);
  
  const userId = useAuthStore(s => s.userId);
  const queryClient = useQueryClient();

  const [refreshing, setRefreshing] = useState(false);

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

  const saveMutation = useMutation({
    mutationFn: (record: SymptomRecord) => 
      createBodyMapEntry({
        patient_id: userId!,
        body_region: record.zoneId,
        body_view: record.side,
        intensity: record.intensity,
        symptom_types: [record.type],
        description: record.note + (record.imageUri ? ' [Imagem Anexada]' : ''),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['body-map', userId] });
    },
  });

  const records: SymptomRecord[] = history?.map(h => ({
    zoneId: h.body_region,
    zoneLabel: h.body_region,
    intensity: h.intensity,
    type: h.symptom_types[0] as SymptomType,
    note: h.description || '',
    side: h.body_view as BodySide,
    timestamp: h.registered_at,
  })) || [];

  const handleSave = (record: SymptomRecord) => {
    saveMutation.mutate(record, {
      onSuccess: () => {
        setSelectedZone(null);
        Alert.alert(
          'Registrado com sucesso!',
          `Sintoma em ${record.zoneLabel} guardado.`,
          [{ text: 'OK' }]
        );
      },
      onError: (err) => {
        Alert.alert('Erro', 'Não foi possível salvar o sintoma. Tente novamente.');
        console.error(err);
      }
    });
  };

  const recentRecords = [...records].reverse();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fbf9f6' }}>
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 40 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[BRAND.PRIMARY.DEFAULT]} />
        }
      >
        
        {/* Header matching Figma */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', flex: 1 }}>
            <TouchableOpacity onPress={() => router.push('/(tabs)/')} style={{ marginTop: 6, marginRight: 12 }}>
              <ChevronLeft size={20} color={BRAND.PRIMARY.DEFAULT} />
            </TouchableOpacity>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={{ color: BRAND.PRIMARY.DEFAULT, fontSize: 22, fontFamily: 'Nunito_800ExtraBold' }}>
                Body Map
              </Text>
              <Text style={{ color: '#a3988e', fontSize: 13, fontFamily: 'Nunito_600SemiBold', marginTop: 2, lineHeight: 18 }}>
                Toque na região para registrar{`
`}um sintoma
              </Text>
            </View>
          </View>
          
          {/* Mapa / Histórico Toggle */}
          <View style={{ flexDirection: 'row', backgroundColor: '#fff', borderRadius: 24, padding: 4, elevation: 1 }}>
            <TouchableOpacity 
              onPress={() => setViewMode('mapa')}
              style={{ paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: viewMode === 'mapa' ? BRAND.PRIMARY.DEFAULT : 'transparent' }}
            >
              <Text style={{ color: viewMode === 'mapa' ? '#fff' : '#a3988e', fontFamily: 'Nunito_700Bold', fontSize: 13 }}>Mapa</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setViewMode('historico')}
              style={{ paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: viewMode === 'historico' ? BRAND.PRIMARY.DEFAULT : 'transparent' }}
            >
              <Text style={{ color: viewMode === 'historico' ? '#fff' : '#a3988e', fontFamily: 'Nunito_700Bold', fontSize: 13 }}>Histórico</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Toggles: Homem/Mulher and Frente/Costas */}
        {viewMode === 'mapa' && (
          <>
            <View style={{ flexDirection: 'row', marginHorizontal: 20, marginBottom: 20, gap: 12 }}>
              {/* Gender Toggle */}
              <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#fff', borderRadius: 24, padding: 4, borderWidth: 1, borderColor: '#e4dcd3' }}>
                <TouchableOpacity 
                  onPress={() => setGender('homem')}
                  style={{ flex: 1, paddingVertical: 10, borderRadius: 20, alignItems: 'center', backgroundColor: gender === 'homem' ? '#efe9e4' : 'transparent' }}
                >
                  <Text style={{ color: gender === 'homem' ? BRAND.PRIMARY.DEFAULT : '#a3988e', fontFamily: 'Nunito_700Bold', fontSize: 13 }}>Homem</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setGender('mulher')}
                  style={{ flex: 1, paddingVertical: 10, borderRadius: 20, alignItems: 'center', backgroundColor: gender === 'mulher' ? '#efe9e4' : 'transparent' }}
                >
                  <Text style={{ color: gender === 'mulher' ? BRAND.PRIMARY.DEFAULT : '#a3988e', fontFamily: 'Nunito_700Bold', fontSize: 13 }}>Mulher</Text>
                </TouchableOpacity>
              </View>

              {/* Side Toggle */}
              <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#fff', borderRadius: 24, padding: 4, borderWidth: 1, borderColor: '#e4dcd3' }}>
                <TouchableOpacity 
                  onPress={() => setSide('front')}
                  style={{ flex: 1, paddingVertical: 10, borderRadius: 20, alignItems: 'center', backgroundColor: side === 'front' ? '#efe9e4' : 'transparent' }}
                >
                  <Text style={{ color: side === 'front' ? BRAND.PRIMARY.DEFAULT : '#a3988e', fontFamily: 'Nunito_700Bold', fontSize: 13 }}>Frente</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setSide('back')}
                  style={{ flex: 1, paddingVertical: 10, borderRadius: 20, alignItems: 'center', backgroundColor: side === 'back' ? '#efe9e4' : 'transparent' }}
                >
                  <Text style={{ color: side === 'back' ? BRAND.PRIMARY.DEFAULT : '#a3988e', fontFamily: 'Nunito_700Bold', fontSize: 13 }}>Costas</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Legend */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20, marginBottom: 20 }}>
              {[
                { color: '#255C99', label: 'Sem dor' },
                { color: '#98B378', label: 'Grau 1' },
                { color: '#FCD34D', label: 'Grau 2' },
                { color: '#FB923C', label: 'Grau 3' },
                { color: '#F97316', label: 'Grau 4' },
                { color: '#EF4444', label: 'Grau 4+' },
              ].map((l) => (
                <View key={l.label} style={{ alignItems: 'center', flex: 1, paddingHorizontal: 2 }}>
                  <View style={{ width: '100%', height: 6, borderRadius: 3, backgroundColor: l.color, marginBottom: 6 }} />
                  <Text style={{ color: '#8a7d75', fontFamily: 'Nunito_700Bold', fontSize: 9, textAlign: 'center' }} numberOfLines={1}>{l.label}</Text>
                </View>
              ))}
            </View>

            {/* Map */}
            <View
              style={{
                marginHorizontal: 20,
                backgroundColor: '#fff', borderRadius: 24,
                padding: 16, alignItems: 'center',
                shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3
              }}
            >
              <BodySvg side={side} records={records} onZonePress={setSelectedZone} />
              {isLoading && <ActivityIndicator style={{ marginTop: 16, position: 'absolute', top: '50%' }} color={BRAND.SECONDARY.DEFAULT} />}
            </View>
          </>
        )}

        {/* History Mode */}
        {viewMode === 'historico' && (
          <View style={{ marginHorizontal: 20, marginTop: 10 }}>
            {recentRecords.length === 0 ? (
              <Text style={{ color: '#a3988e', fontFamily: 'Nunito_600SemiBold', textAlign: 'center', marginTop: 40 }}>Nenhum sintoma registrado ainda.</Text>
            ) : (
              recentRecords.map((r, i) => {
                const sType = SYMPTOM_TYPES.find(s => s.id === r.type);
                return (
                  <View
                    key={i}
                    style={{
                      backgroundColor: '#fff', borderRadius: 16, padding: 14,
                      flexDirection: 'row', alignItems: 'center', gap: 14,
                      marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1
                    }}
                  >
                    <View
                      style={{
                        width: 44, height: 44, borderRadius: 14, backgroundColor: intensityColor(r.intensity) + '1a',
                        alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: intensityColor(r.intensity) + '33'
                      }}
                    >
                      <Text style={{ fontSize: 20 }}>{sType?.emoji ?? '❓'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: BRAND.PRIMARY.DEFAULT, fontFamily: 'Nunito_800ExtraBold', fontSize: 15 }}>
                        {FRONT_ZONES.find(z => z.id === r.zoneId)?.label || BACK_ZONES.find(z => z.id === r.zoneId)?.label || r.zoneId}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <Text style={{ color: intensityColor(r.intensity), fontFamily: 'Nunito_700Bold', fontSize: 12 }}>
                          Intensidade {r.intensity}
                        </Text>
                        <Text style={{ color: '#d1c7bd', fontSize: 12 }}>•</Text>
                        <Text style={{ color: '#8a7d75', fontFamily: 'Nunito_600SemiBold', fontSize: 12 }} numberOfLines={1}>
                          {sType?.label} {r.note ? `- ${r.note}` : ''}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
      <SymptomModal
        zone={selectedZone}
        side={side}
        onClose={() => setSelectedZone(null)}
        onSave={handleSave}
      />
    </SafeAreaView>
  );
}