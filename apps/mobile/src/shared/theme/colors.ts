import { BRAND } from '@/shared/constants/brand-colors.const';
/**
 * @fileoverview Theme color definitions for Anicca.
 */

export interface ThemeColors {
  background: string;
  card: string;
  text: string;
  textMuted: string;
  primary: string;
  border: string;
  danger: string;
  dangerBg: string;
  iconBg: string;
}

export const lightColors: ThemeColors = {
  background: BRAND.PRIMARY[50],
  card: BRAND.SURFACE.CARD,
  text: BRAND.PRIMARY.DEFAULT,
  textMuted: BRAND.PRIMARY[400],
  primary: BRAND.SECONDARY.DEFAULT,
  border: BRAND.PRIMARY[100],
  danger: BRAND.ERROR.DEFAULT,
  dangerBg: 'rgba(239, 68, 68, 0.1)',
  iconBg: BRAND.PRIMARY[100],
};

export const darkColors: ThemeColors = {
  background: BRAND.PRIMARY[900],
  card: BRAND.BG.DARK,
  text: BRAND.BG.LIGHT,
  textMuted: BRAND.PRIMARY[400],
  primary: BRAND.SECONDARY.DEFAULT,
  border: BRAND.SURFACE.CARD_DARK,
  danger: BRAND.ERROR.DEFAULT,
  dangerBg: 'rgba(239, 68, 68, 0.2)',
  iconBg: BRAND.SURFACE.CARD_DARK,
};