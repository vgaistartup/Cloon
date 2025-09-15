import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '@/components/Screen';
import CloonHeader, { HeaderIcon } from '@/components/CloonHeader';
import { Colors, Typography, Spacing, Layout, BorderRadius, Shadows } from '@/constants/theme';
import { AuthService } from '@/services/auth';

export default function SettingsScreen() {
  const router = useRouter();

  const rows: { label: string; onPress: () => void }[] = [
    { label: 'Account', onPress: () => Alert.alert('Account', 'Account settings coming soon') },
    { label: 'Privacy', onPress: () => Alert.alert('Privacy', 'Privacy settings coming soon') },
    { label: 'Notifications', onPress: () => Alert.alert('Notifications', 'Notification settings coming soon') },
    { label: 'Theme', onPress: () => Alert.alert('Theme', 'Theme options coming soon') },
    { label: 'About', onPress: () => Alert.alert('About', 'About Cloon coming soon') },
  ];

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AuthService.logout();
          router.replace('/auth');
        },
      },
    ]);
  };

  return (
    <Screen style={styles.container}>
      <CloonHeader
        theme="light"
        left={<HeaderIcon name="chevron-back" accessibilityLabel="Back" onPress={() => router.back()} />}
        center={<Text style={styles.title}>Settings</Text>}
        right={<View style={{ width: 60 }} />}
      />

      <View style={styles.list}>
        {rows.map((row) => (
          <TouchableOpacity key={row.label} style={styles.row} onPress={row.onPress}>
            <Text style={styles.rowText}>{row.label}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={[styles.row, styles.logoutRow]} onPress={handleLogout}>
          <Text style={[styles.rowText, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  list: {
    marginTop: Spacing.lg,
    paddingHorizontal: Layout.sectionMargin,
    gap: Spacing.md,
  },
  row: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  rowText: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.body,
  },
  logoutRow: {
    marginTop: Spacing.xl,
    backgroundColor: 'rgba(255,0,0,0.04)',
    borderColor: 'rgba(255,0,0,0.15)',
  },
  logoutText: {
    color: '#c0362c',
    fontWeight: '600',
  },
});
