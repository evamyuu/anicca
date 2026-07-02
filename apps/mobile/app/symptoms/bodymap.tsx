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

const CTCAE_GRADES = [
  { label: 'Sem dor', color: '#3b82f6' }, // Blue
  { label: 'Grau 1', color: '#a3e635' }, // Light green
  { label: 'Grau 2', color: '#fbbf24' }, // Yellow
  { label: 'Grau 3', color: '#f97316' }, // Orange
  { label: 'Grau 4', color: '#ea580c' }, // Dark Orange
  { label: 'Grau 4+', color: '#ef4444' }, // Red
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
            <ChevronLeft size={24} color="#3d2b1f" />
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

        {/* Bottom Actions (Floating) */}
        <View style={styles.bottomNavContainer}>
           <Text style={styles.hubLinkText}>Voltar para o Hub</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fbf9f6',
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
    color: '#3d2b1f',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#8c8078',
    marginTop: 2,
  },
  topToggle: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
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
    backgroundColor: '#4a3931',
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#a3988e',
  },
  toggleBtnTextActiveDark: {
    color: '#ffffff',
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  filterGroup: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 4,
    borderWidth: 1,
    borderColor: '#e5e0dc',
    width: '48%',
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
  },
  filterBtnActive: {
    backgroundColor: '#efe9e4',
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#a3988e',
  },
  filterBtnTextActive: {
    color: '#4a3931',
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
    fontSize: 9,
    fontWeight: 'bold',
    color: '#8c8078',
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 32,
    minHeight: 450,
    shadowColor: '#000',
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
    borderColor: '#efe9e4',
    borderStyle: 'dashed',
    borderRadius: 24,
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#a3988e',
    marginBottom: 8,
  },
  placeholderSub: {
    fontSize: 12,
    color: '#bdae9f',
    textAlign: 'center',
  },
  bottomNavContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  hubLinkText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f28b50',
  }
});
