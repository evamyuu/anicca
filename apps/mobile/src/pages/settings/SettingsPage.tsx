/**
 * @fileoverview Implementation of SettingsPage.
 *
 * @module pages/settings/SettingsPagex
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/shared/lib/zustand-persist';
import { linkCaregiver, linkDoctor } from '@/shared/api/care-team';
import { notify } from '@/shared/lib/notify';
import { BRAND } from '@/shared/constants/brand-colors.const';

export function SettingsPage() {
  const { userId } = useAuthStore();
  const [crm, setCrm] = useState('');
  const [caregiverEmail, setCaregiverEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCaregiver, setLoadingCaregiver] = useState(false);

  const handleLinkDoctor = async () => {
    if (!crm.trim()) return;
    setLoading(true);
    try {
      await linkDoctor(userId!, crm.trim());
      notify('Sucesso', 'Médico vinculado com sucesso!');
      setCrm('');
    } catch (error) {
      notify('Erro', 'Médico não encontrado. Certifique-se de que o CRM está correto e que o médico tem cadastro na plataforma.');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkCaregiver = async () => {
    if (!caregiverEmail.trim()) return;
    setLoadingCaregiver(true);
    try {
      await linkCaregiver(userId!, caregiverEmail.trim());
      notify('Sucesso', 'Cuidador vinculado com sucesso! Ele já tem acesso aos seus dados.');
      setCaregiverEmail('');
    } catch (error) {
      notify('Erro', 'Cuidador não encontrado com este E-mail. Certifique-se de que ele já possui cadastro no Anicca.');
    } finally {
      setLoadingCaregiver(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: BRAND.BG.DARK }}>
      <View className="flex-1 px-6 pt-6">
        <Text className="text-white text-2xl font-extrabold mb-6" style={{ fontFamily: 'Nunito_800ExtraBold' }}>Configurações</Text>
        
        {/* Vincular Médico Section */}
        <View className="py-4 mb-4" style={{ borderBottomWidth: 1, borderBottomColor: BRAND.SURFACE.BORDER_DARK }}>
          <Text className="text-white text-lg mb-2" style={{ fontFamily: 'Nunito_700Bold' }}>Equipe Médica</Text>
          <Text className="text-[#a3988e] text-sm mb-3" style={{ fontFamily: 'Nunito_400Regular' }}>Digite o CRM do seu médico para vincular seus dados e compartilhar sua jornada.</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TextInput
              style={{ flex: 1, backgroundColor: BRAND.SURFACE.BORDER_DARK, color: BRAND.SURFACE.CARD, borderRadius: 8, paddingHorizontal: 12, height: 44, fontFamily: 'Nunito_400Regular' }}
              placeholder="Ex: CRM-PE 45892"
              placeholderTextColor={BRAND.PRIMARY[400]}
              value={crm}
              onChangeText={setCrm}
            />
            <TouchableOpacity 
              onPress={handleLinkDoctor}
              disabled={loading}
              style={{ backgroundColor: BRAND.SECONDARY.DEFAULT, borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' }}
            >
              {loading ? <ActivityIndicator color={BRAND.SURFACE.CARD} size="small" /> : <Text style={{ color: BRAND.SURFACE.CARD, fontFamily: 'Nunito_700Bold' }}>Vincular</Text>}
            </TouchableOpacity>
          </View>
        </View>

        {/* Vincular Cuidador Section */}
        <View className="py-4 mb-4" style={{ borderBottomWidth: 1, borderBottomColor: BRAND.SURFACE.BORDER_DARK }}>
          <Text className="text-white text-lg mb-2" style={{ fontFamily: 'Nunito_700Bold' }}>Meu Cuidador</Text>
          <Text className="text-[#a3988e] text-sm mb-3" style={{ fontFamily: 'Nunito_400Regular' }}>Digite o E-mail do seu cuidador para compartilhar sua rotina e sintomas.</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TextInput
              style={{ flex: 1, backgroundColor: BRAND.SURFACE.BORDER_DARK, color: BRAND.SURFACE.CARD, borderRadius: 8, paddingHorizontal: 12, height: 44, fontFamily: 'Nunito_400Regular' }}
              placeholder="Ex: joao@gmail.com"
              placeholderTextColor={BRAND.PRIMARY[400]}
              autoCapitalize="none"
              keyboardType="email-address"
              value={caregiverEmail}
              onChangeText={setCaregiverEmail}
            />
            <TouchableOpacity 
              onPress={handleLinkCaregiver}
              disabled={loadingCaregiver}
              style={{ backgroundColor: BRAND.SECONDARY.DEFAULT, borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' }}
            >
              {loadingCaregiver ? <ActivityIndicator color={BRAND.SURFACE.CARD} size="small" /> : <Text style={{ color: BRAND.SURFACE.CARD, fontFamily: 'Nunito_700Bold' }}>Vincular</Text>}
            </TouchableOpacity>
          </View>
        </View>

        {['Personalidade da Ani', 'Personalizar Avatar', 'Notificações', 'Privacidade e Consentimentos', 'Sobre a Anicca', 'Sair'].map((item) => (
          <View key={item} className="py-4" style={{ borderBottomWidth: 1, borderBottomColor: BRAND.SURFACE.BORDER_DARK }}>
            <Text className="text-white text-base" style={{ fontFamily: 'Nunito_400Regular' }}>{item}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}