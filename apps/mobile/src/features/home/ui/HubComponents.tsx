/**
 * @fileoverview Building blocks shared by the patient and caregiver Hub screens
 * (header, tiles, appointment card, scan banner and the Ani command center).
 *
 * @module features/home/ui/HubComponents
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { BRAND } from '@/shared/constants/brand-colors.const';

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

const W = BRAND.WARM;

/* ─── HEADER ─── */

interface HubHeaderProps {
  name: string;
  badge: string;
  badgeIcon: MaterialIconName;
  avatar?: ImageSourcePropType;
  initials?: string;
  searchPlaceholder: string;
  progress?: { ratio: number; label: string };
  onAvatarPress?: () => void;
  onSearchPress: () => void;
}

export function HubHeader({
  name,
  badge,
  badgeIcon,
  avatar,
  initials,
  searchPlaceholder,
  progress,
  onAvatarPress,
  onSearchPress,
}: HubHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={[BRAND.PRIMARY.DEFAULT, W.TEXT_MUTED]}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={[styles.header, { paddingTop: insets.top + 12 }]}
    >
      <View style={styles.profileRow}>
        <TouchableOpacity style={styles.avatarRing} activeOpacity={0.8} onPress={onAvatarPress}>
          <View style={styles.avatarClip}>
            {avatar ? (
              <Image source={avatar} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarInitials}>
                <Text style={styles.avatarInitialsText}>{initials}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>Olá,</Text>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.badge}>
            <MaterialIcons name={badgeIcon} size={12} color={W.TAN} />
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.search} activeOpacity={0.85} onPress={onSearchPress}>
        <MaterialIcons name="auto-awesome" size={16} color={BRAND.SECONDARY.DEFAULT} />
        <Text style={styles.searchText} numberOfLines={1}>{searchPlaceholder}</Text>
        <View style={styles.searchButton}>
          <MaterialIcons name="search" size={14} color={BRAND.SURFACE.CARD} />
        </View>
      </TouchableOpacity>

      {progress && (
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round(progress.ratio * 100)}%` }]} />
          </View>
          <Text style={styles.progressLabel}>{progress.label}</Text>
        </View>
      )}
    </LinearGradient>
  );
}

/* ─── CARDS ─── */

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function IconBox({
  name,
  color,
  background,
  size = 32,
  iconSize = 18,
  radius = 14,
}: {
  name: MaterialIconName;
  color: string;
  background: string;
  size?: number;
  iconSize?: number;
  radius?: number;
}) {
  return (
    <View style={{ width: size, height: size, borderRadius: radius, backgroundColor: background, alignItems: 'center', justifyContent: 'center' }}>
      <MaterialIcons name={name} size={iconSize} color={color} />
    </View>
  );
}

type TileVariant = 'white' | 'orange' | 'brown' | 'blue' | 'purple';

const TILE_GRADIENTS: Record<Exclude<TileVariant, 'white'>, readonly [string, string]> = {
  orange: [W.TAN, BRAND.SECONDARY.DEFAULT],
  brown: [BRAND.PRIMARY.DEFAULT, W.TEXT_MUTED],
  blue: [BRAND.AUX.BLUE, '#6595CB'],
  purple: [BRAND.AUX.PURPLE, '#ABA1CD'],
};

const TILE_SHADOWS: Record<TileVariant, string> = {
  white: BRAND.PRIMARY.DEFAULT,
  orange: BRAND.SECONDARY.DEFAULT,
  brown: BRAND.PRIMARY.DEFAULT,
  blue: '#5CB0FF',
  purple: BRAND.PRIMARY.DEFAULT,
};

interface ActionTileProps {
  variant: TileVariant;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  subtitleColor?: string;
  progress?: number;
  height: number;
  onPress?: () => void;
}

export function ActionTile({ variant, icon, title, subtitle, subtitleColor, progress, height, onPress }: ActionTileProps) {
  const isWhite = variant === 'white';
  const content = (
    <>
      {icon}
      <View style={{ marginTop: 8 }}>
        <Text style={[styles.tileTitle, !isWhite && { color: BRAND.SURFACE.CARD }]}>{title}</Text>
        <Text style={[styles.tileSubtitle, !isWhite && { color: 'rgba(255,255,255,0.8)' }, subtitleColor ? { color: subtitleColor } : null]}>
          {subtitle}
        </Text>
      </View>
      {progress !== undefined && (
        <View style={styles.tileTrack}>
          <View style={[styles.tileFill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>
      )}
    </>
  );

  const shadow = {
    shadowColor: TILE_SHADOWS[variant],
    shadowOffset: { width: 0, height: isWhite ? 12 : 8 },
    shadowOpacity: isWhite ? 0.08 : 0.3,
    shadowRadius: isWhite ? 15 : 12,
    elevation: 3,
  };

  return (
    <TouchableOpacity activeOpacity={0.88} onPress={onPress} style={[styles.tileOuter, { height }, shadow]}>
      {isWhite ? (
        <View style={[styles.tileInner, styles.tileWhite]}>{content}</View>
      ) : (
        <LinearGradient
          colors={TILE_GRADIENTS[variant]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={styles.tileInner}
        >
          {content}
        </LinearGradient>
      )}
    </TouchableOpacity>
  );
}

export function AppointmentCard({ title, when, doctor, onPress }: { title: string; when: string; doctor: string; onPress?: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.88} onPress={onPress} style={[styles.card, styles.rowBetween]}>
      <View style={[styles.row, { gap: 12, flex: 1 }]}>
        <IconBox name="calendar-month" color={BRAND.PRIMARY.DEFAULT} background={W.BG} size={48} iconSize={22} radius={16} />
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.appointmentWhen}>{when}</Text>
          <Text style={styles.cardMeta}>{doctor}</Text>
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={20} color={W.TAUPE} />
    </TouchableOpacity>
  );
}

export function ScanBanner({ title, subtitle, onPress }: { title: string; subtitle: string; onPress?: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.scanShadow}>
      <LinearGradient colors={[W.TAN, BRAND.SECONDARY.DEFAULT]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.3 }} style={styles.scanBanner}>
        <View style={styles.scanIcon}>
          <MaterialIcons name="document-scanner" size={20} color={BRAND.SURFACE.CARD} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.scanTitle}>{title}</Text>
          <Text style={styles.scanSubtitle}>{subtitle}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={20} color={BRAND.SURFACE.CARD} />
      </LinearGradient>
    </TouchableOpacity>
  );
}

/* ─── ANI COMMAND CENTER ─── */

export function AniCommandModal({
  visible,
  title,
  placeholder,
  onClose,
}: {
  visible: boolean;
  title: string;
  placeholder: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [input, setInput] = useState('');

  const close = () => {
    setInput('');
    onClose();
  };

  const submit = () => {
    if (!input.trim()) return;
    router.push({ pathname: '/(tabs)/chat', params: { initialQuery: input } });
    close();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={close}>
      <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.modalContent}>
          <View style={[styles.rowBetween, { marginBottom: 20 }]}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={close} style={{ padding: 4 }}>
              <MaterialIcons name="close" size={20} color={W.TEXT_MUTED} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalInputRow}>
            <MaterialIcons name="auto-awesome" size={18} color={BRAND.SECONDARY.DEFAULT} />
            <TextInput
              style={styles.modalInput}
              placeholder={placeholder}
              placeholderTextColor={W.TAUPE}
              autoFocus
              value={input}
              onChangeText={setInput}
              onSubmitEditing={submit}
            />
            <TouchableOpacity onPress={submit}>
              <MaterialIcons name="send" size={18} color={W.TEXT_MUTED} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* ─── STYLES ─── */

export const hubStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: W.BG,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
    gap: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
});

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    gap: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    padding: 2,
  },
  avatarClip: {
    flex: 1,
    borderRadius: 22,
    overflow: 'hidden',
  },
  avatarImage: {
    position: 'absolute',
    width: 85,
    height: 109,
    left: -20,
    top: -11,
  },
  avatarInitials: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: W.TAN,
  },
  avatarInitialsText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 15,
    color: BRAND.SURFACE.CARD,
  },
  greeting: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    lineHeight: 16.5,
    letterSpacing: 0.275,
    textTransform: 'uppercase',
    color: W.TAN,
    opacity: 0.6,
  },
  name: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 18,
    lineHeight: 22.5,
    color: BRAND.SURFACE.CARD,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: 3,
    height: 19,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(217,158,121,0.25)',
  },
  badgeText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 10,
    color: W.TAN,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 40,
    paddingLeft: 17,
    paddingRight: 6,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  searchText: {
    flex: 1,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  searchButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: BRAND.SECONDARY.DEFAULT,
  },
  progressLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: BRAND.SECONDARY.DEFAULT,
  },

  card: {
    backgroundColor: BRAND.SURFACE.CARD,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: W.BORDER,
    padding: 17,
    shadowColor: BRAND.PRIMARY.DEFAULT,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 3,
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
  cardTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    lineHeight: 19.5,
    color: BRAND.PRIMARY.DEFAULT,
  },
  cardMeta: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    lineHeight: 16.5,
    color: W.TEXT_MUTED,
  },
  appointmentWhen: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    lineHeight: 18,
    color: W.TEXT_MUTED,
  },

  tileOuter: {
    width: '48.2%',
    borderRadius: 22,
  },
  tileInner: {
    flex: 1,
    borderRadius: 22,
    padding: 16,
    justifyContent: 'space-between',
  },
  tileWhite: {
    backgroundColor: BRAND.SURFACE.CARD,
    borderWidth: 1,
    borderColor: W.BORDER,
  },
  tileTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    lineHeight: 16.25,
    color: BRAND.PRIMARY.DEFAULT,
  },
  tileSubtitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    lineHeight: 16.5,
    marginTop: 2,
    color: W.TEXT_MUTED,
  },
  tileTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: W.BG,
    overflow: 'hidden',
  },
  tileFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: W.TAN,
  },

  scanShadow: {
    borderRadius: 22,
    shadowColor: BRAND.SECONDARY.DEFAULT,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
  },
  scanBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 22,
  },
  scanIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  scanTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    lineHeight: 21,
    color: BRAND.SURFACE.CARD,
  },
  scanSubtitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    lineHeight: 15,
    color: 'rgba(255,255,255,0.82)',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(64, 50, 41, 0.92)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalContent: {
    backgroundColor: W.BG,
    borderRadius: 28,
    padding: 22,
  },
  modalTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: BRAND.PRIMARY.DEFAULT,
  },
  modalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: W.BORDER,
    backgroundColor: BRAND.SURFACE.CARD,
  },
  modalInput: {
    flex: 1,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: BRAND.PRIMARY.DEFAULT,
  },
});

export const hubCardStyles = styles;
