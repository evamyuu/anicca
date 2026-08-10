/**
 * @fileoverview Implementation of AniMessage.
 *
 * @module shared/ui/Onboarding/AniMessagex
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

interface AniMessageProps {
  children: string;
}

import AniAvatar from '../../../../assets/images/ani-geral/ani-profile-icon.svg';

export function AniMessage({ children }: AniMessageProps) {
  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <AniAvatar width={38} height={38} />
      </View>
      <View style={styles.messageBubble}>
        <Text style={styles.messageText}>{children}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 18,
    marginHorizontal: 22,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#403229',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  messageBubble: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    borderBottomLeftRadius: 14,
    borderTopLeftRadius: 4,
    paddingVertical: 11,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#403229',
    fontFamily: 'Nunito_600SemiBold',
  },
});
