import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Screen from '@/components/Screen';
import Icon from '@/components/Icon';
import BottomNavigation from '@/components/BottomNavigation';
import { Colors, Typography, Spacing, BorderRadius, Layout, Shadows } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function WardrobeScreen() {
  return (
    <Screen style={styles.container}>
      {/* Dynamic Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wardrobe</Text>
        <TouchableOpacity style={styles.headerAction}>
          <Icon name="search" size={20} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Tinder-style Swipe Deck */}
      <View style={styles.content}>
        <View style={styles.deckContainer}>
          {/* Stack of cards */}
          {[1, 2, 3].map((item, index) => (
            <View 
              key={item} 
              style={[
                styles.card,
                {
                  transform: [
                    { scale: 1 - (index * 0.05) },
                    { translateY: index * 8 },
                  ],
                  zIndex: 3 - index,
                }
              ]}
            >
              <View style={styles.cardImage} />
              <View style={styles.cardOverlay}>
                <Text style={styles.cardTitle}>Summer Outfit #{item}</Text>
                <Text style={styles.cardSubtitle}>Casual • Trending</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={[styles.actionButton, styles.passButton]}>
            <Icon name="close" size={32} color={Colors.background} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.likeButton]}>
            <Icon name="heart" size={32} color={Colors.background} />
          </TouchableOpacity>
        </View>

        {/* Swipe Instruction */}
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>Swipe to discover your style</Text>
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

  // Dynamic Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },

  // Swipe Deck
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Layout.sectionMargin,
  },
  deckContainer: {
    width: width * 0.85,
    height: width * 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
    ...Shadows.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardImage: {
    flex: 1,
    backgroundColor: Colors.border,
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
    padding: Spacing.cardPadding,
  },
  cardTitle: {
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily,
    color: Colors.background,
    marginBottom: Spacing.xs,
  },
  cardSubtitle: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Action Buttons
  actionContainer: {
    flexDirection: 'row',
    gap: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  passButton: {
    backgroundColor: Colors.text.primary,
  },
  likeButton: {
    backgroundColor: Colors.text.primary,
  },

  // Instruction
  instructionContainer: {
    alignItems: 'center',
  },
  instructionText: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily,
    color: Colors.text.secondary,
  },
});