/**
 * @fileoverview Configures the main tab navigator for the Anicca patient app.
 *
 * @module app/(tabs)/_layout
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import { Tabs } from 'expo-router';
import { Platform, Text } from 'react-native';

/** @internal Tab bar background color (dark surface). */
const TAB_BAR_BACKGROUND = '#1E1433';

/** @internal Tab bar top border color. */
const TAB_BAR_BORDER = '#2d2540';

/** @internal Active tab icon and label color (primary-500). */
const TAB_ACTIVE_TINT = '#a855f7';

/** @internal Inactive tab icon and label color (neutral-500). */
const TAB_INACTIVE_TINT = '#8f86a0';

/** @internal Tab bar height offset for iOS home indicator. */
const TAB_BAR_HEIGHT_IOS = 84;

/** @internal Tab bar height on Android. */
const TAB_BAR_HEIGHT_ANDROID = 64;

/** @internal Bottom padding on iOS for home indicator clearance. */
const TAB_PADDING_BOTTOM_IOS = 20;

/** @internal Bottom padding on Android. */
const TAB_PADDING_BOTTOM_ANDROID = 8;

/**
 * Props for the {@link TabIcon} internal renderer.
 * @internal
 */
interface TabIconProps {
  /** Icon identifier mapped to an emoji symbol. */
  name: 'hub' | 'ani' | 'routine' | 'docs';
  /** Resolved tint color from the tab bar. */
  color: string;
}

/**
 * Renders a placeholder emoji tab icon.
 *
 * @remarks
 * This component is a temporary placeholder. It will be replaced with
 * react-native-svg icons once the `packages/ui` icon set is implemented.
 *
 * @param props - See {@link TabIconProps}.
 * @returns A `Text` element rendering the emoji icon.
 * @internal
 */
function TabIcon({ name, color }: TabIconProps) {
  const icons: Record<TabIconProps['name'], string> = {
    hub: '🏠',
    ani: '🐱',
    routine: '📋',
    docs: '📄',
  };

  return (
    <Text style={{ fontSize: 20, color, lineHeight: 24 }}>
      {icons[name]}
    </Text>
  );
}

/**
 * Defines the bottom tab navigator with four screens:
 * Hub, Ani (chat), Rotina (routine), and Documentos (documents).
 *
 * @returns The Expo Router `Tabs` navigator element.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: TAB_ACTIVE_TINT,
        tabBarInactiveTintColor: TAB_INACTIVE_TINT,
        tabBarStyle: {
          backgroundColor: TAB_BAR_BACKGROUND,
          borderTopColor: TAB_BAR_BORDER,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? TAB_PADDING_BOTTOM_IOS : TAB_PADDING_BOTTOM_ANDROID,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? TAB_BAR_HEIGHT_IOS : TAB_BAR_HEIGHT_ANDROID,
        },
        tabBarLabelStyle: {
          fontFamily: 'Nunito_600SemiBold',
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="hub"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <TabIcon name="hub" color={color} />,
        }}
      />
      <Tabs.Screen
        name="ani"
        options={{
          title: 'Ani',
          tabBarIcon: ({ color }) => <TabIcon name="ani" color={color} />,
        }}
      />
      <Tabs.Screen
        name="routine"
        options={{
          title: 'Rotina',
          tabBarIcon: ({ color }) => <TabIcon name="routine" color={color} />,
        }}
      />
      <Tabs.Screen
        name="docs"
        options={{
          title: 'Documentos',
          tabBarIcon: ({ color }) => <TabIcon name="docs" color={color} />,
        }}
      />
    </Tabs>
  );
}
