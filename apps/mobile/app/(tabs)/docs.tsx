/**
 * @fileoverview Documents Tab Screen.
 * Implements the Figma designs for Document Management and Categorization.
 * Includes the Add Document modal.
 *
 * @module pages/tabs/docs
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Modal, Platform } from 'react-native';
import { Plus, Sparkles, Camera, MessageSquare, Mic, Upload, Search, Droplet, Activity, Heart, Pill, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';

import { BRAND } from '@/shared/constants/brand-colors.const';
import { useAuthStore } from '@/shared/lib/zustand-persist';
import { listDocuments } from '@/shared/api/documents';

export default function DocsScreen() {
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userId = useAuthStore(s => s.userId);

  const { data: documents } = useQuery({
    queryKey: ['documents', userId],
    queryFn: () => listDocuments(userId!),
    enabled: !!userId,
  });

  const docsCount = documents?.length || 0;

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Meus Documentos</Text>
            <Text style={styles.headerSubtitle}>{docsCount} documentos organizados pela Ani</Text>
          </View>
          <TouchableOpacity 
            style={styles.addButton} 
            activeOpacity={0.8}
            onPress={() => setModalVisible(true)}
          >
            <Plus size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* AI Banner */}
        <View style={styles.aiBanner}>
          <Sparkles size={24} color="#f28b50" style={{ marginTop: 2, marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.aiBannerTitle}>Ani catalogou {docsCount} documentos</Text>
            <Text style={styles.aiBannerDesc}>
              A partir de fotos, conversas, WhatsApp e quick actions — tudo organizado automaticamente.
            </Text>
          </View>
        </View>

        {/* Source Tags */}
        <View style={styles.tagsContainer}>
          <View style={styles.tag}><Camera size={12} color="#f28b50" /><Text style={styles.tagTextOrange}>Foto enviada</Text></View>
          <View style={styles.tag}><MessageSquare size={12} color="#a3988e" /><Text style={styles.tagTextDark}>Chat com Ani</Text></View>
          <View style={styles.tag}><MessageSquare size={12} color="#a3988e" /><Text style={styles.tagTextDark}>WhatsApp</Text></View>
          <View style={styles.tag}><Sparkles size={12} color="#a3988e" /><Text style={styles.tagTextDark}>Quick action</Text></View>
          <View style={styles.tag}><Upload size={12} color="#a3988e" /><Text style={styles.tagTextDark}>Upload</Text></View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#a3988e" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar em todos os documentos..."
            placeholderTextColor="#a3988e"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categories Row */}
        <View style={styles.categoriesRow}>
          <TouchableOpacity style={styles.categoryCard}>
            <Droplet size={20} color="#f28b50" />
            <Text style={styles.categoryCountOrange}>5</Text>
            <Text style={styles.categoryLabel}>Exames</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryCard}>
            <Activity size={20} color="#8c8078" />
            <Text style={styles.categoryCountDark}>3</Text>
            <Text style={styles.categoryLabel}>Imagens</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryCard}>
            <Heart size={20} color="#8c8078" />
            <Text style={styles.categoryCountDark}>3</Text>
            <Text style={styles.categoryLabel}>Consultas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryCard}>
            <Pill size={20} color="#8c8078" />
            <Text style={styles.categoryCountDark}>2</Text>
            <Text style={styles.categoryLabel}>Receitas</Text>
          </TouchableOpacity>
        </View>

        {/* Document Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <View style={styles.sectionIconBox}>
              <Droplet size={18} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Todos os Documentos</Text>
              <Text style={styles.sectionSubtitle}>{docsCount} documentos</Text>
            </View>
          </View>
          <Text style={{ fontSize: 14, color: '#ffffff', fontWeight: 'bold' }}>▲</Text>
        </View>

        {/* Document Items */}
        {/* Document Items */}
        {documents?.map(doc => (
          <View key={doc.id} style={styles.documentItem}>
            <View style={styles.docItemHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.docItemTitle}>{doc.document_type || 'Documento'}</Text>
                <Text style={styles.docItemDate}>{new Date(doc.created_at).toLocaleDateString('pt-BR')}</Text>
              </View>
              <View style={styles.docItemTag}>
                {doc.source_channel === 'upload' ? <Upload size={10} color="#f28b50" /> : <Camera size={10} color="#f28b50" />}
                <Text style={styles.docItemTagText}>{doc.source_channel}</Text>
              </View>
            </View>
            <View style={styles.docItemContent}>
              <Text style={styles.docItemDash}>—</Text>
              <Text style={styles.docItemSummary}>{doc.summary}</Text>
            </View>
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Document Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar documento</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                <X size={20} color="#4a3931" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
              <View style={styles.actionIconBox}>
                <Camera size={20} color="#f28b50" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>Tirar foto ou enviar imagem</Text>
                <Text style={styles.actionSubtitle}>A Ani lê o documento via OCR e cataloga automaticamente</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
              <View style={styles.actionIconBoxDark}>
                <MessageSquare size={20} color="#4a3931" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>Descrever para a Ani</Text>
                <Text style={styles.actionSubtitle}>Fale ou escreva — Ani cria um registro estruturado</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
              <View style={styles.actionIconBox}>
                <Mic size={20} color="#f28b50" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>Áudio — Fui ao médico hoje</Text>
                <Text style={styles.actionSubtitle}>Grave um resumo rápido da consulta, a Ani transcreve e salva</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
              <View style={styles.actionIconBoxDark}>
                <Upload size={20} color="#4a3931" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>Upload de PDF</Text>
                <Text style={styles.actionSubtitle}>Resultados de exames em PDF do laboratório</Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.modalFooterText}>
              Todos os documentos são criptografados e armazenados com segurança (LGPD)
            </Text>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BRAND.BG.LIGHT, // #F0E9E5
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 24,
    color: BRAND.PRIMARY.DEFAULT, // #403229
  },
  headerSubtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: BRAND.PRIMARY[600],
    marginTop: 2,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: BRAND.SECONDARY.DEFAULT, // #FF9A5C
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BRAND.SECONDARY.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  aiBanner: {
    flexDirection: 'row',
    backgroundColor: BRAND.PRIMARY.DEFAULT,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  aiBannerTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 4,
  },
  aiBannerDesc: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tagTextOrange: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: BRAND.SECONDARY.DEFAULT,
  },
  tagTextDark: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: BRAND.PRIMARY[400],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND.SURFACE.CARD,
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    color: BRAND.PRIMARY.DEFAULT,
  },
  categoriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  categoryCard: {
    backgroundColor: BRAND.SURFACE.CARD,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    width: '23%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  categoryCountOrange: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 20,
    color: BRAND.SECONDARY.DEFAULT,
    marginTop: 8,
  },
  categoryCountDark: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 20,
    color: BRAND.PRIMARY.DEFAULT,
    marginTop: 8,
  },
  categoryLabel: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 11,
    color: BRAND.PRIMARY[600],
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BRAND.SECONDARY.DEFAULT,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: '#ffffff',
  },
  sectionSubtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  documentItem: {
    backgroundColor: BRAND.SURFACE.CARD,
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  docItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  docItemTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 15,
    color: BRAND.PRIMARY.DEFAULT,
    marginBottom: 4,
  },
  docItemDate: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: BRAND.PRIMARY[400],
  },
  docItemTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  docItemTagText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 10,
    color: BRAND.SECONDARY.DEFAULT,
  },
  docItemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  docItemDash: {
    fontFamily: 'Nunito_700Bold',
    color: BRAND.SECONDARY.DEFAULT,
    marginRight: 8,
  },
  docItemSummary: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: BRAND.PRIMARY.DEFAULT,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: BRAND.BG.LIGHT,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 20,
    color: BRAND.PRIMARY.DEFAULT,
  },
  modalCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND.SURFACE.CARD,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  actionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,154,92,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionIconBoxDark: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(64,50,41,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 15,
    color: BRAND.PRIMARY.DEFAULT,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: BRAND.PRIMARY[600],
    lineHeight: 18,
  },
  modalFooterText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 10,
    color: BRAND.PRIMARY[400],
    textAlign: 'center',
    marginTop: 16,
  }
});