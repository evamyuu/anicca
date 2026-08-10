/**
 * @fileoverview Implementation of ToggleRow.
 *
 * @module shared/ui/Onboarding/ToggleRowx
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';

interface ToggleRowProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function ToggleRow({
  icon,
  title,
  description,
  value,
  onValueChange,
  disabled
}: ToggleRowProps) {
  const switchAnim = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(switchAnim, {
      toValue: value ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [value, switchAnim]);

  const switchBackgroundColor = switchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E8DDD8', '#FF9A5C'],
  });

  const translateX = switchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2.5, 21.5],
  });

  return (
    <View style={[styles.container, disabled && styles.containerDisabled]}>
      <View style={styles.iconContainer}>{icon}</View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Pressable
        onPress={() => !disabled && onValueChange(!value)}
        style={styles.switchContainer}
      >
        <Animated.View style={[styles.switchTrack, { backgroundColor: switchBackgroundColor }]}>
          <Animated.View style={[styles.switchThumb, { transform: [{ translateX }] }]} />
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 11,
  },
  containerDisabled: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F0E9E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: '#403229',
  },
  description: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: '#9C8880',
    marginTop: 3,
    lineHeight: 16,
  },
  switchContainer: {
    padding: 4,
  },
  switchTrack: {
    width: 44,
    height: 25,
    borderRadius: 20,
    justifyContent: 'center',
  },
  switchThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 2,
  },
});

