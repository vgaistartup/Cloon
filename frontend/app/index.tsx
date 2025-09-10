import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthService } from '@/services/auth';
import Screen from '@/components/Screen';
import { Colors, Typography, Spacing } from '@/constants/theme';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const isAuthenticated = await AuthService.isAuthenticated();
      
      // Delay for splash effect
      setTimeout(() => {
        if (isAuthenticated) {
          router.replace('/dashboard');
        } else {
          router.replace('/auth');
        }
      }, 2000);
    } catch (error) {
      console.error('Auth check error:', error);
      router.replace('/auth');
    }
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Virtual Try-On</Text>
        <Text style={styles.subtitle}>AI-Powered Fashion Experience</Text>
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: Typography.fontSize.lg,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: Spacing.xxl,
  },
  loader: {
    marginTop: Spacing.xl,
  },
});