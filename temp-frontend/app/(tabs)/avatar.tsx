import React, { useState } from 'react';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Screen from '@/components/Screen';
import BottomNavigation from '@/components/BottomNavigation';
import { Colors, Typography, Spacing, BorderRadius, Layout, Shadows } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function AvatarScreen() {
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);

  const hotspots = [
    { id: 'hair', x: '50%', y: '20%', label: 'Hair' },
    { id: 'top', x: '50%', y: '45%', label: 'Top' },
    { id: 'bottom', x: '50%', y: '70%', label: 'Bottom' },
    { id: 'shoes', x: '50%', y: '90%', label: 'Shoes' },
  ];

  return (
    <Screen style={styles.container}>
      {/* Immersive Header (No actions) */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Avatar</Text>
      </View>

      {/* Avatar with Hotspots */}
      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          {/* Avatar Placeholder */}
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>👤</Text>
          </View>

          {/* Interactive Hotspots */}
          {hotspots.map((hotspot) => (
            <TouchableOpacity
              key={hotspot.id}
              style={[
                styles.hotspot,
                {
                  left: hotspot.x,
                  top: hotspot.y,
                },
                selectedHotspot === hotspot.id && styles.hotspotActive,
              ]}
              onPress={() => setSelectedHotspot(hotspot.id)}
            >
              <View style={styles.hotspotDot} />
              {selectedHotspot === hotspot.id && (
                <View style={styles.hotspotLabel}>
                  <Text style={styles.hotspotLabelText}>{hotspot.label}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Garment Selection */}
        {selectedHotspot && (
          <View style={styles.garmentContainer}>
            <Text style={styles.garmentTitle}>Choose {selectedHotspot}</Text>
            <View style={styles.garmentGrid}>
              {[1, 2, 3, 4].map((item) => (
                <TouchableOpacity key={item} style={styles.garmentCard}>
                  <View style={styles.garmentImage} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Pose Controls */}
        <View style={styles.poseContainer}>
          <Text style={styles.poseTitle}>Pose</Text>
          <View style={styles.poseButtons}>
            {['Front', 'Left', 'Right'].map((pose) => (
              <TouchableOpacity key={pose} style={styles.poseButton}>
                <Text style={styles.poseButtonText}>{pose}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      
      {/* Enhanced Bottom Navigation */}
      <BottomNavigation />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
  },

  // Immersive Header
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
    paddingHorizontal: Layout.sectionMargin,
    paddingTop: Spacing.lg,
  },

  // Avatar with Hotspots
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: width * 1.2,
    marginBottom: Spacing.xl,
    position: 'relative',
  },
  avatarPlaceholder: {
    width: width * 0.6,
    height: width * 0.8,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  avatarText: {
    fontSize: 80,
    opacity: 0.5,
  },

  // Hotspots
  hotspot: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -12 }, { translateY: -12 }],
  },
  hotspotDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.text.primary,
    borderWidth: 3,
    borderColor: Colors.background,
    ...Shadows.card,
  },
  hotspotActive: {
    transform: [{ translateX: -12 }, { translateY: -12 }, { scale: 1.2 }],
  },
  hotspotLabel: {
    position: 'absolute',
    top: -40,
    backgroundColor: Colors.text.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.lg,
    ...Shadows.card,
  },
  hotspotLabelText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily,
    color: Colors.background,
  },

  // Garment Selection
  garmentContainer: {
    marginBottom: Spacing.xl,
  },
  garmentTitle: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  garmentGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  garmentCard: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  garmentImage: {
    flex: 1,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.lg,
  },

  // Pose Controls
  poseContainer: {
    marginBottom: Spacing.xl,
  },
  poseTitle: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  poseButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  poseButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    ...Shadows.card,
  },
  poseButtonText: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily,
    color: Colors.text.primary,
  },
});