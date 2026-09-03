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
import { BRAND } from '@/shared/constants/brand-colors.const';
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
    case 'ask_user_form':
      return <AskUserFormCard card={card} onButtonPress={onButtonPress} />;
    default:
      return null;
  }
}

function AskUserFormCard({
  card,
  onButtonPress,
}: {
  card: GenUICard;
  onButtonPress?: (button: GenUIButton) => void;
}) {
  return (
    <View style={styles.askUserCard}>
      <Text style={styles.askUserTitle}>{card.text ?? 'Por favor, responda:'}</Text>
      {card.buttons && card.buttons.length > 0 && (
        <View style={styles.askUserButtons}>
          {card.buttons.map(btn => (
            <TouchableOpacity
              key={btn.id}
              style={styles.askUserBtn}
              onPress={() => onButtonPress?.(btn)}
            >
              <Text style={styles.askUserBtnText}>{btn.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
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

const CTCAE_COLORS = [BRAND.AUX.GREEN, BRAND.SECONDARY[600], BRAND.SECONDARY[600], BRAND.ERROR.VIVID, BRAND.ERROR.DARK];
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
  const color = daysLeft > 20 ? BRAND.AUX.GREEN : daysLeft > 7 ? BRAND.SECONDARY.DEFAULT : BRAND.ERROR.VIVID;

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
    backgroundColor: BRAND.SURFACE.CARD_DARK,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: BRAND.SURFACE.BORDER_DARK,
  },
  askUserCard: {
    backgroundColor: BRAND.SURFACE.CARD_DARK,
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: BRAND.AUX.PURPLE,
  },
  askUserTitle: {
    color: BRAND.SURFACE.CARD,
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 12,
  },
  askUserButtons: {
    gap: 8,
  },
  askUserBtn: {
    backgroundColor: BRAND.PRIMARY[700],
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  askUserBtnText: {
    color: BRAND.SURFACE.CARD,
    fontFamily: 'Nunito_700Bold',
  },
  cardSubtext: {
    color: BRAND.PRIMARY[400],
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
    backgroundColor: BRAND.PRIMARY[700],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexShrink: 1,
  },
  actionButtonText: {
    color: BRAND.SURFACE.CARD,
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
  },
  ctcaeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND.SURFACE.CARD_DARK,
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
    color: BRAND.SURFACE.CARD,
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
  },
  ctcaeContent: {
    flex: 1,
  },
  ctcaeSeverity: {
    color: BRAND.SURFACE.CARD,
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
  },
  ctcaeSymptom: {
    color: BRAND.PRIMARY[400],
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    marginTop: 2,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND.SURFACE.CARD_DARK,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: BRAND.SURFACE.BORDER_DARK,
  },
  documentHeader: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: BRAND.SURFACE.BORDER_DARK,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  documentIcon: {
    fontSize: 24,
  },
  documentTypeBadge: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: BRAND.AUX.PURPLE,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  documentTypeBadgeText: {
    color: BRAND.SURFACE.CARD,
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
    textTransform: 'uppercase',
  },
  documentSummary: {
    flex: 1,
    color: BRAND.PRIMARY[400],
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    lineHeight: 20,
  },
  timelineCard: {
    backgroundColor: BRAND.SURFACE.CARD_DARK,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: BRAND.SURFACE.BORDER_DARK,
  },
  timelineTitle: {
    color: BRAND.SURFACE.CARD,
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: BRAND.SURFACE.BORDER_DARK,
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