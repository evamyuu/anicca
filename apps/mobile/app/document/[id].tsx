/**
 * @fileoverview Document Details Modal Screen.
 *
 * @module pages/document/[id]
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronDown, Trash2, ExternalLink, HelpCircle, FileText, AlertTriangle } from 'lucide-react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { BRAND } from '@/shared/constants/brand-colors.const';
import { deleteDocument, type DocumentResponse } from '@/shared/api/documents';
import { useAuthStore } from '@/shared/lib/zustand-persist';

export default function DocumentDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  
  // Parse docData string back to object
  const doc: DocumentResponse | null = params.docData ? JSON.parse(params.docData as string) : null;

  const isImage = doc?.file_url?.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/);

  const [isDeleting, setIsDeleting] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', userId] });
      router.back();
    },
    onError: () => {
      Alert.alert("Erro", "Não foi possível excluir o documento. Tente novamente.");
      setIsDeleting(false);
    }
  });

  if (!doc) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Documento não encontrado.</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeBtnText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleOpenAttachment = async () => {
    // Note: Since we are in local dev, S3 urls might just be placeholders.
    // If it's a real HTTP url, Linking will open it. Otherwise show an alert.
    if (doc.file_url && doc.file_url.startsWith('http')) {
      await Linking.openURL(doc.file_url);
    } else {
      Alert.alert(
        "Visualização indisponível", 
        `No ambiente local, o anexo está em: ${doc.file_url}. Em produção, isso abriria o PDF original.`
      );
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Excluir documento",
      "Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          style: "destructive", 
          onPress: () => {
            setIsDeleting(true);
            deleteMutation.mutate(doc.id);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Detalhes do Documento</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeIconBtn} hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}>
          <ChevronDown size={24} color={BRAND.PRIMARY.DEFAULT} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Title & Metadata */}
        <View style={styles.metaContainer}>
          <Text style={styles.docTitle}>{doc.title || doc.document_type}</Text>
          <Text style={styles.docDate}>
            Enviado em {new Date(doc.created_at).toLocaleDateString('pt-BR')} via {doc.source_channel}
          </Text>
        </View>

        {/* Inline Image Attachment */}
        {isImage && (
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: doc.file_url }} 
              style={styles.inlineImage} 
              resizeMode="contain"
            />
          </View>
        )}

        {/* Key Finding Box */}
        {doc.key_finding && (
          <View style={styles.keyFindingBox}>
            <View style={styles.keyFindingHeader}>
              <AlertTriangle size={18} color={BRAND.SECONDARY[800]} />
              <Text style={styles.keyFindingTitle}>Principal Achado</Text>
            </View>
            <Text style={styles.keyFindingText}>{doc.key_finding}</Text>
          </View>
        )}

        {/* Summary Box */}
        {doc.summary && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FileText size={18} color={BRAND.PRIMARY[500]} />
              <Text style={styles.sectionTitle}>Resumo da Ani</Text>
            </View>
            <Text style={styles.summaryText}>{doc.summary}</Text>
          </View>
        )}

        {/* Questions Box */}
        {doc.ai_questions && doc.ai_questions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <HelpCircle size={18} color={BRAND.PRIMARY[500]} />
              <Text style={styles.sectionTitle}>Perguntas para a Consulta</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Dúvidas extraídas que você pode perguntar ao médico:</Text>
            <View style={styles.questionsList}>
              {doc.ai_questions.map((q, idx) => (
                <View key={idx} style={styles.questionItem}>
                  <Text style={styles.questionNumber}>{idx + 1}.</Text>
                  <Text style={styles.questionText}>{q}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {!isImage && (
            <TouchableOpacity 
              style={styles.primaryBtn} 
              activeOpacity={0.8}
              onPress={handleOpenAttachment}
            >
              <ExternalLink size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>Ver Anexo (PDF)</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={styles.deleteBtn}  
            activeOpacity={0.8}
            onPress={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 size={20} color="#E53E3E" />
            <Text style={styles.deleteBtnText}>{isDeleting ? 'Excluindo...' : 'Excluir Documento'}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BRAND.BG.LIGHT,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND.BG.LIGHT,
  },
  errorText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    color: BRAND.PRIMARY[600],
    marginBottom: 16,
  },
  closeBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: BRAND.PRIMARY.DEFAULT,
    borderRadius: 8,
  },
  closeBtnText: {
    color: '#fff',
    fontFamily: 'Nunito_700Bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.SURFACE.BORDER,
    backgroundColor: '#fff',
  },
  headerTitleBox: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 18,
    color: BRAND.PRIMARY.DEFAULT,
  },
  closeIconBtn: {
    width: 32,
    height: 32,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  metaContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  docTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 24,
    color: BRAND.PRIMARY.DEFAULT,
    marginBottom: 6,
  },
  docDate: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: BRAND.PRIMARY[500],
  },
  imageContainer: {
    marginHorizontal: 24,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: BRAND.SURFACE.BASE,
    borderWidth: 1,
    borderColor: BRAND.SURFACE.BORDER,
  },
  inlineImage: {
    width: '100%',
    height: 400,
  },
  keyFindingBox: {
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 20,
    backgroundColor: BRAND.SECONDARY[100],
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BRAND.SECONDARY[300],
  },
  keyFindingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  keyFindingTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: BRAND.SECONDARY[800],
  },
  keyFindingText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: BRAND.SECONDARY[900],
    lineHeight: 22,
  },
  section: {
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: BRAND.SURFACE.BORDER,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: BRAND.PRIMARY.DEFAULT,
  },
  sectionSubtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: BRAND.PRIMARY[500],
    marginBottom: 16,
  },
  summaryText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: BRAND.PRIMARY[600],
  },
  questionsList: {
    gap: 12,
  },
  questionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: BRAND.BG.LIGHT,
    padding: 12,
    borderRadius: 12,
  },
  questionNumber: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: BRAND.SECONDARY.DEFAULT,
    marginRight: 8,
    marginTop: 2,
  },
  questionText: {
    flex: 1,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: BRAND.PRIMARY[800],
    lineHeight: 20,
  },
  actionsContainer: {
    paddingHorizontal: 24,
    marginTop: 8,
    gap: 16,
  },
  primaryBtn: {
    backgroundColor: BRAND.PRIMARY.DEFAULT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  primaryBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: '#fff',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FED7D7', // light red border
    backgroundColor: '#FFF5F5',
    gap: 8,
  },
  deleteBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: '#E53E3E',
  },
});
