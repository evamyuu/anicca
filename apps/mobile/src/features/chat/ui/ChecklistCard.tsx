/**
 * @fileoverview GenUI Checklist Card Component.
 * This is rendered inside the Chat when the LLM triggers a 'Checklist' action.
 *
 * @module features/chat/ui/ChecklistCard
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckSquare, Share2, Check } from 'lucide-react-native';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface ChecklistCardProps {
  title: string;
  items: ChecklistItem[];
}

export function ChecklistCard({ title, items: initialItems }: ChecklistCardProps) {
  const [items, setItems] = useState(initialItems);

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <CheckSquare size={16} color="#f28b50" />
          <Text style={styles.title}>{title}</Text>
        </View>
        <TouchableOpacity>
          <Share2 size={16} color="#8c8078" />
        </TouchableOpacity>
      </View>

      <View style={styles.itemsContainer}>
        {items.map(item => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.itemRow}
            onPress={() => toggleItem(item.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
              {item.completed && <Check size={14} color="#ffffff" />}
            </View>
            <Text style={[styles.itemText, item.completed && styles.itemTextCompleted]}>
              {item.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#efe9e4',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e5e0dc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3d2b1f',
    marginLeft: 8,
  },
  itemsContainer: {
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#a3988e',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#f28b50',
    borderColor: '#f28b50',
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    color: '#3d2b1f',
    lineHeight: 20,
  },
  itemTextCompleted: {
    color: '#8c8078',
  }
});
