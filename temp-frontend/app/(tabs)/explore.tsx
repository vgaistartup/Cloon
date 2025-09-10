import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import Screen from '@/components/Screen';
import Icon from '@/components/Icon';
import BottomNavigation from '@/components/BottomNavigation';
import { Colors, Typography, Spacing, BorderRadius, Layout, Shadows } from '@/constants/theme';

export default function ExploreScreen() {
  return (
    <Screen style={styles.container}>
      {/* Apple-style Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Icon name="search" size={16} color="#6E6E73" />
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Feed Placeholder */}
        <View style={styles.feedContainer}>
          {[1, 2, 3, 4, 5].map((item) => (
            <View key={item} style={styles.feedCard}>
              <View style={styles.feedImagePlaceholder} />
              <View style={styles.feedContent}>
                <Text style={styles.feedTitle}>Featured Look #{item}</Text>
                <Text style={styles.feedSubtitle}>Trending fashion inspiration</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      
      {/* Enhanced Bottom Navigation */}
      <BottomNavigation />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
  },

  // Apple-style Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.sectionMargin,
    paddingVertical: Spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 0.33,
    borderBottomColor: 'rgba(0, 0, 0, 0.04)',
    backdropFilter: 'blur(20px)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.02,
    shadowRadius: 16,
    elevation: 0,
  },
  headerTitle: {
    fontSize: Typography.fontSize.h1,
    fontWeight: Typography.fontWeight.bold,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
    color: Colors.text.primary,
    letterSpacing: -0.4,
  },
  searchButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    transition: 'all 0.2s ease',
  },

  // Main Content
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: Spacing.xxl,
  },
  feedContainer: {
    paddingHorizontal: Layout.sectionMargin,
    paddingTop: Spacing.lg,
    gap: Spacing.lg,
  },
  feedCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
    ...Shadows.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  feedImagePlaceholder: {
    height: 200,
    backgroundColor: Colors.border,
  },
  feedContent: {
    padding: Spacing.cardPadding,
  },
  feedTitle: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  feedSubtitle: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily,
    color: Colors.text.secondary,
  },
});