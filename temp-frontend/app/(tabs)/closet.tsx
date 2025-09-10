import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Screen from '@/components/Screen';
import { Colors, Typography, Spacing, BorderRadius, Layout, Shadows } from '@/constants/theme';

export default function ClosetScreen() {
  return (
    <Screen style={styles.container}>
      {/* Dynamic Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Closet</Text>
      </View>

      {/* Apple Photos-style Grid */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gridContainer}>
          {/* Section: Recent */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent</Text>
            <View style={styles.grid}>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <TouchableOpacity key={item} style={styles.gridItem}>
                  <View style={styles.gridImage} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Section: Favorites */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Favorites</Text>
            <View style={styles.grid}>
              {[7, 8, 9, 10].map((item) => (
                <TouchableOpacity key={item} style={styles.gridItem}>
                  <View style={styles.gridImage} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Section: Collections */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Collections</Text>
            <View style={styles.collectionsGrid}>
              {['Summer', 'Work', 'Casual', 'Formal'].map((collection) => (
                <TouchableOpacity key={collection} style={styles.collectionCard}>
                  <View style={styles.collectionImage} />
                  <Text style={styles.collectionTitle}>{collection}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
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

  // Dynamic Header
  header: {
    alignItems: 'center',
    paddingHorizontal: Layout.sectionMargin,
    paddingVertical: Spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backdropFilter: 'blur(10px)',
  },
  headerTitle: {
    fontSize: Typography.fontSize.h1,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily,
    color: Colors.text.primary,
  },

  // Main Content
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: Spacing.xxl,
  },
  gridContainer: {
    paddingHorizontal: Layout.sectionMargin,
    paddingTop: Spacing.lg,
  },

  // Sections
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
  },

  // Photo Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  gridItem: {
    width: '32.66%',
    aspectRatio: 1,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.sm,
  },
  gridImage: {
    flex: 1,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.sm,
  },

  // Collections Grid
  collectionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  collectionCard: {
    width: '48%',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  collectionImage: {
    height: 120,
    backgroundColor: Colors.border,
  },
  collectionTitle: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily,
    color: Colors.text.primary,
    padding: Spacing.md,
    textAlign: 'center',
  },
});