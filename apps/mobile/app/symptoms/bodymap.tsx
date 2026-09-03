/**
 * @fileoverview Body Map Screen for registering physical symptoms via a visual interface.
 * Implements the Figma 1 design (Palettes, Filters, and Body Canvas placeholder).
 *
 * @module pages/symptoms/bodymap
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { BRAND } from '@/shared/constants/brand-colors.const';

const CTCAE_GRADES = [
  { label: 'Sem dor', color: BRAND.AUX.BLUE }, // Blue
  { label: 'Grau 1', color: BRAND.PRIMARY[400] }, // Light green
  { label: 'Grau 2', color: BRAND.SECONDARY.DEFAULT }, // Yellow
  { label: 'Grau 3', color: BRAND.SECONDARY[600] }, // Orange
  { label: 'Grau 4', color: BRAND.SECONDARY[700] }, // Dark Orange
  { label: 'Grau 4+', color: BRAND.ERROR.DEFAULT }, // Red
];

export default function BodyMapScreen() {
  const router = useRouter();
  const [viewType, setViewType] = useState<'map' | 'history'>('map');
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [side, setSide] = useState<'front' | 'back'>('front');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color={BRAND.PRIMARY.DEFAULT} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Body Map</Text>
            <Text style={styles.headerSubtitle}>Toque na região para registrar um sintoma</Text>
          </View>
          
          {/* Top Toggle (Map vs History) */}
          <View style={styles.topToggle}>
            <TouchableOpacity 
              style={[styles.toggleBtn, viewType === 'map' && styles.toggleBtnActiveDark]}
              onPress={() => setViewType('map')}
            >
              <Text style={[styles.toggleBtnText, viewType === 'map' && styles.toggleBtnTextActiveDark]}>Mapa</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleBtn, viewType === 'history' && styles.toggleBtnActiveDark]}
              onPress={() => setViewType('history')}
            >
              <Text style={[styles.toggleBtnText, viewType === 'history' && styles.toggleBtnTextActiveDark]}>Histórico</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersRow}>
          {/* Gender Toggle */}
          <View style={styles.filterGroup}>
            <TouchableOpacity 
              style={[styles.filterBtn, gender === 'male' && styles.filterBtnActive]}
              onPress={() => setGender('male')}
            >
              <Text style={[styles.filterBtnText, gender === 'male' && styles.filterBtnTextActive]}>Homem</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterBtn, gender === 'female' && styles.filterBtnActive]}
              onPress={() => setGender('female')}
            >
              <Text style={[styles.filterBtnText, gender === 'female' && styles.filterBtnTextActive]}>Mulher</Text>
            </TouchableOpacity>
          </View>

          {/* Side Toggle */}
          <View style={styles.filterGroup}>
            <TouchableOpacity 
              style={[styles.filterBtn, side === 'front' && styles.filterBtnActive]}
              onPress={() => setSide('front')}
            >
              <Text style={[styles.filterBtnText, side === 'front' && styles.filterBtnTextActive]}>Frente</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterBtn, side === 'back' && styles.filterBtnActive]}
              onPress={() => setSide('back')}
            >
              <Text style={[styles.filterBtnText, side === 'back' && styles.filterBtnTextActive]}>Costas</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* CTCAE Palette Legend */}
        <View style={styles.paletteContainer}>
          {CTCAE_GRADES.map((grade, index) => (
            <View key={index} style={styles.paletteItem}>
              <View style={[styles.colorBar, { backgroundColor: grade.color }]} />
              <Text style={styles.paletteLabel}>{grade.label}</Text>
            </View>
          ))}
        </View>

        {/* SVG Canvas Placeholder */}
        <View style={styles.canvasContainer}>
          {/* 
            TODO for Eve: Once you drop the real body SVG into /assets, 
            replace this placeholder View with the react-native-svg component.
            We will attach onPress handlers to the SVG paths to color them.
          */}
          <View style={styles.placeholderBody}>
             <Text style={styles.placeholderText}>🧍‍♀️ Corpinho Aqui (SVG)</Text>
             <Text style={styles.placeholderSub}>As áreas tocadas ficarão laranja/verde dependendo do grau.</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BRAND.BG.LIGHT,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: BRAND.PRIMARY.DEFAULT,
  },
  headerSubtitle: {
    fontSize: 16,
    color: BRAND.PRIMARY[400],
    marginTop: 2,
  },
  topToggle: {
    flexDirection: 'row',
    backgroundColor: BRAND.SURFACE.CARD,
    borderRadius: 20,
    padding: 4,
    shadowColor: BRAND.PRIMARY[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  toggleBtnActiveDark: {
    backgroundColor: BRAND.PRIMARY.DEFAULT,
  },
  toggleBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BRAND.PRIMARY[400],
  },
  toggleBtnTextActiveDark: {
    color: BRAND.SURFACE.CARD,
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  filterGroup: {
    flexDirection: 'row',
    backgroundColor: BRAND.SURFACE.CARD,
    borderRadius: 24,
    padding: 4,
    borderWidth: 1,
    borderColor: BRAND.SURFACE.BORDER,
    width: '48%',
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
  },
  filterBtnActive: {
    backgroundColor: BRAND.PRIMARY[100],
  },
  filterBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BRAND.PRIMARY[400],
  },
  filterBtnTextActive: {
    color: BRAND.PRIMARY.DEFAULT,
  },
  paletteContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  paletteItem: {
    alignItems: 'center',
    flex: 1,
  },
  colorBar: {
    height: 6,
    width: '90%',
    borderRadius: 3,
    marginBottom: 8,
  },
  paletteLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BRAND.PRIMARY[400],
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: BRAND.SURFACE.CARD,
    borderRadius: 32,
    minHeight: 450,
    shadowColor: BRAND.PRIMARY[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 15,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  placeholderBody: {
    alignItems: 'center',
    padding: 32,
    borderWidth: 2,
    borderColor: BRAND.PRIMARY[100],
    borderStyle: 'dashed',
    borderRadius: 24,
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BRAND.PRIMARY[400],
    marginBottom: 8,
  },
  placeholderSub: {
    fontSize: 16,
    color: BRAND.PRIMARY[300],
    textAlign: 'center',
  },
  bottomNavContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  hubLinkText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BRAND.SECONDARY.DEFAULT,
  }
});