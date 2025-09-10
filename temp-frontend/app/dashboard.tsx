import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from '@/components/Icon';
import Screen from '@/components/Screen';
import Button from '@/components/Button';
import { AuthService } from '@/services/auth';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout } from '@/constants/theme';

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
    // Navigate to guided capture screen for avatar creation
    router.push('/guided-capture');
  };

  const handleUploadExisting = () => {
    router.push('/upload');
  };

  return (
    <Screen style={styles.container}>
      {/* Minimal header with breathing space */}
      <View style={styles.header}>
        <Text style={styles.title}>Virtual Try-On</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Icon 
            name="log-out-outline" 
            size={20} 
            color={Colors.text.secondary} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Clean welcome section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome back!</Text>
          <Text style={styles.welcomeSubtitle}>
            Ready to try on some amazing outfits?
          </Text>
        </View>

        {/* Cards grid with generous spacing */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={handleGenerateAvatar}>
            <View style={styles.actionIconContainer}>
              <Icon 
                name="camera" 
                size={24} 
                color={Colors.text.primary} 
              />
            </View>
            <Text style={styles.actionTitle}>Create Avatar</Text>
            <Text style={styles.actionSubtitle}>
              Take guided photos to create your AI avatar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={handleUploadExisting}>
            <View style={styles.actionIconContainer}>
              <Icon 
                name="person" 
                size={24} 
                color={Colors.text.primary} 
              />
            </View>
            <Text style={styles.actionTitle}>Upload Existing Photos</Text>
            <Text style={styles.actionSubtitle}>
              Use photos from your gallery
            </Text>
          </TouchableOpacity>
        </View>

        {/* Minimal bottom section */}
        <View style={styles.bottomSection}>
          <Text style={styles.bottomText}>
            More features coming soon
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,     // Pure white background
  },
  
  // Minimal header with subtle divider
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.sectionMargin,      // 32px margins
    paddingVertical: Spacing.lg,                  // 24px vertical
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,             // Light gray #E5E5EA
  },
  title: {
    fontSize: Typography.fontSize.h2,             // 23px section header
    fontWeight: Typography.fontWeight.semibold,   // SemiBold weight
    fontFamily: Typography.fontFamily,            // Inter typeface
    color: Colors.text.primary,                   // Pure black
  },
  logoutButton: {
    padding: Spacing.sm,
    minHeight: Layout.minTouchTarget,             // 44px tap target
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Content with generous spacing
  content: {
    flex: 1,
    paddingHorizontal: Layout.sectionMargin,      // 32px section margins
  },
  
  // Clean welcome section
  welcomeSection: {
    paddingVertical: Spacing.xxl,                 // 48px breathing space
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: Typography.fontSize.h2,             // 23px section header
    fontWeight: Typography.fontWeight.semibold,   // SemiBold weight
    fontFamily: Typography.fontFamily,            // Inter typeface
    color: Colors.text.primary,                   // Pure black
    marginBottom: Spacing.sm,                     // 8px spacing
  },
  welcomeSubtitle: {
    fontSize: Typography.fontSize.body,           // 17px body text
    fontFamily: Typography.fontFamily,            // Inter typeface
    color: Colors.text.secondary,                 // Neutral gray #6E6E73
    textAlign: 'center',
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.body,
  },
  
  // Cards grid with Design System spacing
  actionsGrid: {
    flex: 1,
    gap: Spacing.lg,                              // 24px gaps between cards
  },
  
  // Cards per Design System: white bg, rounded corners, soft shadow
  actionCard: {
    backgroundColor: Colors.background,           // White background
    borderRadius: BorderRadius.xxl,               // 20px rounded corners
    padding: Spacing.cardPadding,                 // 20px card padding
    alignItems: 'center',
    ...Shadows.card,                              // Soft diffuse shadow
    borderWidth: 1,
    borderColor: Colors.border,                   // Light gray border
  },
  
  // Icon containers with subtle styling
  actionIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: Colors.background,           // White background
    borderRadius: BorderRadius.lg,                // 16px rounded
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,                     // 24px margin
    borderWidth: 1,
    borderColor: Colors.border,                   // Light border
  },
  
  // Typography following Design System
  actionTitle: {
    fontSize: Typography.fontSize.body,           // 17px body text
    fontWeight: Typography.fontWeight.medium,     // Medium weight
    fontFamily: Typography.fontFamily,            // Inter typeface
    color: Colors.text.primary,                   // Pure black
    marginBottom: Spacing.sm,                     // 8px spacing
  },
  actionSubtitle: {
    fontSize: Typography.fontSize.caption,        // 13px caption
    fontFamily: Typography.fontFamily,            // Inter typeface
    color: Colors.text.secondary,                 // Neutral gray
    textAlign: 'center',
    lineHeight: 18,                               // Simple line height
  },
  
  // Minimal bottom section
  bottomSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,                  // 32px padding
  },
  bottomText: {
    fontSize: Typography.fontSize.caption,        // 13px caption
    fontFamily: Typography.fontFamily,            // Inter typeface
    color: Colors.text.secondary,                 // Neutral gray
    textAlign: 'center',
  },
});