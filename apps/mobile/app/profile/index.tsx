/**
 * @fileoverview User Profile Screen.
 * Configures basic patient data, Caregiver and Doctor connections, and Public/Private Network toggles (Rights).
 *
 * @module pages/profile/index
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, User, Camera, ShieldCheck, FileBadge, Stethoscope, HeartHandshake, Scale } from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const [isSUS, setIsSUS] = useState(true);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meu Perfil</Text>
          <View style={{width: 24}} />
        </View>

        {/* Top Dark Area (Avatar) */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <User size={40} color="#a3988e" />
            <TouchableOpacity style={styles.avatarEditBtn} activeOpacity={0.8}>
              <Camera size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>Rosa Silva</Text>
          <Text style={styles.userSub}>Paciente • Câncer de Mama</Text>
        </View>

        {/* Content Area (Light) */}
        <View style={styles.contentArea}>
          
          {/* Security Banner */}
          <View style={styles.securityBanner}>
            <ShieldCheck size={20} color="#a3e635" />
            <Text style={styles.securityText}>Seus dados estão protegidos por criptografia de ponta a ponta (LGPD).</Text>
          </View>

          {/* Section: Basic Data */}
          <Text style={styles.sectionTitle}>Dados Básicos</Text>
          <View style={styles.cardGroup}>
            <View style={styles.cardRow}>
              <Text style={styles.rowLabel}>CPF</Text>
              <Text style={styles.rowValue}>***.456.789-**</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.cardRow}>
              <Text style={styles.rowLabel}>Data de Nasc.</Text>
              <Text style={styles.rowValue}>12/04/1975</Text>
            </View>
          </View>

          {/* Section: Connections (Caregiver / Doctor) */}
          <Text style={styles.sectionTitle}>Rede de Apoio</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity style={styles.cardRowAction} activeOpacity={0.7}>
              <View style={styles.rowLeft}>
                <HeartHandshake size={20} color="#f28b50" style={{marginRight: 12}} />
                <View>
                  <Text style={styles.connectionTitle}>Cuidador Vinculado</Text>
                  <Text style={styles.connectionSub}>João Silva (Filho)</Text>
                </View>
              </View>
              <Text style={styles.actionChevron}>{'>'}</Text>
            </TouchableOpacity>
            
            <View style={styles.divider} />

            <TouchableOpacity style={styles.cardRowAction} activeOpacity={0.7}>
              <View style={styles.rowLeft}>
                <Stethoscope size={20} color="#8c8078" style={{marginRight: 12}} />
                <View>
                  <Text style={styles.connectionTitle}>Clínica / Médico</Text>
                  <Text style={styles.connectionSub}>Vincular via QRCode</Text>
                </View>
              </View>
              <Text style={styles.actionChevron}>{'>'}</Text>
            </TouchableOpacity>
          </View>

          {/* Section: Healthcare System & Rights */}
          <Text style={styles.sectionTitle}>Sistema de Saúde e Direitos</Text>
          
          <View style={styles.cardGroup}>
            <View style={styles.cardRowToggle}>
              <View style={{flex: 1}}>
                <Text style={styles.rowLabelDark}>Tratamento pelo SUS</Text>
                <Text style={styles.rowHelper}>Adapta leis e prazos (ex: Lei dos 60 dias)</Text>
              </View>
              <Switch 
                value={isSUS}
                onValueChange={setIsSUS}
                trackColor={{ false: '#e5e0dc', true: '#f28b50' }}
                thumbColor="#ffffff"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.rightsBanner} activeOpacity={0.9}>
            <View style={styles.rightsIconBox}>
              <Scale size={24} color="#ffffff" />
            </View>
            <View style={{flex: 1}}>
               <Text style={styles.rightsTitle}>Meus Direitos</Text>
               <Text style={styles.rightsSubtitle}>Isenção de IR, Saque FGTS, Auxílio-Doença.</Text>
            </View>
            <Text style={{fontSize: 20, color: '#ffffff', fontWeight: 'bold'}}>{'>'}</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#4a3931',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  avatarSection: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#efe9e4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  avatarEditBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#f28b50',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4a3931',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  userSub: {
    fontSize: 14,
    color: '#bdae9f',
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#fbf9f6',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#e5e0dc',
  },
  securityText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 12,
    color: '#8c8078',
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3d2b1f',
    marginBottom: 12,
    marginLeft: 4,
  },
  cardGroup: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  cardRowToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 15,
    color: '#8c8078',
    fontWeight: '500',
  },
  rowLabelDark: {
    fontSize: 15,
    color: '#3d2b1f',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  rowHelper: {
    fontSize: 12,
    color: '#a3988e',
  },
  rowValue: {
    fontSize: 15,
    color: '#3d2b1f',
    fontWeight: 'bold',
  },
  connectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3d2b1f',
    marginBottom: 2,
  },
  connectionSub: {
    fontSize: 12,
    color: '#8c8078',
  },
  actionChevron: {
    fontSize: 20,
    color: '#a3988e',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#efe9e4',
    marginHorizontal: 20,
  },
  rightsBanner: {
    flexDirection: 'row',
    backgroundColor: '#f28b50',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#f28b50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  rightsIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  rightsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  rightsSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 16,
  }
});
