import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Screen from '@/components/Screen';
import { Typography } from '@/constants/theme';

export default function SearchScreen() {
  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>Search</Text>
      {/* TODO: full-screen search with recent, categories, voice */}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: Typography.fontSize.h1, fontWeight: Typography.fontWeight.semibold },
});
