/**
 * @fileoverview Form building blocks in the warm Hub style (Figma "Next" kit):
 * cards, chips, text fields, primary/secondary buttons and empty states.
 *
 * @module shared/ui/FormKit
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { BRAND } from '@/shared/constants/brand-colors.const';

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

const W = BRAND.WARM;

export function FormCard({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function TextField(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={W.TAUPE}
      {...props}
      style={[styles.input, props.multiline && styles.inputMultiline, props.style]}
    />
  );
}

export function Chip({
  label,
  selected,
  onPress,
  icon,
  color,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: MaterialIconName;
  /** Fill used when selected (defaults to brand brown). */
  color?: string;
}) {
  const fill = color ?? BRAND.PRIMARY.DEFAULT;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.chip, selected && { backgroundColor: fill, borderColor: fill }]}
    >
      {icon && <MaterialIcons name={icon} size={14} color={selected ? BRAND.SURFACE.CARD : W.TEXT_MUTED} />}
      <Text style={[styles.chipText, selected && { color: BRAND.SURFACE.CARD }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function PrimaryButton({
  title,
  onPress,
  disabled,
  loading,
  icon,
  style,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: MaterialIconName;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[styles.primary, (disabled || loading) && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator color={BRAND.SURFACE.CARD} size="small" />
      ) : (
        <>
          {icon && <MaterialIcons name={icon} size={18} color={BRAND.SURFACE.CARD} />}
          <Text style={styles.primaryText}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

export function SecondaryButton({
  title,
  onPress,
  icon,
  tone = 'neutral',
  disabled,
  style,
}: {
  title: string;
  onPress: () => void;
  icon?: MaterialIconName;
  tone?: 'neutral' | 'danger';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const color = tone === 'danger' ? W.DANGER : BRAND.PRIMARY.DEFAULT;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[styles.secondary, tone === 'danger' && styles.secondaryDanger, disabled && styles.disabled, style]}
    >
      {icon && <MaterialIcons name={icon} size={17} color={color} />}
      <Text style={[styles.secondaryText, { color }]}>{title}</Text>
    </TouchableOpacity>
  );
}

export function EmptyState({ icon, title, subtitle }: { icon: MaterialIconName; title: string; subtitle?: string }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <MaterialIcons name={icon} size={26} color={W.TAUPE} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={styles.emptySubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

/** Small rounded status / category tag. */
export function Pill({ label, color, background }: { label: string; color: string; background: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: background }]}>
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </View>
  );
}

export const formStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: W.BG,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 48,
    gap: 16,
  },
  sectionTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    lineHeight: 21,
    color: BRAND.PRIMARY.DEFAULT,
  },
  meta: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    lineHeight: 16.5,
    color: W.TEXT_MUTED,
  },
  body: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    lineHeight: 19.5,
    color: BRAND.PRIMARY.DEFAULT,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: BRAND.SURFACE.CARD,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: W.BORDER,
    padding: 16,
    gap: 12,
    shadowColor: BRAND.PRIMARY.DEFAULT,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 3,
  },
  label: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    lineHeight: 18,
    color: W.TEXT_MUTED,
  },
  input: {
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: W.BG,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: BRAND.PRIMARY.DEFAULT,
  },
  inputMultiline: {
    minHeight: 92,
    textAlignVertical: 'top',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: W.BORDER,
    backgroundColor: W.BG,
  },
  chipText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: W.TEXT_MUTED,
  },
  primary: {
    height: 46,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: BRAND.SECONDARY.DEFAULT,
    shadowColor: BRAND.SECONDARY.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
  primaryText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: BRAND.SURFACE.CARD,
  },
  secondary: {
    height: 44,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: W.BORDER,
    backgroundColor: BRAND.SURFACE.CARD,
  },
  secondaryDanger: {
    borderColor: 'rgba(204,0,0,0.25)',
    backgroundColor: 'rgba(251,44,54,0.06)',
  },
  secondaryText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
  },
  disabled: {
    opacity: 0.55,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 6,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: W.BG,
    marginBottom: 6,
  },
  emptyTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: BRAND.PRIMARY.DEFAULT,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    lineHeight: 18,
    color: W.TEXT_MUTED,
    textAlign: 'center',
    maxWidth: 260,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  pillText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 10,
    lineHeight: 15,
  },
});
