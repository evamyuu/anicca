/**
 * @fileoverview Implementation of settings.
 *
 * @module app/profile/settingsx
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, LogOut, Lock, Moon, Shield, Watch } from 'lucide-react-native';
import { useAuthStore } from '@/shared/lib/zustand-persist';
import { useTheme } from '@/shared/providers/ThemeProvider';
import { ThemeColors } from '@/shared/theme/colors';

export default function SettingsScreen() {
  const router = useRouter();
  const { isDark, toggleTheme, colors } = useTheme();
  
  const styles = createStyles(colors);

  const handleLogout = () => {
    useAuthStore.getState().signOut();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferências</Text>
          <View style={styles.cardGroup}>
            <View style={styles.cardRowToggle}>
              <View style={styles.rowLeft}>
                <View style={styles.iconBox}><Moon size={20} color={colors.textMuted} /></View>
                <Text style={styles.rowLabelDark}>Modo Escuro (Dark Mode)</Text>
              </View>
              <Switch 
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#ffffff"
              />
            </View>
            <View style={styles.divider} />
            <TouchableOpacity 
              style={styles.cardRowAction} 
              activeOpacity={0.7}
              onPress={() => router.push('/profile/wearables')}
            >
              <View style={styles.rowLeft}>
                <View style={styles.iconBox}><Watch size={20} color={colors.textMuted} /></View>
                <Text style={styles.rowLabelDark}>Dispositivos (Wearables)</Text>
              </View>
              <Text style={styles.actionChevron}>{'>'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Segurança e Privacidade</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity style={styles.cardRowAction} activeOpacity={0.7}>
              <View style={styles.rowLeft}>
                <View style={styles.iconBox}><Lock size={20} color={colors.textMuted} /></View>
                <Text style={styles.rowLabelDark}>Trocar Senha</Text>
              </View>
              <Text style={styles.actionChevron}>{'>'}</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.cardRowAction} activeOpacity={0.7}>
              <View style={styles.rowLeft}>
                <View style={styles.iconBox}><Shield size={20} color={colors.textMuted} /></View>
                <Text style={styles.rowLabelDark}>Privacidade de Dados (LGPD)</Text>
              </View>
              <Text style={styles.actionChevron}>{'>'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity style={styles.cardRowAction} activeOpacity={0.7} onPress={handleLogout}>
              <View style={styles.rowLeft}>
                <View style={styles.iconBoxDanger}><LogOut size={20} color={colors.danger} /></View>
                <Text style={styles.rowLabelDanger}>Sair da conta (Logout)</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textMuted,
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardGroup: {
    backgroundColor: colors.card,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardRowToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  cardRowAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconBoxDanger: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.dangerBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowLabelDark: {
    fontSize: 16,
    color: colors.text,
    fontWeight: 'bold',
  },
  rowLabelDanger: {
    fontSize: 16,
    color: colors.danger,
    fontWeight: 'bold',
  },
  actionChevron: {
    fontSize: 20,
    color: colors.textMuted,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 20,
  }
});