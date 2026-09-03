import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Trash2, Edit3, Check } from 'lucide-react-native';

import { useAuthStore } from '@/shared/lib/zustand-persist';
import { getBodyMapHistory, updateBodyMapEntry, deleteBodyMapEntry } from '@/shared/api/body-map';
import { BRAND } from '@/shared/constants/brand-colors.const';
import { GradientButton } from '@/shared/ui/GradientButton';

const intensityColor = (i: number) => {
  if (i === 0) return BRAND.SEMANTIC.INFO;
  if (i <= 3) return BRAND.SEMANTIC.SUCCESS;
  if (i <= 6) return BRAND.SECONDARY[400];
  if (i <= 8) return BRAND.SECONDARY[600];
  return BRAND.ERROR.DEFAULT;
};

export function BodyMapDetailsPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = useAuthStore(s => s.userId);
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [intensity, setIntensity] = useState<number>(0);
  const [note, setNote] = useState<string>('');

  const { data: history, isLoading } = useQuery({
    queryKey: ['body-map', userId],
    queryFn: () => getBodyMapHistory(userId!),
    enabled: !!userId,
  });

  const entry = history?.find(h => h.id === id);

  useEffect(() => {
    if (entry) {
      setIntensity(entry.intensity);
      setNote(entry.description || '');
    }
  }, [entry]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!id) return;
      return updateBodyMapEntry(id, {
        intensity,
        description: note,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['body-map', userId] });
      setIsEditing(false);
      Alert.alert('Sucesso', 'Registro atualizado.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!id) return;
      return deleteBodyMapEntry(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['body-map', userId] });
      Alert.alert('Excluído', 'Sintoma removido.');
      router.back();
    },
  });

  const handleDelete = () => {
    Alert.alert('Excluir Sintoma', 'Tem certeza que deseja apagar este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteMutation.mutate() },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BRAND.BG.LIGHT, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={BRAND.SECONDARY.DEFAULT} size="large" />
      </SafeAreaView>
    );
  }

  if (!entry) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BRAND.BG.LIGHT, padding: 20 }}>
        <Text style={{ fontFamily: 'Nunito_600SemiBold', color: BRAND.PRIMARY[400] }}>Registro não encontrado.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: BRAND.SECONDARY.DEFAULT }}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BRAND.BG.LIGHT }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: BRAND.SURFACE.CARD, alignItems: 'center', justifyContent: 'center' }}>
          <ChevronLeft color={BRAND.PRIMARY.DEFAULT} size={24} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontFamily: 'Nunito_800ExtraBold', color: BRAND.PRIMARY.DEFAULT }}>Detalhes</Text>
        <TouchableOpacity onPress={handleDelete} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: BRAND.ERROR.DEFAULT + '1a', alignItems: 'center', justifyContent: 'center' }}>
          <Trash2 color={BRAND.ERROR.DEFAULT} size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        <View style={{ backgroundColor: BRAND.SURFACE.CARD, borderRadius: 24, padding: 24, shadowColor: BRAND.PRIMARY[900], shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 }}>
          
          {/* Metadata */}
          <Text style={{ fontSize: 14, fontFamily: 'Nunito_600SemiBold', color: BRAND.PRIMARY[400], marginBottom: 8 }}>
            {new Date(entry.registered_at).toLocaleString('pt-BR')}
          </Text>
          <Text style={{ fontSize: 24, fontFamily: 'Nunito_800ExtraBold', color: BRAND.PRIMARY.DEFAULT, marginBottom: 4 }}>
            {entry.body_region} ({entry.body_view === 'front' ? 'Frente' : 'Costas'})
          </Text>
          <Text style={{ fontSize: 16, fontFamily: 'Nunito_700Bold', color: BRAND.PRIMARY[300], marginBottom: 24, textTransform: 'capitalize' }}>
            {entry.symptom_types.join(', ')}
          </Text>

          {/* Intensity */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 16, fontFamily: 'Nunito_700Bold', color: BRAND.PRIMARY.DEFAULT }}>Intensidade</Text>
              {!isEditing && (
                <TouchableOpacity onPress={() => setIsEditing(true)}>
                  <Edit3 size={18} color={BRAND.SECONDARY.DEFAULT} />
                </TouchableOpacity>
              )}
            </View>
            
            {isEditing ? (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                {[0,1,2,3,4,5,6,7,8,9,10].map(i => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setIntensity(i)}
                    style={{
                      width: 28, height: 40, borderRadius: 14,
                      backgroundColor: intensity === i ? intensityColor(i) : BRAND.PRIMARY[50],
                      alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    <Text style={{ color: intensity === i ? '#fff' : BRAND.PRIMARY[300], fontFamily: 'Nunito_800ExtraBold', fontSize: 14 }}>{i}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: intensityColor(entry.intensity) }} />
                <Text style={{ fontSize: 18, fontFamily: 'Nunito_800ExtraBold', color: intensityColor(entry.intensity) }}>{entry.intensity} / 10</Text>
              </View>
            )}
          </View>

          {/* Note */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 16, fontFamily: 'Nunito_700Bold', color: BRAND.PRIMARY.DEFAULT, marginBottom: 12 }}>Observações</Text>
            {isEditing ? (
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Detalhes adicionais..."
                placeholderTextColor={BRAND.PRIMARY[200]}
                multiline
                style={{
                  backgroundColor: BRAND.PRIMARY[50], borderRadius: 16, padding: 16,
                  color: BRAND.PRIMARY.DEFAULT, fontFamily: 'Nunito_600SemiBold', fontSize: 16,
                  minHeight: 100, textAlignVertical: 'top'
                }}
              />
            ) : (
              <Text style={{ fontSize: 16, fontFamily: 'Nunito_600SemiBold', color: note ? BRAND.PRIMARY[400] : BRAND.PRIMARY[200] }}>
                {note || 'Nenhuma observação informada.'}
              </Text>
            )}
          </View>

          {/* Actions */}
          {isEditing && (
            <GradientButton
              title="Salvar Alterações"
              onPress={() => updateMutation.mutate()}
              isLoading={updateMutation.isPending}
              disabled={updateMutation.isPending}
              colors={[BRAND.SECONDARY[600], BRAND.SECONDARY[700]]}
            />
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
