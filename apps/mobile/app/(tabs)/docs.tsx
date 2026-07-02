/**
 * @fileoverview Documents Screen with XAI (Explainable AI) labels.
 * Implements the Figma 2 & 3 designs (Vault, Categories, Accordion, Upload Modal trigger).
 *
 * @module pages/tabs/docs
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Search, Plus, Sparkles, Camera, MessageSquare, FileText, Upload, ChevronUp, ChevronDown, Stethoscope, FileHeart } from 'lucide-react-native';

// AddDocumentModal will be extracted later if it grows, kept inline for rapid FSD prototyping
function AddDocumentModal({ visible, onClose }: { visible: boolean, onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Adicionar documento</Text>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.uploadOptionCard}>
            <View style={styles.uploadOptionIconBox}><Camera size={20} color="#f28b50" /></View>
            <View style={{flex: 1}}>
              <Text style={styles.uploadOptionTitle}>Tirar foto ou enviar imagem</Text>
              <Text style={styles.uploadOptionSubtitle}>A Ani lê o documento via OCR e cataloga automaticamente</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.uploadOptionCardLight}>
            <View style={styles.uploadOptionIconBoxDark}><MessageSquare size={20} color="#4a3931" /></View>
            <View style={{flex: 1}}>
              <Text style={styles.uploadOptionTitleDark}>Descrever para a Ani</Text>
              <Text style={styles.uploadOptionSubtitleDark}>Fale ou escreva — Ani cria um registro estruturado</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.uploadOptionCardLight}>
            <View style={styles.uploadOptionIconBoxDark}><Mic size={20} color="#bdae9f" /></View>
            <View style={{flex: 1}}>
              <Text style={styles.uploadOptionTitleDark}>Áudio — Fui ao médico hoje</Text>
              <Text style={styles.uploadOptionSubtitleDark}>Grave um resumo rápido da consulta, a Ani transcreve e salva</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.uploadOptionCardLight}>
            <View style={styles.uploadOptionIconBoxDark}><Upload size={20} color="#4a3931" /></View>
            <View style={{flex: 1}}>
              <Text style={styles.uploadOptionTitleDark}>Upload de PDF</Text>
              <Text style={styles.uploadOptionSubtitleDark}>Resultados de exames em PDF do laboratório</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.lgpdText}>Todos os documentos são criptografados e armazenados com segurança (LGPD)</Text>
        </View>
      </View>
    </Modal>
  );
}

// Dummy Mic icon since lucide-react-native has 'Mic'
import { Mic } from 'lucide-react-native';

export default function DocsScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');
  
  // Accordion state
  const [examsOpen, setExamsOpen] = useState(true);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={{flex: 1}}>
            <Text style={styles.headerTitle}>Meus Documentos</Text>
            <Text style={styles.headerSubtitle}>19 documentos organizados pela Ani</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
            <Plus size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* XAI Explanation Banner */}
        <View style={styles.xaiBanner}>
          <View style={styles.xaiIconBox}>
             <Sparkles size={24} color="#f28b50" />
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.xaiTitle}>Ani catalogou 19 documentos</Text>
            <Text style={styles.xaiSubtitle}>A partir de fotos, conversas, WhatsApp e quick actions — tudo organizado automaticamente.</Text>
          </View>
        </View>

        {/* XAI Filters (Explainability Tags) */}
        <View style={styles.xaiTagsRow}>
          <View style={styles.xaiTag}><Camera size={12} color="#f28b50" /><Text style={styles.xaiTagTextOrange}>Foto enviada</Text></View>
          <View style={styles.xaiTag}><MessageSquare size={12} color="#8c8078" /><Text style={styles.xaiTagText}>Chat com Ani</Text></View>
          <View style={styles.xaiTag}><MessageSquare size={12} color="#4a3931" /><Text style={styles.xaiTagTextDark}>WhatsApp</Text></View>
        </View>
        <View style={styles.xaiTagsRow2}>
          <View style={styles.xaiTag}><Sparkles size={12} color="#8c8078" /><Text style={styles.xaiTagText}>Quick action</Text></View>
          <View style={styles.xaiTag}><Upload size={12} color="#4a3931" /><Text style={styles.xaiTagTextDark}>Upload</Text></View>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Search size={18} color="#a3988e" />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Buscar em todos os documentos..." 
            placeholderTextColor="#a3988e"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Categories Grid */}
        <View style={styles.categoriesRow}>
          <View style={styles.categoryCard}>
            <View style={styles.categoryIconCircle}><Droplets size={20} color="#f28b50" /></View>
            <Text style={styles.categoryNumber}>5</Text>
            <Text style={styles.categoryName}>Exames</Text>
          </View>
          <View style={styles.categoryCard}>
             <View style={styles.categoryIconCircle}><FileHeart size={20} color="#8c8078" /></View>
            <Text style={styles.categoryNumber}>3</Text>
            <Text style={styles.categoryName}>Imagens</Text>
          </View>
          <View style={styles.categoryCard}>
             <View style={styles.categoryIconCircle}><Stethoscope size={20} color="#3d2b1f" /></View>
            <Text style={styles.categoryNumber}>3</Text>
            <Text style={styles.categoryName}>Consultas</Text>
          </View>
          <View style={styles.categoryCard}>
             <View style={styles.categoryIconCircle}><Pill size={20} color="#8c8078" /></View>
            <Text style={styles.categoryNumber}>2</Text>
            <Text style={styles.categoryName}>Receitas</Text>
          </View>
        </View>

        {/* Exam Accordion */}
        <TouchableOpacity style={styles.accordionHeader} onPress={() => setExamsOpen(!examsOpen)} activeOpacity={0.9}>
          <View style={styles.accordionIconCircle}><Droplets size={18} color="#f28b50" /></View>
          <View style={{flex: 1}}>
            <Text style={styles.accordionTitle}>Exames de Sangue</Text>
            <Text style={styles.accordionSubtitle}>5 documentos</Text>
          </View>
          {examsOpen ? <ChevronUp size={20} color="#ffffff" /> : <ChevronDown size={20} color="#ffffff" />}
        </TouchableOpacity>

        {examsOpen && (
          <View style={styles.accordionContent}>
            {/* List Item 1 */}
            <View style={styles.docItem}>
              <View style={styles.docItemHeader}>
                <View>
                  <Text style={styles.docItemTitle}>Hemograma Completo</Text>
                  <Text style={styles.docItemDate}>22 Mai 2026</Text>
                </View>
                <View style={styles.docXaiBadge}>
                  <Camera size={10} color="#f28b50" />
                  <Text style={styles.docXaiBadgeText}>Foto enviada</Text>
                </View>
              </View>
              <View style={styles.docItemFooter}>
                <View style={styles.docItemFooterLine} />
                <Text style={styles.docItemInsight}>Neutrófilos 1.200 ↓ • Hgb 9.8 ↓</Text>
              </View>
            </View>

            {/* List Item 2 */}
            <View style={styles.docItem}>
              <View style={styles.docItemHeader}>
                <View>
                  <Text style={styles.docItemTitle}>Hemograma Completo</Text>
                  <Text style={styles.docItemDate}>08 Mai 2026</Text>
                </View>
                <View style={styles.docXaiBadge}>
                  <Camera size={10} color="#f28b50" />
                  <Text style={styles.docXaiBadgeText}>Foto enviada</Text>
                </View>
              </View>
              <View style={styles.docItemFooter}>
                <View style={styles.docItemFooterLine} />
                <Text style={styles.docItemInsightDark}>Neutrófilos 2.800 • Hgb 10.2</Text>
              </View>
            </View>

          </View>
        )}

        {/* Spacer for bottom tabs */}
        <View style={{height: 100}} />

      </ScrollView>

      {/* Render Modal */}
      <AddDocumentModal visible={modalVisible} onClose={() => setModalVisible(false)} />

    </SafeAreaView>
  );
}

// We import Droplets here just to use it in categories, you can use any lucide icon
import { Droplets } from 'lucide-react-native';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fbf9f6',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3d2b1f',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8c8078',
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#f28b50',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f28b50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  xaiBanner: {
    flexDirection: 'row',
    backgroundColor: '#5a4a42',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  xaiIconBox: {
    marginRight: 16,
  },
  xaiTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  xaiSubtitle: {
    fontSize: 12,
    color: '#bdae9f',
    lineHeight: 18,
  },
  xaiTagsRow: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  xaiTagsRow2: {
    flexDirection: 'row',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  xaiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  xaiTagTextOrange: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#f28b50',
    marginLeft: 4,
  },
  xaiTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8c8078',
    marginLeft: 4,
  },
  xaiTagTextDark: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#4a3931',
    marginLeft: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    height: 52,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#efe9e4',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#3d2b1f',
  },
  categoriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  categoryCard: {
    width: '23%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#efe9e4',
  },
  categoryIconCircle: {
    marginBottom: 8,
  },
  categoryNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3d2b1f',
    marginBottom: 2,
  },
  categoryName: {
    fontSize: 10,
    color: '#8c8078',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f28b50',
    borderRadius: 20,
    padding: 16,
    marginBottom: 8, // gap to content
  },
  accordionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  accordionSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  accordionContent: {
    gap: 12,
    paddingBottom: 24,
  },
  docItem: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#efe9e4',
  },
  docItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  docItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3d2b1f',
    marginBottom: 4,
  },
  docItemDate: {
    fontSize: 12,
    color: '#8c8078',
  },
  docXaiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  docXaiBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#f28b50',
    marginLeft: 4,
  },
  docItemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  docItemFooterLine: {
    width: 12,
    height: 1,
    backgroundColor: '#f28b50',
    marginRight: 8,
  },
  docItemInsight: {
    fontSize: 13,
    fontWeight: '500',
    color: '#3d2b1f',
  },
  docItemInsightDark: {
    fontSize: 13,
    color: '#3d2b1f',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3d2b1f',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#efe9e4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8c8078',
  },
  uploadOptionCard: {
    flexDirection: 'row',
    backgroundColor: '#fff7f2', // light orange tint
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadOptionCardLight: {
    flexDirection: 'row',
    backgroundColor: '#fbf9f6',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadOptionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#ffe8db',
  },
  uploadOptionIconBoxDark: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#efe9e4',
  },
  uploadOptionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#3d2b1f',
    marginBottom: 2,
  },
  uploadOptionSubtitle: {
    fontSize: 12,
    color: '#8c8078',
  },
  uploadOptionTitleDark: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#3d2b1f',
    marginBottom: 2,
  },
  uploadOptionSubtitleDark: {
    fontSize: 12,
    color: '#8c8078',
  },
  lgpdText: {
    fontSize: 10,
    color: '#a3988e',
    textAlign: 'center',
    marginTop: 16,
  }
});
