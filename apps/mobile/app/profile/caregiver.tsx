import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ScrollView, Modal, KeyboardAvoidingView, Platform, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, ShieldAlert, HeartHandshake, UserMinus, X, Plus } from 'lucide-react-native';
import { GradientButton } from '@/shared/ui/GradientButton';
import { httpClient } from '@/shared/api/http-client';
import { useAuthStore } from '@/shared/lib/zustand-persist';
import { BRAND } from '@/shared/constants/brand-colors.const';

export default function CaregiverProfileScreen() {
  const router = useRouter();
  const { userId } = useAuthStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [caregivers, setCaregivers] = useState<{ id: string; name: string; email: string }[]>([]);

  // Fetch caregivers on mount
  React.useEffect(() => {
    const fetchCaregivers = async () => {
      try {
        const response = await httpClient.get(`/auth/caregivers/${userId}`);
        setCaregivers(response.data);
      } catch (error) {
        console.error("Failed to fetch caregivers", error);
      }
    };
    if (userId) {
      fetchCaregivers();
    }
  }, [userId]);

  const handleUnlink = (id: string) => {
    Alert.alert(
      "Desvincular Cuidador",
      "Tem certeza que deseja remover o acesso deste cuidador aos seus dados de saúde?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sim, Desvincular", 
          style: "destructive",
          onPress: async () => {
            try {
              await httpClient.post(`/auth/unlink-caregiver?patient_id=${userId}&caregiver_id=${id}`);
              setCaregivers(prev => prev.filter(c => c.id !== id));
              Alert.alert("Sucesso", "Cuidador desvinculado.");
            } catch (error) {
              Alert.alert("Erro", "Não foi possível desvincular o cuidador.");
            }
          }
        }
      ]
    );
  };

  const handleLink = async () => {
    if (!inputValue.trim()) return;
    setLoading(true);
    setFeedback(null);
    try {
      await httpClient.post(`/auth/link-caregiver?patient_id=${userId}&email=${inputValue.trim()}`);
      
      // Recarregar a lista real
      const response = await httpClient.get(`/auth/caregivers/${userId}`);
      setCaregivers(response.data);
      
      setModalVisible(false);
      setInputValue('');
      Alert.alert("Sucesso", "Cuidador vinculado com sucesso!");
    } catch (error) {
      setFeedback({ 
        text: `Não foi possível vincular. Verifique o e-mail e tente novamente.`, 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={BRAND.SURFACE.CARD} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} selectable={false}>Meus Cuidadores</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <ShieldAlert size={20} color={BRAND.PRIMARY[400]} />
            <Text style={styles.infoText}>Os cuidadores abaixo têm acesso para registrar sintomas e visualizar sua jornada no Anicca.</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, marginTop: 20 }}>
          {caregivers.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum cuidador vinculado.</Text>
          ) : (
            caregivers.map(caregiver => (
              <View key={caregiver.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.avatarCircle}>
                    <HeartHandshake size={24} color={BRAND.SECONDARY.DEFAULT} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.name}>{caregiver.name}</Text>
                    <Text style={styles.email}>{caregiver.email}</Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>Acesso Ativo</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => handleUnlink(caregiver.id)} style={styles.deleteBtn}>
                    <UserMinus size={20} color={BRAND.ERROR.DEFAULT} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        <GradientButton
          title="+ Adicionar Cuidador"
          onPress={() => {
            setInputValue('');
            setFeedback(null);
            setModalVisible(true);
          }}
          colors={[BRAND.SECONDARY.DEFAULT, BRAND.SECONDARY[600]]}
          style={{ marginTop: 20, marginBottom: 10 }}
        />
      </View>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={styles.modalTitle}>Vincular Cuidador</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X size={24} color={BRAND.PRIMARY[400]} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSub}>
                Digite o e-mail cadastrado do seu cuidador.
              </Text>

              {feedback && (
                <View style={[styles.feedbackBox, feedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError]}>
                  <Text style={[styles.feedbackText, feedback.type === 'success' ? styles.feedbackTextSuccess : styles.feedbackTextError]}>
                    {feedback.text}
                  </Text>
                </View>
              )}

              <TextInput
                style={[styles.input, feedback?.type === 'error' && styles.inputError]}
                placeholder="Ex: joao@gmail.com"
                placeholderTextColor={BRAND.PRIMARY[400]}
                value={inputValue}
                onChangeText={(val) => {
                  setInputValue(val);
                  if (feedback?.type === 'error') setFeedback(null);
                }}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              
              <View style={styles.modalActions}>
                {loading ? (
                  <View style={styles.loadingWrapper}>
                    <ActivityIndicator color={BRAND.SECONDARY.DEFAULT} size="large" />
                  </View>
                ) : (
                  <GradientButton
                    title="Vincular Agora"
                    onPress={handleLink}
                    disabled={loading}
                    colors={[BRAND.SECONDARY.DEFAULT, BRAND.SECONDARY[600]]}
                  />
                )}
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BRAND.PRIMARY.DEFAULT,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_800ExtraBold',
    color: BRAND.SURFACE.CARD,
  },
  content: {
    flex: 1,
    backgroundColor: BRAND.BG.LIGHT,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    marginTop: 10,
  },
  infoCard: {
    backgroundColor: BRAND.SURFACE.CARD,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BRAND.SURFACE.BORDER,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    color: BRAND.PRIMARY.DEFAULT,
    lineHeight: 18,
  },
  emptyText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    color: BRAND.PRIMARY[400],
    textAlign: 'center',
    marginTop: 40,
  },
  card: {
    backgroundColor: BRAND.SURFACE.CARD,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BRAND.SURFACE.BORDER,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BRAND.SECONDARY[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
    color: BRAND.PRIMARY.DEFAULT,
  },
  email: {
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    color: BRAND.PRIMARY[400],
    marginBottom: 6,
  },
  badge: {
    backgroundColor: BRAND.BG.LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: BRAND.SURFACE.BORDER_DARK,
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
  },
  deleteBtn: {
    padding: 8,
    backgroundColor: BRAND.SECONDARY[100],
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: BRAND.SURFACE.CARD,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 20,
    color: BRAND.PRIMARY[900],
  },
  modalSub: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    color: BRAND.PRIMARY.DEFAULT,
    marginBottom: 20,
  },
  input: {
    backgroundColor: BRAND.BG.LIGHT,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    color: BRAND.PRIMARY.DEFAULT,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: BRAND.ERROR.DEFAULT,
  },
  feedbackBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  feedbackSuccess: {
    backgroundColor: BRAND.BG.LIGHT,
    borderWidth: 1,
    borderColor: BRAND.PRIMARY[300],
  },
  feedbackError: {
    backgroundColor: BRAND.SECONDARY[100],
    borderWidth: 1,
    borderColor: BRAND.SECONDARY[300],
  },
  feedbackText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    textAlign: 'center',
  },
  feedbackTextSuccess: {
    color: BRAND.SURFACE.BORDER_DARK,
  },
  feedbackTextError: {
    color: BRAND.ERROR.DARK,
  },
  modalActions: {
    marginTop: 10,
  },
  loadingWrapper: {
    height: 41,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
