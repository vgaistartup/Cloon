import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '@/components/Screen';
import Button from '@/components/Button';
import { AuthService } from '@/services/auth';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

export default function DashboardScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AuthService.logout();
            router.replace('/auth');
          },
        },
      ]
    );
  };

  const handleUploadPhotos = () => {
    router.push('/upload');
  };

  const handleGenerateAvatar = async () => {
    try {
      // For demo, we'll just show an alert
      Alert.alert(
        'Generate Avatar',
        'AI avatar generation will start. This is a demo implementation.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to generate avatar');
    }
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Virtual Try-On</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color={Colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome back!</Text>
          <Text style={styles.welcomeSubtitle}>
            Ready to try on some amazing outfits?
          </Text>
        </View>

        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={handleUploadPhotos}>
            <View style={styles.actionIconContainer}>
              <Ionicons 
                name="camera-outline" 
                size={32} 
                color={Colors.primary} 
              />
            </View>
            <Text style={styles.actionTitle}>Upload Photos</Text>
            <Text style={styles.actionSubtitle}>
              Add your photos to get started
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={handleGenerateAvatar}>
            <View style={styles.actionIconContainer}>
              <Ionicons 
                name="person-outline" 
                size={32} 
                color={Colors.secondary} 
              />
            </View>
            <Text style={styles.actionTitle}>Generate Avatar</Text>
            <Text style={styles.actionSubtitle}>
              Create AI-powered avatars
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSection}>
          <Text style={styles.bottomText}>
            🚀 More features coming soon!
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  logoutButton: {
    padding: Spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  welcomeSection: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  welcomeSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  actionsGrid: {
    flex: 1,
    gap: Spacing.lg,
  },
  actionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.gray[100],
  },
  actionIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: Colors.gray[50],
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  actionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  actionSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  bottomText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
});