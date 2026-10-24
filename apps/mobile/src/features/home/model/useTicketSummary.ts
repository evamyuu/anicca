/**
 * @fileoverview "1 aberto • 2 res." subtitle for the Chamados tile on the Hub.
 *
 * @module features/home/model/useTicketSummary
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import { useQuery } from '@tanstack/react-query';

import { listTickets } from '@/shared/api/tickets';
import { DEMO_TICKETS } from '@/shared/mocks/demo-data';

export function useTicketSummary(userId: string | null): string {
  const { data } = useQuery({
    queryKey: ['tickets', userId],
    queryFn: () => listTickets(userId!),
    enabled: !!userId,
  });

  const open = data ? data.filter(t => t.status !== 'resolvido').length : DEMO_TICKETS.open;
  const resolved = data ? data.length - open : DEMO_TICKETS.resolved;
  return `${open} ${open === 1 ? 'aberto' : 'abertos'} • ${resolved} res.`;
}
