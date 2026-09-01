/**
 * @fileoverview Meus Documentos — Lista laudos, exames e prescrições do paciente.
 * Permite upload via câmera ou galeria, processa com OCR + IA (Textract + Gemini)
 * e exibe summary e perguntas geradas para o médico.
 *
 * @module pages/documents/DocumentsPage
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, FileText, X, ChevronDown, ChevronUp } from 'lucide-react-native';

import { useDocuments, useUploadDocument, type Document } from '@/features/documents/hooks/useDocuments';
import { BRAND } from '@/shared/constants/brand-colors.const';


const DOC_TYPE_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  laudo_biopsia:      { label: 'Laudo / Biópsia',      emoji: '🔬', color: BRAND.AUX.PURPLE },
  hemograma:          { label: 'Hemograma',             emoji: '🩸', color: BRAND.ERROR.DEFAULT },
  imagem_tc:          { label: 'Imagem / TC / RM',      emoji: '🩻', color: BRAND.AUX.BLUE },
  receita:            { label: 'Receita',               emoji: '💊', color: BRAND.SEMANTIC.SUCCESS },
  relatorio_consulta: { label: 'Relatório de Consulta', emoji: '📋', color: BRAND.SECONDARY.DEFAULT },
  documento:          { label: 'Documento',             emoji: '📄', color: BRAND.PRIMARY[400] },
};

function getDocMeta(type: string) {
  return DOC_TYPE_LABELS[type] ?? DOC_TYPE_LABELS['documento'];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}


function DocumentCard({ doc }: { doc: Document }) {
  const [expanded, setExpanded] = useState(false);
  const meta = getDocMeta(doc.document_type);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => setExpanded((v) => !v)}
      accessibilityRole="button"
      accessibilityLabel={`Documento: ${meta.label}`}
      style={{
        backgroundColor: BRAND.SURFACE.CARD_DARK,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: BRAND.SURFACE.BORDER_DARK,
        marginBottom: 12,
        overflow: 'hidden',
      }}
    >
      {/* Top accent line */}
      <View style={{ height: 3, backgroundColor: meta.color }} />

      <View style={{ padding: 16 }}>
        {/* Header row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
            <View
              style={{
                width: 40, height: 40, borderRadius: 12,
                backgroundColor: meta.color + '22',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 20 }}>{meta.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{ color: BRAND.SURFACE.CARD, fontFamily: 'Nunito_700Bold', fontSize: 16 }}
                numberOfLines={1}
              >
                {meta.label}
              </Text>
              <Text style={{ color: BRAND.PRIMARY[400], fontFamily: 'Nunito_400Regular', fontSize: 16, marginTop: 2 }}>
                {formatDate(doc.created_at)} · {doc.source_channel}
              </Text>
            </View>
          </View>
          {expanded
            ? <ChevronUp size={18} color={BRAND.PRIMARY[400]} />
            : <ChevronDown size={18} color={BRAND.PRIMARY[400]} />}
        </View>

        {/* Summary — always visible */}
        <Text
          style={{
            color: BRAND.SURFACE.BORDER, fontFamily: 'Nunito_400Regular', fontSize: 16,
            lineHeight: 20, marginTop: 12,
          }}
          numberOfLines={expanded ? undefined : 2}
        >
          {doc.summary}
        </Text>

        {/* Expanded: key finding + questions */}
        {expanded && (
          <>
            {doc.key_finding ? (
              <View
                style={{
                  marginTop: 12, padding: 10, borderRadius: 10,
                  backgroundColor: meta.color + '18',
                  borderLeftWidth: 3, borderLeftColor: meta.color,
                }}
              >
                <Text style={{ color: meta.color, fontFamily: 'Nunito_700Bold', fontSize: 16, marginBottom: 4 }}>
                  📌 Achado principal
                </Text>
                <Text style={{ color: BRAND.SURFACE.BORDER, fontFamily: 'Nunito_400Regular', fontSize: 16, lineHeight: 18 }}>
                  {doc.key_finding}
                </Text>
              </View>
            ) : null}

            {doc.ai_questions.length > 0 && (
              <View style={{ marginTop: 12 }}>
                <Text style={{ color: BRAND.PRIMARY[400], fontFamily: 'Nunito_700Bold', fontSize: 16, marginBottom: 8 }}>
                  💬 Perguntas para o seu médico
                </Text>
                {doc.ai_questions.map((q, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 }}>
                    <Text style={{ color: BRAND.AUX.PURPLE, fontFamily: 'Nunito_700Bold', fontSize: 16, marginRight: 6 }}>
                      {i + 1}.
                    </Text>
                    <Text style={{ color: BRAND.SURFACE.BORDER, fontFamily: 'Nunito_400Regular', fontSize: 16, flex: 1, lineHeight: 18 }}>
                      {q}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}


function UploadModal({
  visible,
  onClose,
  onCamera,
  onGallery,
}: {
  visible: boolean;
  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
}) {
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}
        onPress={onClose}
      >
        <Pressable
          style={{
            backgroundColor: BRAND.SURFACE.CARD_DARK,
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            padding: 24, paddingBottom: 40,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ color: BRAND.SURFACE.CARD, fontFamily: 'Nunito_800ExtraBold', fontSize: 18 }}>
              Adicionar Documento
            </Text>
            <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Fechar">
              <X size={22} color={BRAND.PRIMARY[400]} />
            </TouchableOpacity>
          </View>

          <Text style={{ color: BRAND.PRIMARY[400], fontFamily: 'Nunito_400Regular', fontSize: 16, marginBottom: 20 }}>
            A Ani vai ler e explicar o documento para você em linguagem simples.
          </Text>

          <TouchableOpacity
            onPress={onCamera}
            accessibilityRole="button"
            accessibilityLabel="Tirar foto"
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 14,
              backgroundColor: BRAND.AUX.PURPLE, borderRadius: 14, padding: 16, marginBottom: 12,
            }}
          >
            <Camera size={24} color={BRAND.SURFACE.CARD} />
            <View>
              <Text style={{ color: BRAND.SURFACE.CARD, fontFamily: 'Nunito_700Bold', fontSize: 16 }}>
                Tirar foto agora
              </Text>
              <Text style={{ color: BRAND.AUX.PURPLE, fontFamily: 'Nunito_400Regular', fontSize: 16 }}>
                Use a câmera para fotografar o laudo
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onGallery}
            accessibilityRole="button"
            accessibilityLabel="Escolher da galeria"
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 14,
              backgroundColor: BRAND.SURFACE.BORDER_DARK, borderRadius: 14, padding: 16,
              borderWidth: 1, borderColor: BRAND.SURFACE.BORDER_DARK,
            }}
          >
            <ImageIcon size={24} color={BRAND.AUX.PURPLE} />
            <View>
              <Text style={{ color: BRAND.SURFACE.CARD, fontFamily: 'Nunito_700Bold', fontSize: 16 }}>
                Escolher da Galeria
              </Text>
              <Text style={{ color: BRAND.PRIMARY[400], fontFamily: 'Nunito_400Regular', fontSize: 16 }}>
                Selecione uma foto ou PDF existente
              </Text>
            </View>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}


function ProcessingOverlay() {
  return (
    <View
      style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(15,10,26,0.92)',
        alignItems: 'center', justifyContent: 'center', zIndex: 100,
      }}
    >
      <ActivityIndicator size="large" color={BRAND.AUX.PURPLE} />
      <Text style={{ color: BRAND.SURFACE.CARD, fontFamily: 'Nunito_700Bold', fontSize: 16, marginTop: 16 }}>
        Ani está lendo seu documento...
      </Text>
      <Text style={{ color: BRAND.PRIMARY[400], fontFamily: 'Nunito_400Regular', fontSize: 16, marginTop: 6, textAlign: 'center', paddingHorizontal: 40 }}>
        Extraindo texto e gerando resumo. Isso pode levar alguns segundos.
      </Text>
    </View>
  );
}


export function DocumentsPage() {
  const [showModal, setShowModal] = useState(false);
  const { data: documents, isLoading, error } = useDocuments();
  const uploadMutation = useUploadDocument();

  const handlePickImage = async (source: 'camera' | 'gallery') => {
    setShowModal(false);

    const permissionResult =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        'Permissão necessária',
        source === 'camera'
          ? 'Precisamos de acesso à câmera para fotografar o documento.'
          : 'Precisamos de acesso à galeria para selecionar o documento.',
        [{ text: 'OK' }]
      );
      return;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: 'images',
            quality: 0.85,
            allowsEditing: false,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            quality: 0.85,
            allowsEditing: false,
          });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const filename = asset.fileName ?? `documento_${Date.now()}.jpg`;
    const mimeType = asset.mimeType ?? 'image/jpeg';

    uploadMutation.mutate(
      { uri: asset.uri, name: filename, mimeType },
      {
        onError: () => {
          Alert.alert(
            'Erro ao processar',
            'Não foi possível enviar o documento. Verifique sua conexão e tente novamente.',
            [{ text: 'OK' }]
          );
        },
      }
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BRAND.BG.DARK }}>
      {uploadMutation.isPending && <ProcessingOverlay />}

      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14,
          borderBottomWidth: 1, borderBottomColor: BRAND.SURFACE.BORDER_DARK,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <View>
          <Text style={{ color: BRAND.SURFACE.CARD, fontSize: 24, fontFamily: 'Nunito_800ExtraBold' }}>
            Meus Documentos
          </Text>
          <Text style={{ color: BRAND.PRIMARY[400], fontSize: 16, fontFamily: 'Nunito_400Regular', marginTop: 2 }}>
            Laudos, exames e prescrições
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowModal(true)}
          accessibilityRole="button"
          accessibilityLabel="Adicionar documento"
          style={{
            backgroundColor: BRAND.AUX.PURPLE, width: 42, height: 42,
            borderRadius: 14, alignItems: 'center', justifyContent: 'center',
          }}
        >
          <FileText size={20} color={BRAND.SURFACE.CARD} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Loading state */}
        {isLoading && (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <ActivityIndicator size="large" color={BRAND.AUX.PURPLE} />
            <Text style={{ color: BRAND.PRIMARY[400], fontFamily: 'Nunito_400Regular', marginTop: 12 }}>
              Carregando documentos...
            </Text>
          </View>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
            <Text style={{ color: BRAND.ERROR.DEFAULT, fontFamily: 'Nunito_700Bold', fontSize: 16 }}>
              Erro ao carregar documentos
            </Text>
            <Text style={{ color: BRAND.PRIMARY[400], fontFamily: 'Nunito_400Regular', fontSize: 16, marginTop: 4 }}>
              Verifique sua conexão com a internet.
            </Text>
          </View>
        )}

        {/* Empty state */}
        {!isLoading && !error && (!documents || documents.length === 0) && (
          <View style={{ alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 }}>
            <Text style={{ fontSize: 56, marginBottom: 16 }}>📄</Text>
            <Text style={{ color: BRAND.SURFACE.CARD, fontFamily: 'Nunito_700Bold', fontSize: 18, textAlign: 'center', marginBottom: 8 }}>
              Nenhum documento ainda
            </Text>
            <Text style={{ color: BRAND.PRIMARY[400], fontFamily: 'Nunito_400Regular', fontSize: 16, textAlign: 'center', lineHeight: 22, marginBottom: 28 }}>
              Adicione laudos e exames para que a Ani possa explicá-los em linguagem simples e gerar perguntas para o seu médico.
            </Text>
            <TouchableOpacity
              onPress={() => setShowModal(true)}
              accessibilityRole="button"
              accessibilityLabel="Adicionar primeiro documento"
              style={{
                backgroundColor: BRAND.AUX.PURPLE, paddingVertical: 14, paddingHorizontal: 28,
                borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 8,
              }}
            >
              <FileText size={18} color={BRAND.SURFACE.CARD} />
              <Text style={{ color: BRAND.SURFACE.CARD, fontFamily: 'Nunito_700Bold', fontSize: 16 }}>
                Adicionar Documento
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Document list */}
        {!isLoading && documents && documents.length > 0 && (
          <>
            <Text style={{ color: BRAND.PRIMARY[400], fontFamily: 'Nunito_600SemiBold', fontSize: 16, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
              {documents.length} {documents.length === 1 ? 'documento' : 'documentos'}
            </Text>
            {documents.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </>
        )}
      </ScrollView>

      <UploadModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onCamera={() => handlePickImage('camera')}
        onGallery={() => handlePickImage('gallery')}
      />
    </SafeAreaView>
  );
}