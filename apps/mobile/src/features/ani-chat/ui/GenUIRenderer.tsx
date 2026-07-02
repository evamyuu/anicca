/**
 * @fileoverview GenUI card renderer — renders interactive cards from Ani responses.
 *
 * Supports button groups, CTCAE grade displays, document previews, and timeline cards.
 * These cards are embedded directly in the chat conversation, making the app feel
 * interactive and intelligent without requiring the user to navigate to other screens.
 *
 * @module features/ani-chat/ui/GenUIRenderer
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';

/** A single button in a GenUI button group. */
export interface GenUIButton {
  id: string;
  text: string;
}

/** A single GenUI card payload from the Ani response. */
export interface GenUICard {
  type: 'button_group' | 'ctcae_grade' | 'document_preview' | 'timeline' | string;
  text?: string;
  buttons?: GenUIButton[];
  data?: Record<string, unknown>;
}

/** Props for {@link GenUIRenderer}. */
export interface GenUIRendererProps {
  /** The list of GenUI cards to render. */
  cards: GenUICard[];
  /** Called when the user taps a button. The id is sent as the next user message. */
  onButtonPress?: (button: GenUIButton) => void;
}

/**
 * Renders a list of GenUI cards from an Ani response.
 *
 * Each card type has a dedicated visual treatment:
 * - `button_group`: Tappable action buttons that send the button text as a message
 * - `ctcae_grade`: Color-coded severity badge with grade number and label
 * - `document_preview`: Document card with type badge and summary
 * - `timeline`: Lei dos 60 dias countdown
 *
 * @param props - See {@link GenUIRendererProps}.
 * @returns The rendered GenUI card list, or null if empty.
 */
export function GenUIRenderer({ cards, onButtonPress }: GenUIRendererProps) {
  if (!cards || cards.length === 0) return null;

  return (
    <View style={styles.container}>
      {cards.map((card, index) => (
        <CardRenderer key={`${card.type}-${index}`} card={card} onButtonPress={onButtonPress} />
      ))}
    </View>
  );
}

function CardRenderer({
  card,
  onButtonPress,
}: {
  card: GenUICard;
  onButtonPress?: (button: GenUIButton) => void;
}) {
  switch (card.type) {
    case 'button_group':
      return <ButtonGroupCard card={card} onButtonPress={onButtonPress} />;
    case 'ctcae_grade':
      return <CtcaeGradeCard card={card} />;
    case 'document_preview':
      return <DocumentPreviewCard card={card} />;
    case 'timeline':
      return <TimelineCard card={card} />;
    default:
      return null;
  }
}

function ButtonGroupCard({
  card,
  onButtonPress,
}: {
  card: GenUICard;
  onButtonPress?: (button: GenUIButton) => void;
}) {
  if (!card.buttons || card.buttons.length === 0) return null;

  return (
    <View style={styles.buttonGroupCard}>
      {card.text && (
        <Text style={styles.cardSubtext}>{card.text}</Text>
      )}
      <View style={styles.buttonRow}>
        {card.buttons.map((button) => (
          <TouchableOpacity
            key={button.id}
            style={styles.actionButton}
            onPress={() => onButtonPress?.(button)}
            accessibilityRole="button"
            accessibilityLabel={button.text}
          >
            <Text style={styles.actionButtonText}>{button.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const CTCAE_COLORS = ['#22c55e', '#eab308', '#f97316', '#ef4444', '#7f1d1d'];
const CTCAE_LABELS = ['Ausente', 'Leve', 'Moderado', 'Grave', 'Risco de Vida'];

function CtcaeGradeCard({ card }: { card: GenUICard }) {
  const grade = (card.data?.grade as number) ?? 0;
  const symptom = (card.data?.symptom as string) ?? '';
  const color = CTCAE_COLORS[Math.min(grade, 4)];
  const label = CTCAE_LABELS[Math.min(grade, 4)];

  return (
    <View style={[styles.ctcaeCard, { borderColor: color }]}>
      <View style={[styles.ctcaeBadge, { backgroundColor: color }]}>
        <Text style={styles.ctcaeBadgeText}>G{grade}</Text>
      </View>
      <View style={styles.ctcaeContent}>
        <Text style={styles.ctcaeSeverity}>{label}</Text>
        {symptom ? (
          <Text style={styles.ctcaeSymptom}>{symptom}</Text>
        ) : null}
      </View>
    </View>
  );
}

function DocumentPreviewCard({ card }: { card: GenUICard }) {
  const docType = (card.data?.document_type as string) ?? 'Documento';
  const summary = (card.data?.summary as string) ?? card.text ?? '';

  return (
    <View style={styles.documentCard}>
      <View style={styles.documentHeader}>
        <Text style={styles.documentIcon}>📄</Text>
        <View style={styles.documentTypeBadge}>
          <Text style={styles.documentTypeBadgeText}>{docType.replace(/_/g, ' ')}</Text>
        </View>
      </View>
      {summary ? (
        <Text style={styles.documentSummary} numberOfLines={3}>
          {summary}
        </Text>
      ) : null}
    </View>
  );
}

function TimelineCard({ card }: { card: GenUICard }) {
  const daysLeft = (card.data?.days_left as number) ?? 0;
  const totalDays = 60;
  const progress = Math.max(0, Math.min(1, (totalDays - daysLeft) / totalDays));
  const color = daysLeft > 20 ? '#22c55e' : daysLeft > 7 ? '#eab308' : '#ef4444';

  return (
    <View style={styles.timelineCard}>
      <Text style={styles.timelineTitle}>⏱ Lei dos 60 Dias</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.timelineCountdown, { color }]}>
        {daysLeft > 0 ? `${daysLeft} dias restantes` : 'Prazo esgotado'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    gap: 8,
  },
  buttonGroupCard: {
    backgroundColor: '#1E1433',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2d2540',
  },
  cardSubtext: {
    color: '#ada5bc',
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexShrink: 1,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
  },
  ctcaeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1433',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    gap: 12,
  },
  ctcaeBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctcaeBadgeText: {
    color: '#fff',
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
  },
  ctcaeContent: {
    flex: 1,
  },
  ctcaeSeverity: {
    color: '#fff',
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
  },
  ctcaeSymptom: {
    color: '#ada5bc',
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    marginTop: 2,
  },
  documentCard: {
    backgroundColor: '#1E1433',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2d2540',
    gap: 8,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  documentIcon: {
    fontSize: 20,
  },
  documentTypeBadge: {
    backgroundColor: '#2d2540',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  documentTypeBadgeText: {
    color: '#a78bfa',
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    textTransform: 'capitalize',
  },
  documentSummary: {
    color: '#ada5bc',
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  timelineCard: {
    backgroundColor: '#1E1433',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2d2540',
    gap: 8,
  },
  timelineTitle: {
    color: '#fff',
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#2d2540',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  timelineCountdown: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    textAlign: 'right',
  },
});
