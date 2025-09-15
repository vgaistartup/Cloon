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
          router.replace('/(tabs)/explore');
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
        <ActivityIndicator size="large" color={Colors.accent} style={styles.loader} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,           // White background per Design System
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize.h1,            // 30px page title
    fontWeight: Typography.fontWeight.semibold,  // SemiBold weight
    fontFamily: Typography.fontFamily,           // Inter typeface
    color: Colors.text.primary,                  // Black text
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: Typography.fontSize.body,          // 17px body text
    fontFamily: Typography.fontFamily,           // Inter typeface
    color: Colors.text.secondary,                // Neutral gray
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  loader: {
    marginTop: Spacing.xl,
  },
});