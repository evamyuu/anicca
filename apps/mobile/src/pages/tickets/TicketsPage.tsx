/**
 * @fileoverview Chamados — requests to SUS / convênio / hospital, with status tracking.
 *
 * @module pages/tickets/TicketsPage
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/shared/lib/zustand-persist';
import { listTickets, updateTicket, deleteTicket, type Ticket, type TicketStatus } from '@/shared/api/tickets';
import { BRAND } from '@/shared/constants/brand-colors.const';
import { formatDayMonth } from '@/shared/mocks/demo-data';
import { confirmAction, notify } from '@/shared/lib/notify';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';
import { Chip, EmptyState, Pill, SecondaryButton, formStyles } from '@/shared/ui/FormKit';

import { TICKET_STATUS, typeMeta, channelLabel } from './ticket-meta';

const W = BRAND.WARM;

type Filter = 'abertos' | 'resolvidos' | 'todos';

export function TicketsPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const userId = useAuthStore(s => s.userId);
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>('abertos');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['tickets', userId],
    queryFn: () => listTickets(userId!),
    enabled: !!userId,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['tickets'] });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TicketStatus }) => updateTicket(id, { status }),
    onSuccess: invalidate,
    onError: () => notify('Erro', 'Não foi possível atualizar o chamado.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTicket(id),
    onSuccess: () => {
      setExpandedId(null);
      invalidate();
    },
    onError: () => notify('Erro', 'Não foi possível excluir o chamado.'),
  });

  const handleDelete = async (ticket: Ticket) => {
    if (await confirmAction('Excluir chamado', `Excluir "${ticket.title}"? Esta ação não pode ser desfeita.`, 'Excluir')) {
      deleteMutation.mutate(ticket.id);
    }
  };

  const openCount = tickets.filter(t => t.status !== 'resolvido').length;
  const resolvedCount = tickets.length - openCount;
  const visible = tickets.filter(t =>
    filter === 'todos' ? true : filter === 'abertos' ? t.status !== 'resolvido' : t.status === 'resolvido'
  );

  return (
    <View style={[formStyles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Chamados"
        subtitle="Seus pedidos ao SUS, convênio e hospital"
        right={
          <TouchableOpacity style={styles.newButton} onPress={() => router.push('/tickets/new')}>
            <MaterialIcons name="add" size={16} color={BRAND.SURFACE.CARD} />
            <Text style={styles.newButtonText}>Novo</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={formStyles.content} showsVerticalScrollIndicator={false}>
        <View style={formStyles.chipRow}>
          <Chip label={`Abertos (${openCount})`} selected={filter === 'abertos'} onPress={() => setFilter('abertos')} />
          <Chip label={`Resolvidos (${resolvedCount})`} selected={filter === 'resolvidos'} onPress={() => setFilter('resolvidos')} />
          <Chip label="Todos" selected={filter === 'todos'} onPress={() => setFilter('todos')} />
        </View>

        {isLoading && <ActivityIndicator color={BRAND.SECONDARY.DEFAULT} style={{ marginTop: 24 }} />}

        {!isLoading && visible.length === 0 && (
          <EmptyState
            icon="assignment"
            title={filter === 'resolvidos' ? 'Nenhum chamado resolvido ainda' : 'Nenhum chamado em aberto'}
            subtitle="Abra um chamado para exames, consultas, remédios ou transporte. A Ani acompanha o prazo para você."
          />
        )}

        {visible.map(ticket => {
          const meta = typeMeta(ticket.type);
          const status = TICKET_STATUS[ticket.status];
          const expanded = expandedId === ticket.id;
          return (
            <TouchableOpacity
              key={ticket.id}
              activeOpacity={0.9}
              onPress={() => setExpandedId(expanded ? null : ticket.id)}
              style={styles.card}
            >
              <View style={[formStyles.row, { gap: 12, alignItems: 'flex-start' }]}>
                <View style={styles.typeIcon}>
                  <MaterialIcons name={meta.icon} size={18} color={BRAND.PRIMARY.DEFAULT} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={formStyles.sectionTitle}>{ticket.title}</Text>
                  <Text style={formStyles.meta}>
                    {ticket.protocol} • {channelLabel(ticket.channel)}
                  </Text>
                  <View style={[formStyles.row, { gap: 8, marginTop: 4 }]}>
                    <Pill label={status.label} color={status.color} background={status.background} />
                    <Text style={styles.date}>Atualizado {formatDayMonth(new Date(ticket.updated_at))}</Text>
                  </View>
                </View>
                <MaterialIcons name={expanded ? 'expand-less' : 'expand-more'} size={22} color={W.TAUPE} />
              </View>

              {expanded && (
                <View style={styles.details}>
                  {ticket.description ? <Text style={formStyles.body}>{ticket.description}</Text> : null}
                  <Text style={formStyles.meta}>
                    Aberto em {new Date(ticket.created_at).toLocaleDateString('pt-BR')} • {meta.label}
                  </Text>
                  <View style={styles.actions}>
                    {ticket.status !== 'resolvido' ? (
                      <SecondaryButton
                        title="Resolvido"
                        icon="check-circle-outline"
                        onPress={() => statusMutation.mutate({ id: ticket.id, status: 'resolvido' })}
                        style={{ flex: 1 }}
                      />
                    ) : (
                      <SecondaryButton
                        title="Reabrir"
                        icon="replay"
                        onPress={() => statusMutation.mutate({ id: ticket.id, status: 'aberto' })}
                        style={{ flex: 1 }}
                      />
                    )}
                    {ticket.status === 'aberto' && (
                      <SecondaryButton
                        title="Em andamento"
                        icon="schedule"
                        onPress={() => statusMutation.mutate({ id: ticket.id, status: 'em_andamento' })}
                        style={{ flex: 1 }}
                      />
                    )}
                  </View>
                  <View style={styles.actions}>
                    <SecondaryButton
                      title="Editar"
                      icon="edit"
                      onPress={() => router.push({ pathname: '/tickets/new', params: { id: ticket.id } })}
                      style={{ flex: 1 }}
                    />
                    <SecondaryButton
                      title="Excluir"
                      icon="delete-outline"
                      tone="danger"
                      onPress={() => handleDelete(ticket)}
                      style={{ flex: 1 }}
                    />
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: BRAND.SECONDARY.DEFAULT,
  },
  newButtonText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 12,
    color: BRAND.SURFACE.CARD,
  },
  card: {
    backgroundColor: BRAND.SURFACE.CARD,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: W.BORDER,
    padding: 16,
    shadowColor: BRAND.PRIMARY.DEFAULT,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 3,
  },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: W.BG,
  },
  date: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 10,
    color: W.TAUPE,
  },
  details: {
    marginTop: 14,
    paddingTop: 14,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: W.BORDER,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
});
