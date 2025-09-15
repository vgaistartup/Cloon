import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Screen from '@/components/Screen';
import { Typography } from '@/constants/theme';

export default function AboutScreen() {
  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>About Cloon</Text>
      <Text style={styles.body}>Fashion. Fit. Future.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: Typography.fontSize.h1, fontWeight: Typography.fontWeight.semibold, marginBottom: 8 },
  body: { fontSize: Typography.fontSize.body },
});
