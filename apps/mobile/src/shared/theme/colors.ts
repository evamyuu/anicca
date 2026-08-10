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
  background: '#F5EFEB',
  card: '#ffffff',
  text: '#3d2b1f',
  textMuted: '#a3988e',
  primary: '#FF9A5C',
  border: '#efe9e4',
  danger: '#ef4444',
  dangerBg: 'rgba(239, 68, 68, 0.1)',
  iconBg: '#efe9e4',
};

export const darkColors: ThemeColors = {
  background: '#121212',
  card: '#1e1e1e',
  text: '#fbf9f6',
  textMuted: '#8c8078',
  primary: '#FF9A5C',
  border: '#2a2a2a',
  danger: '#ef4444',
  dangerBg: 'rgba(239, 68, 68, 0.2)',
  iconBg: '#2a2a2a',
};