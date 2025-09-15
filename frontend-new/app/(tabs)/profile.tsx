import React from 'react';
import { StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '@/components/Screen';
import { AuthService } from '@/services/auth';
import { Colors, Typography, Spacing, BorderRadius, Layout, Shadows } from '@/constants/theme';
import ProfileLooksScreen, { type ProfileUser, type LookItem } from '@/components/ProfileLooksScreen';

export default function ProfileScreen() {
  const router = useRouter();
  const username = 'zara';
  const user: ProfileUser = {
    id: 'u1',
    name: 'ZARA',
    role: 'BRAND',
    username,
    triedOn: 27100,
    followers: 62000,
    following: 167,
    tags: ['Streetwear', 'Monochrome', 'Paris'],
    collections: [
      { id: 'spring-edit', name: 'Spring Edit' },
      { id: 'denim-fits', name: 'Denim Fits' },
      { id: 'accessories-drop', name: 'Accessories Drop' },
    ],
    avatarUrl: undefined,
  };

  // No real looks yet; keep empty so the hero uses our provided placeholders
  const looks: LookItem[] = [];

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

  const handleSettings = () => router.push('/settings');

  const handleCopyUsername = async (value: string) => {
    // Fallback: show confirmation. For real clipboard support, add expo-clipboard and use setStringAsync.
    Alert.alert('Copied', `@${value} copied to clipboard`);
  };

  return (
    <Screen style={styles.container} edges={['top']}>
      {/* Profile Content (profile strip header is inside this component) */}
      <ProfileLooksScreen
        user={user}
        looks={looks}
        placeholderLooks={[
          'https://cdn.shopify.com/s/files/1/0863/2936/0687/files/Screenshot_2025-09-12_at_3.03.30_PM.png?v=1757671715',
          'https://cdn.shopify.com/s/files/1/0863/2936/0687/files/Screenshot_2025-09-12_at_3.03.50_PM.png?v=1757671715',
          'https://cdn.shopify.com/s/files/1/0863/2936/0687/files/Screenshot_2025-09-12_at_3.03.36_PM.png?v=1757671715',
        ]}
        onFollow={() => Alert.alert('Follow', `You followed @${username}`)}
        onMessage={() => Alert.alert('Message', 'Messaging coming soon')}
        onSave={() => Alert.alert('Saved', 'Saved to your wishlist')}
        onLookPress={(look) => Alert.alert('Look', look.id)}
      />
      
      {/* Enhanced Bottom Navigation */}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: Spacing.xxl,
  },

  // Profile Header
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: Layout.sectionMargin,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
  },
  avatarContainer: {
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  avatarText: {
    fontSize: 40,
    opacity: 0.5,
  },
  profileName: {
    fontSize: Typography.fontSize.h1,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  profileBio: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily,
    color: Colors.text.secondary,
    textAlign: 'center',
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Layout.sectionMargin,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily,
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },

  // Actions
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: Layout.sectionMargin,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  editButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    ...Shadows.card,
  },
  editButtonText: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily,
    color: Colors.text.primary,
  },
  shareButton: {
    width: 48,
    height: 48,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  tab: {
    paddingVertical: Spacing.sm,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.text.primary,
  },

  // Posts Grid
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Layout.sectionMargin,
    gap: 2,
    marginBottom: Spacing.xxl,
  },
  postItem: {
    width: '32.66%',
    aspectRatio: 1,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.sm,
  },
  postImage: {
    flex: 1,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.sm,
  },

  // Logout
  logoutContainer: {
    paddingHorizontal: Layout.sectionMargin,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
    ...Shadows.card,
  },
  logoutText: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily,
    color: Colors.text.primary,
  },
});