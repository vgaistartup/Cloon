import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Icon from '@/components/Icon';
import Screen from '@/components/Screen';
import Button from '@/components/Button';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

// Optional haptics import with fallback
let Haptics: any;
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = {
    impactAsync: () => {},
    ImpactFeedbackStyle: { Medium: 'medium', Light: 'light' }
  };
}

const { width, height } = Dimensions.get('window');

interface AvatarPose {
  id: number;
  name: string;
  uri: string;
  isGenerated: boolean;
}

const mockAvatarPoses: AvatarPose[] = [
  {
    id: 1,
    name: 'Front View',
    uri: 'https://via.placeholder.com/400x600/007AFF/FFFFFF?text=Avatar+Front',
    isGenerated: false
  },
  {
    id: 2,
    name: 'Profile Left',
    uri: 'https://via.placeholder.com/400x600/34C759/FFFFFF?text=Avatar+Left',
    isGenerated: false
  },
  {
    id: 3,
    name: 'Profile Right',
    uri: 'https://via.placeholder.com/400x600/FF9500/FFFFFF?text=Avatar+Right',
    isGenerated: false
  },
  {
    id: 4,
    name: '3/4 View',
    uri: 'https://via.placeholder.com/400x600/FF3B30/FFFFFF?text=Avatar+3-4',
    isGenerated: false
  },
  {
    id: 5,
    name: 'Back View',
    uri: 'https://via.placeholder.com/400x600/6E6E73/FFFFFF?text=Avatar+Back',
    isGenerated: false
  },
];

export default function AvatarGalleryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [avatarPoses, setAvatarPoses] = useState<AvatarPose[]>(mockAvatarPoses);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(true);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [savedToCache, setSavedToCache] = useState(false);
  
  // Animation refs
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const rotationAnimation = useRef(new Animated.Value(0)).current;
  const revealAnimation = useRef(new Animated.Value(0)).current;
  const flashAnimation = useRef(new Animated.Value(0)).current;
  const avatarScale = useRef(new Animated.Value(0.8)).current;
  const swipeTranslateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startAvatarGeneration();
  }, []);

  const startAvatarGeneration = () => {
    setIsGenerating(true);
    
    // Start progress circle and rotation animations
    Animated.parallel([
      Animated.timing(progressAnimation, {
        toValue: 1,
        duration: 8000, // 8 seconds for generation
        useNativeDriver: false,
      }),
      Animated.loop(
        Animated.timing(rotationAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ),
    ]).start();

    // Simulate generation progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        const newProgress = prev + Math.random() * 0.15;
        if (newProgress >= 1) {
          clearInterval(progressInterval);
          setTimeout(() => {
            completeGeneration();
          }, 1000);
          return 1;
        }
        return newProgress;
      });
    }, 500);
  };

  const completeGeneration = () => {
    setIsGenerating(false);
    
    // Update avatars as generated
    setAvatarPoses(prev => prev.map(pose => ({ ...pose, isGenerated: true })));
    
    // Start reveal sequence
    setTimeout(() => {
      startRevealAnimation();
    }, 500);
  };

  const startRevealAnimation = () => {
    // Studio flash effect
    Animated.sequence([
      Animated.timing(flashAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(flashAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Avatar reveal with scale and fade
    Animated.parallel([
      Animated.timing(revealAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(avatarScale, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsRevealed(true);
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    });
  };

  const handleSwipeGesture = (event: any) => {
    // Simple touch-based swipe implementation
    const { pageX } = event.nativeEvent;
    const threshold = width * 0.25;
    
    if (pageX > threshold && currentPoseIndex > 0) {
      navigateToPose(currentPoseIndex - 1);
    } else if (pageX < width - threshold && currentPoseIndex < avatarPoses.length - 1) {
      navigateToPose(currentPoseIndex + 1);
    }
  };

  const navigateToPose = (newIndex: number) => {
    if (newIndex < 0 || newIndex >= avatarPoses.length) return;
    
    const direction = newIndex > currentPoseIndex ? -1 : 1;
    
    Animated.timing(swipeTranslateX, {
      toValue: direction * width,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setCurrentPoseIndex(newIndex);
      swipeTranslateX.setValue(-direction * width);
      
      Animated.spring(swipeTranslateX, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    });

    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const saveAvatar = async () => {
    Alert.alert(
      'Save Avatar',
      'Save this avatar to your profile for future use?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: () => {
            setSavedToCache(true);
            Alert.alert('Success', 'Avatar saved to your profile!');
          }
        }
      ]
    );
  };

  const goToWardrobe = () => {
    Alert.alert(
      'Go to Wardrobe',
      'Start trying on clothes with your new avatar?',
      [
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'Let\'s Go!',
          onPress: () => {
            // Navigate to wardrobe screen (to be implemented)
            router.push('/(tabs)/wardrobe'); // Updated to use new tab navigation
          }
        }
      ]
    );
  };

  const currentPose = avatarPoses[currentPoseIndex];

  return (
    <Screen style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>My Avatar</Text>
        <TouchableOpacity onPress={saveAvatar}>
          <Text style={styles.saveText}>{savedToCache ? '✓' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {isGenerating ? (
          /* Generation State */
          <View style={styles.generationContainer}>
            <Text style={styles.generationTitle}>Creating your avatar...</Text>
            <Text style={styles.generationSubtitle}>
              Using AI to generate multiple poses
            </Text>

            {/* Progress Circle with Rotating Silhouette */}
            <View style={styles.progressContainer}>
              <Animated.View
                style={[
                  styles.progressCircle,
                  {
                    transform: [
                      {
                        rotate: rotationAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text style={styles.avatarSilhouette}>👤</Text>
              </Animated.View>

              {/* Progress Ring */}
              <Animated.View
                style={[
                  styles.progressRing,
                  {
                    transform: [
                      {
                        rotate: progressAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </View>

            {/* Progress Text */}
            <Text style={styles.progressText}>
              {Math.round(generationProgress * 100)}% Complete
            </Text>
          </View>
        ) : (
          /* Avatar Gallery State */
          <View style={styles.galleryContainer}>
            {/* Studio Flash Overlay */}
            <Animated.View
              style={[
                styles.flashOverlay,
                {
                  opacity: flashAnimation,
                },
              ]}
            />

            {/* Avatar Display */}
            <TouchableOpacity
              style={[
                styles.avatarContainer,
                {
                  opacity: revealAnimation,
                  transform: [
                    { scale: avatarScale },
                    { translateX: swipeTranslateX },
                  ],
                },
              ]}
              onPress={handleSwipeGesture}
              activeOpacity={0.9}
            >
              <Image source={{ uri: currentPose.uri }} style={styles.avatarImage} />
              
              {/* Pose Label */}
              <View style={styles.poseLabel}>
                <Text style={styles.poseLabelText}>{currentPose.name}</Text>
              </View>
            </TouchableOpacity>

            {/* Pose Indicators */}
            <View style={styles.poseIndicators}>
              {avatarPoses.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.poseIndicator,
                    index === currentPoseIndex && styles.poseIndicatorActive,
                  ]}
                  onPress={() => navigateToPose(index)}
                />
              ))}
            </View>

            {/* Navigation Hints */}
            {isRevealed && (
              <View style={styles.navigationHints}>
                {currentPoseIndex > 0 && (
                  <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => navigateToPose(currentPoseIndex - 1)}
                  >
                    <Text style={styles.navButtonText}>←</Text>
                  </TouchableOpacity>
                )}
                
                {currentPoseIndex < avatarPoses.length - 1 && (
                  <TouchableOpacity
                    style={[styles.navButton, styles.navButtonRight]}
                    onPress={() => navigateToPose(currentPoseIndex + 1)}
                  >
                    <Text style={styles.navButtonText}>→</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Swipe Hint */}
            {isRevealed && (
              <View style={styles.swipeHint}>
                <Text style={styles.swipeHintText}>
                  Swipe to view other poses • {currentPoseIndex + 1} of {avatarPoses.length}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Bottom Actions */}
      {isRevealed && (
        <View style={styles.bottomActions}>
          <Button
            title="Save Avatar"
            onPress={saveAvatar}
            variant="secondary"
            style={styles.saveButton}
            disabled={savedToCache}
          />
          <Button
            title="Go to Wardrobe"
            onPress={goToWardrobe}
            style={styles.wardrobeButton}
          />
        </View>
      )}

      {/* AI Cache Indicator */}
      {savedToCache && (
        <View style={styles.cacheIndicator}>
          <Text style={styles.cacheText}>✓ Saved to AI Cache</Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily,
    color: Colors.text.primary,
  },
  saveText: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily,
    color: Colors.accent,
  },

  // Content
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Generation State
  generationContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  generationTitle: {
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  generationSubtitle: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  progressContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    position: 'relative',
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  avatarSilhouette: {
    fontSize: 48,
    opacity: 0.7,
  },
  progressRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 4,
    borderColor: Colors.accent,
    borderTopColor: 'transparent',
    position: 'absolute',
  },
  progressText: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily,
    color: Colors.accent,
    marginTop: Spacing.lg,
  },

  // Gallery State
  galleryContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  flashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background,
    zIndex: 10,
  },
  avatarContainer: {
    width: width * 0.8,
    height: height * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.border,
    ...Shadows.card,
  },
  poseLabel: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  poseLabelText: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily,
    color: Colors.background,
    textAlign: 'center',
  },

  // Navigation
  poseIndicators: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
  },
  poseIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  poseIndicatorActive: {
    backgroundColor: Colors.text.primary,  // Black background
    width: 24,
  },
  navigationHints: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    pointerEvents: 'box-none',
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonRight: {
    alignSelf: 'flex-end',
  },
  navButtonText: {
    fontSize: 24,
    color: Colors.background,
    fontWeight: 'bold',
  },
  swipeHint: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  swipeHintText: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily,
    color: Colors.text.secondary,
    textAlign: 'center',
  },

  // Bottom Actions
  bottomActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveButton: {
    flex: 1,
  },
  wardrobeButton: {
    flex: 2,
  },

  // Cache Indicator
  cacheIndicator: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 80,
    alignSelf: 'center',
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  cacheText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily,
    color: Colors.background,
  },
});