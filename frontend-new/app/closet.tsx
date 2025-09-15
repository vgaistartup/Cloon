import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Screen from '@/components/Screen';
import { Typography } from '@/constants/theme';

export default function ClosetScreen() {
  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>Closet</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.fontSize.h1,
  },
});
