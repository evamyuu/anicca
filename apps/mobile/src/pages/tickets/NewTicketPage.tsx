/**
 * @fileoverview Abrir / editar chamado.
 *
 * @module pages/tickets/NewTicketPage
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/shared/lib/zustand-persist';
import { listTickets, createTicket, updateTicket, type TicketChannel, type TicketType } from '@/shared/api/tickets';
import { BRAND } from '@/shared/constants/brand-colors.const';
import { notify } from '@/shared/lib/notify';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';
import { Chip, FieldLabel, FormCard, PrimaryButton, TextField, formStyles } from '@/shared/ui/FormKit';

import { TICKET_CHANNELS, TICKET_TYPES } from './ticket-meta';

export function NewTicketPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const userId = useAuthStore(s => s.userId);
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [type, setType] = useState<TicketType>('exame');
  const [channel, setChannel] = useState<TicketChannel>('sus');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const { data: tickets } = useQuery({
    queryKey: ['tickets', userId],
    queryFn: () => listTickets(userId!),
    enabled: !!userId && isEdit,
  });

  const existing = tickets?.find(t => t.id === id);
  useEffect(() => {
    if (!existing) return;
    setType(existing.type);
    setChannel(existing.channel);
    setTitle(existing.title);
    setDescription(existing.description);
  }, [existing]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const input = { type, channel, title: title.trim(), description: description.trim() };
      return isEdit ? updateTicket(id!, input) : createTicket(userId!, input);
    },
    onSuccess: ticket => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      if (!isEdit) notify('Chamado aberto', `Protocolo ${ticket.protocol}. A Ani vai acompanhar e te avisar das atualizações.`);
      router.back();
    },
    onError: () => notify('Erro', 'Não foi possível salvar o chamado. Tente novamente.'),
  });

  return (
    <KeyboardAvoidingView style={[formStyles.screen, { paddingTop: insets.top }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader
        title={isEdit ? 'Editar chamado' : 'Abrir chamado'}
        subtitle={isEdit && existing ? existing.protocol : 'Exames, consultas, remédios e transporte'}
      />

      <ScrollView contentContainerStyle={formStyles.content} keyboardShouldPersistTaps="handled">
        <FormCard>
          <FieldLabel>Tipo de pedido</FieldLabel>
          <View style={formStyles.chipRow}>
            {TICKET_TYPES.map(t => (
              <Chip key={t.id} label={t.label} icon={t.icon} selected={type === t.id} onPress={() => setType(t.id)} />
            ))}
          </View>

          <FieldLabel>Para quem</FieldLabel>
          <View style={formStyles.chipRow}>
            {TICKET_CHANNELS.map(c => (
              <Chip key={c.id} label={c.label} selected={channel === c.id} onPress={() => setChannel(c.id)} />
            ))}
          </View>

          <FieldLabel>Título</FieldLabel>
          <TextField value={title} onChangeText={setTitle} placeholder="Ex: Agendar tomografia de controle" />

          <FieldLabel>Detalhes</FieldLabel>
          <TextField
            value={description}
            onChangeText={setDescription}
            placeholder="O que você precisa, quem pediu, prazos..."
            multiline
          />
        </FormCard>

        <View style={styles.tip}>
          <MaterialIcons name="auto-awesome" size={16} color={BRAND.SECONDARY.DEFAULT} />
          <Text style={styles.tipText}>
            Pelo SUS, a Lei 12.732/2012 garante o início do tratamento em até 60 dias. A Ani acompanha o prazo e te avisa se atrasar.
          </Text>
        </View>

        <PrimaryButton
          title={isEdit ? 'Salvar alterações' : 'Abrir chamado'}
          icon={isEdit ? 'check' : 'send'}
          onPress={() => saveMutation.mutate()}
          disabled={!title.trim()}
          loading={saveMutation.isPending}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tip: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,154,92,0.3)',
    backgroundColor: 'rgba(255,154,92,0.08)',
  },
  tipText: {
    flex: 1,
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    lineHeight: 16.5,
    color: BRAND.PRIMARY.DEFAULT,
  },
});
