/**
 * @fileoverview Bottom Tab Navigator for the Patient App.
 * Matches the Anicca Figma nav bar: dark brown gradient on every tab and a light
 * variant on Body Map, with Material icons (home, forum, pill, article).
 *
 * @module pages/tabs/layout
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BRAND } from '@/shared/constants/brand-colors.const';

const W = BRAND.WARM;

const darkBackground = () => (
  <LinearGradient
    colors={[BRAND.PRIMARY.DEFAULT, W.TEXT_MUTED]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={styles.tabBarBackground}
  />
);

const lightBackground = () => <View style={[styles.tabBarBackground, styles.tabBarLight]} />;

/** Light nav bar used by the Body Map screen. */
const lightTabOptions = {
  tabBarInactiveTintColor: W.TAUPE,
  tabBarBackground: lightBackground,
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: BRAND.SECONDARY.DEFAULT,
        tabBarInactiveTintColor: W.PEACH,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarBackground: darkBackground,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hub',
          tabBarIcon: ({ color }) => <MaterialIcons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Ani',
          tabBarIcon: ({ color }) => <MaterialIcons name="forum" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="routine"
        options={{
          title: 'Rotina',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="pill" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="docs"
        options={{
          title: 'Docs',
          tabBarIcon: ({ color }) => <MaterialIcons name="article" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="body-map"
        options={{
          href: null,
          title: 'Body Map',
          ...lightTabOptions,
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
    borderTopWidth: 0,
    backgroundColor: 'transparent',
    height: Platform.OS === 'ios' ? 92 : 84,
    paddingTop: 9,
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
    shadowColor: BRAND.PRIMARY.DEFAULT,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.06,
    shadowRadius: 15,
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  tabBarLight: {
    backgroundColor: BRAND.SURFACE.CARD,
    borderTopWidth: 1,
    borderColor: W.BG,
  },
  tabBarLabel: {
    fontSize: 10,
    fontFamily: 'Nunito_800ExtraBold',
    letterSpacing: 0.25,
    marginTop: 4,
  },
});
