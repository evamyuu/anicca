/**
 * @fileoverview Bottom Tab Navigator for the Patient App.
 * Matches the Anicca design system: rounded bottom navigation, floating active states,
 * and Lucide icons (Home, MessageSquare, Pill, FileText).
 *
 * @module pages/tabs/layout
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Home, MessageSquare, Pill, FileText } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BRAND } from '@/shared/constants/brand-colors.const';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: BRAND.SECONDARY.DEFAULT, // Anicca Orange
        tabBarInactiveTintColor: BRAND.PRIMARY[400], // Soft Gray/Brown
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarBackground: () => (
          <LinearGradient
            colors={[BRAND.PRIMARY.DEFAULT, BRAND.PRIMARY[400]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.tabBarBackground}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hub',
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Ani',
          tabBarIcon: ({ color, size }) => (
            <MessageSquare size={size} color={color} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="routine"
        options={{
          title: 'Rotina',
          tabBarIcon: ({ color, size }) => (
            <Pill size={size} color={color} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="docs"
        options={{
          title: 'Docs',
          tabBarIcon: ({ color, size }) => (
            <FileText size={size} color={color} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="body-map"
        options={{
          href: null,
          title: 'Body Map'
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 0,
    borderTopWidth: 4,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: BRAND.SURFACE.CARD,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    backgroundColor: 'transparent',
    height: Platform.OS === 'ios' ? 90 : 70,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  tabBarLabel: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    marginTop: 4,
  }
});