/**
 * @fileoverview Meus Documentos Screen.
 * Implements categorization, intelligent summaries, and search.
 *
 * @module pages/tabs/docs
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  RefreshControl,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import {
  Plus,
  Sparkles,
  Camera,
  MessageSquare,
  Mic,
  Upload,
  Search,
  ChevronDown,
  ChevronUp,
  X,
  Droplet,
  Activity,
  Heart,
  Pill,
  ShieldAlert,
  FileText,
  MoreHorizontal
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { BRAND } from '@/shared/constants/brand-colors.const';
import { useAuthStore } from '@/shared/lib/zustand-persist';
import { listDocuments, type DocumentResponse } from '@/shared/api/documents';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ── CONSTANTS & MAPPINGS ──

const DOC_CATEGORIES = [
  { id: 'exames', label: 'Exames de Sangue', icon: Droplet },
  { id: 'imagens', label: 'Imagens e Laudos', icon: Activity },
  { id: 'anatomia', label: 'Anatomia Patológica', icon: FileText },
  { id: 'consultas', label: 'Consultas e Resumos', icon: Heart },
  { id: 'prescricoes', label: 'Prescrições', icon: Pill },
  { id: 'plano', label: 'Plano de Saúde', icon: ShieldAlert },
  { id: 'sus', label: 'SUS / INSS / Direitos', icon: ShieldAlert },
  { id: 'outros', label: 'Outros', icon: MoreHorizontal },
] as const;

const mapDocTypeToCategory = (type: string) => {
  const t = type.toLowerCase();
  if (['hemograma', 'exame_sangue', 'bioquimica', 'coagulograma'].includes(t)) return 'exames';
  if (['imagem_tc', 'imagem_rm', 'imagem_rx', 'imagem_eco', 'imagem_pet', 'laudo_biopsia'].includes(t)) return 'imagens';
  if (['anatomia_patologica'].includes(t)) return 'anatomia';
  if (['relatorio_consulta'].includes(t)) return 'consultas';
  if (['receita'].includes(t)) return 'prescricoes';
  if (['plano_saude'].includes(t)) return 'plano';
  if (['tfd', 'inss', 'sus_direitos'].includes(t)) return 'sus';
  return 'outros';
};

const mapSourceIcon = (source: string) => {
  switch (source) {
    case 'upload': return <Upload size={10} color={BRAND.AUX.BLUE} />;
    case 'camera': return <Camera size={10} color={BRAND.SECONDARY.DEFAULT} />;
    case 'whatsapp': return <MessageSquare size={10} color={BRAND.AUX.GREEN} />;
    case 'quick_action': return <Sparkles size={10} color={BRAND.PRIMARY[400]} />;
    case 'chat':
    default: return <MessageSquare size={10} color={BRAND.PRIMARY.DEFAULT} />;
  }
};

const humanizeType = (type: string) => {
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// ── COMPONENT ──

export default function DocsScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>('Todos');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    exames: true, imagens: true, consultas: true,
  });

  const userId = useAuthStore(s => s.userId);

  const { data: documents, refetch } = useQuery({
    queryKey: ['documents', userId],
    queryFn: () => listDocuments(userId!),
    enabled: !!userId,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const toggleCategory = (catId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  // ── FILTERING & GROUPING ──

  const allYears = useMemo(() => {
    if (!documents) return ['Todos'];
    const years = new Set(documents.map(d => new Date(d.created_at).getFullYear().toString()));
    return ['Todos', ...Array.from(years).sort().reverse()];
  }, [documents]);

  const filteredDocs = useMemo(() => {
    if (!documents) return [];
    return documents.filter(doc => {
      const matchesYear = selectedYear === 'Todos' || new Date(doc.created_at).getFullYear().toString() === selectedYear;
      const q = searchQuery.toLowerCase();
      const matchesSearch = q === '' || 
        (doc.title && doc.title.toLowerCase().includes(q)) ||
        (doc.document_type.toLowerCase().includes(q)) ||
        (doc.summary && doc.summary.toLowerCase().includes(q));
      return matchesYear && matchesSearch;
    });
  }, [documents, selectedYear, searchQuery]);

  const groupedDocs = useMemo(() => {
    const groups: Record<string, DocumentResponse[]> = {};
    DOC_CATEGORIES.forEach(c => groups[c.id] = []);
    
    filteredDocs.forEach(doc => {
      const catId = mapDocTypeToCategory(doc.document_type);
      if (!groups[catId]) groups[catId] = [];
      groups[catId].push(doc);
    });
    return groups;
  }, [filteredDocs]);

  // Order categories: those with docs first
  const displayCategories = useMemo(() => {
    return [...DOC_CATEGORIES].sort((a, b) => {
      const aLen = (groupedDocs[a.id] || []).length;
      const bLen = (groupedDocs[b.id] || []).length;
      if (aLen === 0 && bLen > 0) return 1;
      if (bLen === 0 && aLen > 0) return -1;
      return 0;
    });
  }, [groupedDocs]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        
        {/* ── HEADER ── */}
        <LinearGradient
          colors={[BRAND.PRIMARY.DEFAULT, BRAND.PRIMARY[400]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Meus Documentos</Text>
            <Text style={styles.headerSubtitle}>{documents?.length || 0} documentos organizados pela Ani</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        {/* ── AI BANNER ── */}
        <View style={styles.aiBanner}>
          <Sparkles size={20} color={BRAND.SECONDARY.DEFAULT} style={{ marginTop: 2, marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.aiBannerTitle}>Ani catalogou {documents?.length || 0} documentos</Text>
            <Text style={styles.aiBannerDesc}>
              A partir de fotos, conversas, WhatsApp e uploads — tudo organizado automaticamente.
            </Text>
          </View>
        </View>

        {/* ── BUSCA E FILTROS ── */}
        <View style={styles.searchContainer}>
          <Search size={20} color={BRAND.PRIMARY[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar em todos os documentos..."
            placeholderTextColor={BRAND.PRIMARY[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yearScroll} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {allYears.map(year => (
            <TouchableOpacity 
              key={year}
              style={[styles.yearChip, selectedYear === year && styles.yearChipActive]}
              onPress={() => setSelectedYear(year)}
            >
              <Text style={[styles.yearChipText, selectedYear === year && styles.yearChipTextActive]}>{year}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── ACORDEÕES ── */}
        <View style={styles.accordionsWrapper}>
          {displayCategories.map(cat => {
            const catDocs = groupedDocs[cat.id] || [];
            const isExpanded = expandedCategories[cat.id];
            const hasDocs = catDocs.length > 0;
            const Icon = cat.icon;

            return (
              <View key={cat.id} style={[styles.accordion, !hasDocs && styles.accordionEmpty]}>
                <TouchableOpacity 
                  style={styles.accordionHeader} 
                  activeOpacity={0.7}
                  onPress={() => toggleCategory(cat.id)}
                >
                  <View style={styles.accordionHeaderLeft}>
                    <Icon size={20} color={hasDocs ? BRAND.SECONDARY.DEFAULT : BRAND.PRIMARY[400]} />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={[styles.accordionTitle, !hasDocs && { color: BRAND.PRIMARY[400] }]}>{cat.label}</Text>
                      <Text style={styles.accordionSubtitle}>{catDocs.length} documento{catDocs.length !== 1 && 's'}</Text>
                    </View>
                  </View>
                  {isExpanded ? <ChevronUp size={20} color={BRAND.PRIMARY[400]} /> : <ChevronDown size={20} color={BRAND.PRIMARY[400]} />}
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.accordionBody}>
                    {!hasDocs ? (
                      <Text style={styles.emptyText}>Nenhum documento nesta categoria para o filtro selecionado.</Text>
                    ) : (
                      catDocs.map((doc, idx) => (
                        <TouchableOpacity 
                          key={doc.id} 
                          style={[styles.docCard, idx === catDocs.length - 1 && { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}
                          activeOpacity={0.7}
                          onPress={() => router.push({ pathname: '/document/[id]', params: { id: doc.id, docData: JSON.stringify(doc) } })}
                        >
                          <View style={styles.docCardHeader}>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.docTitle}>{doc.title || humanizeType(doc.document_type)}</Text>
                              <Text style={styles.docDate}>{new Date(doc.created_at).toLocaleDateString('pt-BR')}</Text>
                            </View>
                            <View style={styles.docSourceTag}>
                              {mapSourceIcon(doc.source_channel)}
                              <Text style={styles.docSourceText}>{humanizeType(doc.source_channel)}</Text>
                            </View>
                          </View>
                          {doc.summary && (
                            <View style={styles.docSummaryBox}>
                              <Text style={styles.docSummaryArrow}>↳</Text>
                              <Text style={styles.docSummaryText}>{doc.summary}</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* ── CTA BOTTOM ── */}
        <TouchableOpacity 
          style={styles.bigOrangeCta}
          activeOpacity={0.9}
          onPress={() => setModalVisible(true)}
        >
          <View style={{flex: 1}}>
            <Text style={styles.bigOrangeCtaTitle}>Adicionar documento</Text>
            <Text style={styles.bigOrangeCtaSubtitle}>Foto, PDF, áudio ou descreva para a Ani</Text>
          </View>
          <Plus size={24} color={BRAND.SURFACE.CARD} />
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── MODAL ── */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar documento</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                <X size={20} color={BRAND.PRIMARY.DEFAULT} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
              <View style={styles.actionIconBox}>
                <Camera size={20} color={BRAND.SECONDARY.DEFAULT} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>Tirar foto ou enviar imagem</Text>
                <Text style={styles.actionSubtitle}>A Ani lê o documento via OCR e cataloga automaticamente</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
              <View style={styles.actionIconBoxDark}>
                <MessageSquare size={20} color={BRAND.PRIMARY.DEFAULT} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>Descrever para a Ani</Text>
                <Text style={styles.actionSubtitle}>Fale ou escreva — Ani cria um registro estruturado</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
              <View style={styles.actionIconBox}>
                <Mic size={20} color={BRAND.SECONDARY.DEFAULT} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>Áudio — Fui ao médico hoje</Text>
                <Text style={styles.actionSubtitle}>Grave um resumo da consulta, a Ani transcreve e salva</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
              <View style={styles.actionIconBoxDark}>
                <Upload size={20} color={BRAND.PRIMARY.DEFAULT} />
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
    backgroundColor: BRAND.BG.LIGHT,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 16,
    paddingBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 22,
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: BRAND.SECONDARY.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Banner AI */
  aiBanner: {
    flexDirection: 'row',
    backgroundColor: BRAND.PRIMARY.DEFAULT,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: -16, // overlap
  },
  aiBannerTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: '#fff',
    marginBottom: 4,
  },
  aiBannerDesc: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 18,
  },

  /* Search & Filters */
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: BRAND.SURFACE.BORDER,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    color: BRAND.PRIMARY.DEFAULT,
  },
  yearScroll: {
    marginTop: 16,
    marginBottom: 4,
  },
  yearChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BRAND.SURFACE.BORDER,
    marginRight: 8,
  },
  yearChipActive: {
    backgroundColor: BRAND.PRIMARY.DEFAULT,
    borderColor: BRAND.PRIMARY.DEFAULT,
  },
  yearChipText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: BRAND.PRIMARY[600],
  },
  yearChipTextActive: {
    color: '#fff',
  },

  /* Accordions */
  accordionsWrapper: {
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 12,
  },
  accordion: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BRAND.SURFACE.BORDER,
    overflow: 'hidden',
  },
  accordionEmpty: {
    backgroundColor: BRAND.PRIMARY[50],
    borderColor: 'transparent',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  accordionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accordionTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: BRAND.PRIMARY.DEFAULT,
  },
  accordionSubtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: BRAND.PRIMARY[400],
    marginTop: 2,
  },
  accordionBody: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: BRAND.PRIMARY[100],
    marginTop: 8,
  },
  emptyText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: BRAND.PRIMARY[400],
    fontStyle: 'italic',
    paddingVertical: 8,
  },

  /* Document Card */
  docCard: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.PRIMARY[100],
  },
  docCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  docTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: BRAND.PRIMARY.DEFAULT,
    marginBottom: 4,
  },
  docDate: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: BRAND.PRIMARY[400],
  },
  docSourceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND.PRIMARY[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  docSourceText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 10,
    color: BRAND.PRIMARY[600],
  },
  docSummaryBox: {
    flexDirection: 'row',
    marginTop: 12,
    paddingLeft: 4,
  },
  docSummaryArrow: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: BRAND.PRIMARY[400],
    marginRight: 8,
  },
  docSummaryText: {
    flex: 1,
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: BRAND.PRIMARY[600],
  },

  /* Bottom CTA */
  bigOrangeCta: {
    backgroundColor: BRAND.SECONDARY.DEFAULT,
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bigOrangeCtaTitle: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: '#fff',
    marginBottom: 4,
  },
  bigOrangeCtaSubtitle: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: 'rgba(255,255,255,0.85)',
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(23,17,13,0.6)', // BRAND.PRIMARY[900] with opacity
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: BRAND.BG.LIGHT,
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
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 20,
    color: BRAND.PRIMARY.DEFAULT,
  },
  modalCloseBtn: {
    padding: 8,
    backgroundColor: BRAND.PRIMARY[100],
    borderRadius: 20,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  actionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: BRAND.SECONDARY[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionIconBoxDark: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: BRAND.PRIMARY[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: BRAND.PRIMARY.DEFAULT,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: BRAND.PRIMARY[400],
    lineHeight: 18,
  },
  modalFooterText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: BRAND.PRIMARY[400],
    textAlign: 'center',
    marginTop: 16,
  },
});
