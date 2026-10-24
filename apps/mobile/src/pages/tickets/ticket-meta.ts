/**
 * @fileoverview Labels, icons and colors for ticket types, channels and statuses.
 *
 * @module pages/tickets/ticket-meta
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import type { MaterialIcons } from '@expo/vector-icons';
import type React from 'react';

import { BRAND } from '@/shared/constants/brand-colors.const';
import type { TicketChannel, TicketStatus, TicketType } from '@/shared/api/tickets';

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

export const TICKET_TYPES: { id: TicketType; label: string; icon: MaterialIconName }[] = [
  { id: 'exame',       label: 'Exame',       icon: 'science' },
  { id: 'consulta',    label: 'Consulta',    icon: 'event' },
  { id: 'medicamento', label: 'Medicamento', icon: 'medication' },
  { id: 'transporte',  label: 'Transporte',  icon: 'directions-bus' },
  { id: 'direitos',    label: 'Direitos',    icon: 'gavel' },
  { id: 'outro',       label: 'Outro',       icon: 'help-outline' },
];

export const TICKET_CHANNELS: { id: TicketChannel; label: string }[] = [
  { id: 'sus',       label: 'SUS · Regulação' },
  { id: 'convenio',  label: 'Convênio' },
  { id: 'hospital',  label: 'Hospital' },
  { id: 'ouvidoria', label: 'Ouvidoria' },
];

export const TICKET_STATUS: Record<TicketStatus, { label: string; color: string; background: string }> = {
  aberto:       { label: 'Aberto',       color: BRAND.SECONDARY[700], background: 'rgba(255,154,92,0.18)' },
  em_andamento: { label: 'Em andamento', color: BRAND.AUX.BLUE,       background: 'rgba(37,92,153,0.12)' },
  resolvido:    { label: 'Resolvido',    color: '#357249',            background: 'rgba(77,161,103,0.14)' },
};

export const typeMeta = (type: TicketType) => TICKET_TYPES.find(t => t.id === type) ?? TICKET_TYPES[TICKET_TYPES.length - 1]!;
export const channelLabel = (channel: TicketChannel) => TICKET_CHANNELS.find(c => c.id === channel)?.label ?? channel;
