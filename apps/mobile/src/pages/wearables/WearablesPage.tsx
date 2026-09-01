/**
 * @fileoverview Implementation of WearablesPage.
 *
 * @module pages/wearables/WearablesPagex
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Watch, Heart, Moon, Activity, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/shared/providers/ThemeProvider';
import { ThemeColors } from '@/shared/theme/colors';
import { BRAND } from '@/shared/constants/brand-colors.const';

export function WearablesPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
    }, 2500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dispositivos</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Banner Section */}
        <View style={styles.bannerContainer}>
          <View style={styles.iconCircle}>
            <Watch size={32} color={BRAND.SECONDARY.DEFAULT} />
          </View>
          <Text style={styles.bannerTitle}>Conecte seu Smartwatch</Text>
          <Text style={styles.bannerDesc}>
            O Anicca utiliza o Google Health Connect e Apple HealthKit para monitorar seus batimentos e sono automaticamente, auxiliando o médico a prevenir fadiga e infecções.
          </Text>
        </View>

        {/* Connection Status / Action */}
        {!isConnected ? (
          <View style={styles.connectCard}>
            <Text style={styles.connectTitle}>Sincronização de Saúde</Text>
            <Text style={styles.connectSubtitle}>Nenhum dispositivo conectado no momento.</Text>
            
            <TouchableOpacity 
              style={[styles.connectBtn, isConnecting && styles.connectBtnLoading]} 
              onPress={handleConnect}
              disabled={isConnecting}
              activeOpacity={0.8}
            >
              {isConnecting ? (
                <>
                  <ActivityIndicator color={BRAND.SURFACE.CARD} size="small" style={{ marginRight: 8 }} />
                  <Text style={styles.connectBtnText}>Sincronizando com Health Hub...</Text>
                </>
              ) : (
                <Text style={styles.connectBtnText}>Conectar via Health Connect</Text>
              )}
            </TouchableOpacity>

            <View style={styles.privacyNote}>
              <AlertCircle size={14} color={BRAND.PRIMARY[400]} />
              <Text style={styles.privacyText}>Acesso seguro de ponta a ponta. Você controla seus dados.</Text>
            </View>
          </View>
        ) : (
          <View style={styles.connectedState}>
            <View style={styles.statusBadge}>
              <CheckCircle2 size={16} color={BRAND.SEMANTIC.SUCCESS} />
              <Text style={styles.statusBadgeText}>Conectado e Sincronizando</Text>
            </View>
            <Text style={styles.connectedDevice}>Apple Watch Series 9</Text>
            <Text style={styles.lastSync}>Última sincronização: Agora mesmo</Text>

            <View style={styles.metricsGrid}>
              
              <View style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <View style={[styles.metricIconBg, { backgroundColor: BRAND.ERROR.LIGHT }]}>
                    <Heart size={20} color={BRAND.ERROR.DEFAULT} />
                  </View>
                  <Text style={styles.metricLabel}>Batimentos</Text>
                </View>
                <Text style={styles.metricValue}>78<Text style={styles.metricUnit}> bpm</Text></Text>
                <Text style={styles.metricTrend}>Normal (Repouso)</Text>
              </View>

              <View style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <View style={[styles.metricIconBg, { backgroundColor: BRAND.PRIMARY[50] }]}>
                    <Moon size={20} color={BRAND.AUX.BLUE} />
                  </View>
                  <Text style={styles.metricLabel}>Sono (Noite)</Text>
                </View>
                <Text style={styles.metricValue}>7h 12m</Text>
                <Text style={[styles.metricTrend, { color: BRAND.SECONDARY.DEFAULT }]}>2 interrupções</Text>
              </View>

              <View style={[styles.metricCard, { width: '100%' }]}>
                <View style={styles.metricHeader}>
                  <View style={[styles.metricIconBg, { backgroundColor: BRAND.PRIMARY[50] }]}>
                    <Activity size={20} color={BRAND.SEMANTIC.SUCCESS} />
                  </View>
                  <Text style={styles.metricLabel}>Atividade (Passos)</Text>
                </View>
                <Text style={styles.metricValue}>4.230<Text style={styles.metricUnit}> passos hoje</Text></Text>
                <Text style={styles.metricTrend}>Fadiga moderada detectada</Text>
              </View>

            </View>

            <TouchableOpacity 
              style={styles.disconnectBtn}
              onPress={() => setIsConnected(false)}
            >
              <Text style={styles.disconnectBtnText}>Desconectar Dispositivo</Text>
            </TouchableOpacity>

          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  content: { padding: 24, paddingBottom: 60 },
  bannerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(242, 139, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  bannerDesc: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  connectCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    shadowColor: BRAND.PRIMARY[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    alignItems: 'center',
  },
  connectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  connectSubtitle: {
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: 24,
    textAlign: 'center',
  },
  connectBtn: {
    backgroundColor: BRAND.PRIMARY.DEFAULT,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  connectBtnLoading: {
    backgroundColor: BRAND.PRIMARY[400],
  },
  connectBtnText: {
    color: BRAND.SURFACE.CARD,
    fontSize: 16,
    fontWeight: 'bold',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  privacyText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  connectedState: {
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND.PRIMARY[50],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 12,
  },
  statusBadgeText: {
    color: BRAND.SEMANTIC.SUCCESS,
    fontWeight: 'bold',
    fontSize: 16,
  },
  connectedDevice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  lastSync: {
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: 24,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    gap: 16,
  },
  metricCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    width: '47%',
    shadowColor: BRAND.PRIMARY[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  metricIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textMuted,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  metricUnit: {
    fontSize: 16,
    fontWeight: 'normal',
    color: colors.textMuted,
  },
  metricTrend: {
    fontSize: 16,
    color: BRAND.SEMANTIC.SUCCESS,
    fontWeight: 'bold',
  },
  disconnectBtn: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disconnectBtnText: {
    color: colors.danger,
    fontWeight: 'bold',
    fontSize: 16,
  }
});