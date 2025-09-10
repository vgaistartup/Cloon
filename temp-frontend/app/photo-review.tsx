import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Icon from '@/components/Icon';
import Screen from '@/components/Screen';
import Button from '@/components/Button';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout } from '@/constants/theme';

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

const { width } = Dimensions.get('window');
const thumbnailSize = (width - Layout.sectionMargin * 2 - Spacing.lg * 2) / 3;

interface PhotoQuality {
  isBlurry: boolean;
  brightness: number;
  score: number;
  warning?: string;
}

interface PhotoData {
  id: number;
  uri: string;
  pose: string;
  quality: PhotoQuality;
}

const mockPhotos: PhotoData[] = [
  {
    id: 1,
    uri: 'https://via.placeholder.com/400x600/007AFF/FFFFFF?text=Front+Face',
    pose: 'Front Face',
    quality: { isBlurry: false, brightness: 85, score: 92 }
  },
  {
    id: 2,
    uri: 'https://via.placeholder.com/400x600/34C759/FFFFFF?text=Left+Profile',
    pose: 'Left Profile', 
    quality: { isBlurry: true, brightness: 70, score: 65, warning: 'Photo appears blurry' }
  },
  {
    id: 3,
    uri: 'https://via.placeholder.com/400x600/007AFF/FFFFFF?text=Right+Profile',
    pose: 'Right Profile',
    quality: { isBlurry: false, brightness: 88, score: 90 }
  },
  {
    id: 4,
    uri: 'https://via.placeholder.com/400x600/FF9500/FFFFFF?text=Looking+Up',
    pose: 'Looking Up',
    quality: { isBlurry: false, brightness: 75, score: 85 }
  },
  {
    id: 5,
    uri: 'https://via.placeholder.com/400x600/FF3B30/FFFFFF?text=Looking+Down',
    pose: 'Looking Down',
    quality: { isBlurry: false, brightness: 60, score: 78, warning: 'Slightly dark - consider retaking' }
  },
  {
    id: 6,
    uri: 'https://via.placeholder.com/400x600/007AFF/FFFFFF?text=Final+Front',
    pose: 'Final Front',
    quality: { isBlurry: false, brightness: 90, score: 95 }
  },
];

// Simulate AI photo quality analysis
const simulatePhotoQuality = (): PhotoQuality => {
  const score = 70 + Math.random() * 25; // Random score between 70-95
  const isBlurry = score < 75 && Math.random() < 0.3;
  const brightness = 60 + Math.random() * 30;
  
  let warning: string | undefined;
  if (isBlurry) warning = 'Photo appears blurry';
  else if (brightness < 65) warning = 'Slightly dark - consider retaking';
  else if (score < 80) warning = 'Could be improved with better lighting';
  
  return { isBlurry, brightness, score, warning };
};

export default function PhotoReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Initialize photos with proper state management
  const [photos, setPhotos] = useState<PhotoData[]>(() => {
    if (params.photos) {
      try {
        const parsed = JSON.parse(params.photos as string);
        console.log('🎯 PhotoReview: Loading', parsed.length, 'photos');
        return parsed.map((photo: any, index: number) => ({
          id: photo.id || index + 1,
          uri: photo.uri,
          pose: photo.pose,
          quality: photo.quality || simulatePhotoQuality()
        }));
      } catch (error) {
        console.error('❌ PhotoReview: Parse error:', error);
        return mockPhotos;
      }
    }
    return mockPhotos;
  });
  
  // Track last update to force re-renders
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [forceRefresh, setForceRefresh] = useState(0);
  
  // Listen for photo updates from navigation
  useEffect(() => {
    if (params.photos && params.timestamp) {
      const timestamp = parseInt(params.timestamp as string);
      if (timestamp > lastUpdate) {
        console.log('🔄 PhotoReview: Detected new photos, updating...');
        try {
          const parsed = JSON.parse(params.photos as string);
          const updated = parsed.map((photo: any, index: number) => ({
            id: photo.id || index + 1,
            uri: photo.uri,
            pose: photo.pose,
            quality: photo.quality || simulatePhotoQuality()
          }));
          
          console.log('✅ PhotoReview: Updated photos:', updated.map((p: PhotoData) => `${p.pose}: ${p.uri.slice(-10)}`));
          setPhotos(updated);
          setLastUpdate(timestamp);
          setForceRefresh(prev => prev + 1); // Force component refresh
          
          // Re-analyze quality
          setTimeout(() => analyzePhotoQuality(updated), 100);
        } catch (error) {
          console.error('❌ PhotoReview: Update parse error:', error);
        }
      }
    }
  }, [params.photos, params.timestamp, lastUpdate]);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [qualityCheck, setQualityCheck] = useState<{
    overallScore: number;
    warnings: string[];
    canProceed: boolean;
  } | null>(null);

  // Modal swipe navigation
  const swipeStartX = useRef(0);

  useEffect(() => {
    // Simulate AI quality analysis on mount
    analyzePhotoQuality(photos);
  }, []);

  const analyzePhotoQuality = async (photosToAnalyze = photos) => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis delay
    setTimeout(() => {
      const warnings: string[] = [];
      let totalScore = 0;
      
      photosToAnalyze.forEach(photo => {
        totalScore += photo.quality.score;
        if (photo.quality.warning) {
          warnings.push(`${photo.pose}: ${photo.quality.warning}`);
        }
      });
      
      const overallScore = totalScore / photosToAnalyze.length;
      const canProceed = overallScore >= 75 && warnings.length <= 2;
      
      setQualityCheck({
        overallScore,
        warnings,
        canProceed
      });
      
      setIsAnalyzing(false);
      
      // Show quality alert if there are issues
      if (!canProceed || warnings.length > 0) {
        setTimeout(() => showQualityAlert(), 500);
      }
    }, 2000);
  };

  const showQualityAlert = () => {
    if (!qualityCheck) return;
    
    const { overallScore, warnings, canProceed } = qualityCheck;
    
    if (!canProceed) {
      Alert.alert(
        'Photo Quality Check',
        `Overall quality: ${Math.round(overallScore)}%\n\nIssues found:\n${warnings.join('\n')}\n\nWe recommend retaking photos for better avatar quality.`,
        [
          { text: 'Retake Photos', onPress: retakeAll },
          { text: 'Continue Anyway', style: 'destructive' }
        ]
      );
    } else if (warnings.length > 0) {
      Alert.alert(
        'Quality Warning',
        `Good quality photos! (${Math.round(overallScore)}%)\n\nMinor issues:\n${warnings.join('\n')}\n\nYou can continue or retake specific photos.`,
        [{ text: 'OK' }]
      );
    }
  };

  const openPhotoModal = (photo: PhotoData) => {
    setSelectedPhoto(photo);
    setModalVisible(true);
    
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedPhoto(null);
  };

  const navigateToPhoto = (direction: 'prev' | 'next') => {
    if (!selectedPhoto) return;
    
    const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
    const currentPosition = currentIndex + 1;
    
    console.log(`📏 Navigation: Current photo ${currentPosition}/${photos.length}, going ${direction}`);
    
    let newIndex;
    
    if (direction === 'prev' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === 'next' && currentIndex < photos.length - 1) {
      newIndex = currentIndex + 1;
    } else {
      console.log('⚠️ Navigation: Cannot go', direction, 'from position', currentPosition);
      return; // No navigation possible
    }
    
    const newPosition = newIndex + 1;
    console.log(`✅ Navigation: Moving to photo ${newPosition}/${photos.length}`);
    
    // Immediate update for smooth transition
    setSelectedPhoto(photos[newIndex]);
    
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // PERMANENT SWIPE LOGIC - DO NOT CHANGE
  // User requirement: Left swipe = prev (backward), Right swipe = next (forward)
  const handleModalTouch = (event: any) => {
    const { locationX } = event.nativeEvent;
    const threshold = width * 0.25;
    
    console.log(`💆 Touch at locationX: ${locationX}, threshold: ${threshold}, screen width: ${width}`);
    
    // LOCKED BEHAVIOR: DO NOT MODIFY THIS LOGIC
    // USER REQUIREMENT: Left tap = 'prev' (backward), Right tap = 'next' (forward)
    if (locationX < threshold) {
      // Left side tap = PREVIOUS photo (backward: 5→4→3→2→1)
      console.log('⬅️ LEFT TAP: Calling navigateToPhoto("prev") for BACKWARD navigation');
      navigateToPhoto('prev');
    } else if (locationX > width - threshold) {
      // Right side tap = NEXT photo (forward: 1→2→3→4→5)
      console.log('➡️ RIGHT TAP: Calling navigateToPhoto("next") for FORWARD navigation');
      navigateToPhoto('next');
    } else {
      console.log('📍 Center tap: No navigation');
    }
  };

  // Add keyboard navigation support
  useEffect(() => {
    if (!modalVisible) return;
    
    // You can add keyboard listeners here if needed for web
    const handleKeyPress = (event: any) => {
      if (event.key === 'ArrowLeft') {
        navigateToPhoto('prev');
      } else if (event.key === 'ArrowRight') {
        navigateToPhoto('next');
      } else if (event.key === 'Escape') {
        closeModal();
      }
    };
    
    // Only add for web platforms
    if (Platform.OS === 'web') {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [modalVisible, selectedPhoto]);

  const retakePhoto = (photoId: number) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    closeModal();
    
    // Find the step index for this photo ID
    const stepIndex = photoId - 1;
    console.log(`🔄 PhotoReview: Retaking photo ID ${photoId}, step index ${stepIndex}`);
    
    // Navigate back to guided capture with specific step for retake
    router.push({
      pathname: '/guided-capture',
      params: { 
        retakeStep: stepIndex,
        retakeMode: 'true',
        existingPhotos: JSON.stringify(photos)
      }
    });
  };

  const retakeAll = () => {
    Alert.alert(
      'Retake All Photos',
      'This will restart the entire photo capture process.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Retake All',
          style: 'destructive',
          onPress: () => {
            router.back();
          }
        }
      ]
    );
  };

  const confirmAndCreateAvatar = () => {
    if (!qualityCheck?.canProceed) {
      Alert.alert(
        'Quality Check Failed',
        'Some photos need to be retaken for optimal avatar quality. Continue anyway?',
        [
          { text: 'Retake Photos', onPress: retakeAll },
          { 
            text: 'Continue', 
            style: 'destructive',
            onPress: proceedWithCreation 
          }
        ]
      );
      return;
    }
    
    proceedWithCreation();
  };

  const proceedWithCreation = () => {
    // Navigate to avatar gallery for generation and display
    router.push('/avatar-gallery');
  };

  const getQualityColor = (score: number) => {
    if (score >= 85) return Colors.success;
    if (score >= 70) return Colors.warning;
    return Colors.error;
  };

  const getQualityIcon = (photo: PhotoData) => {
    if (photo.quality.warning) return '⚠️';
    if (photo.quality.score >= 85) return '✓';
    return '○';
  };

  return (
    <Screen style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Review Photos</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quality Status - Redesigned */}
        <View style={styles.qualitySection}>
          {isAnalyzing ? (
            <View style={styles.analyzingCard}>
              <Text style={styles.analyzingIcon}>🔍</Text>
              <Text style={styles.analyzingTitle}>Analyzing Quality</Text>
              <Text style={styles.analyzingSubtitle}>Please wait...</Text>
            </View>
          ) : qualityCheck && (
            <View style={[
              styles.qualityCard,
              { borderColor: qualityCheck.canProceed ? Colors.success : Colors.warning }
            ]}>
              <View style={styles.qualityHeader}>
                <View style={styles.qualityScoreContainer}>
                  <Text style={styles.qualityScoreLabel}>Photo Quality</Text>
                  <Text style={styles.qualityScore}>
                    {Math.round(qualityCheck.overallScore)}%
                  </Text>
                </View>
                <Text style={[
                  styles.qualityStatus,
                  { color: qualityCheck.canProceed ? Colors.success : Colors.warning }
                ]}>
                  {qualityCheck.canProceed ? '✓ Ready' : '⚠ Needs Review'}
                </Text>
              </View>
              <Text style={styles.qualityMessage}>
                {qualityCheck.canProceed 
                  ? 'All photos meet quality standards for avatar creation.' 
                  : 'Some photos may need retaking for optimal results.'}
              </Text>
            </View>
          )}
        </View>

        {/* Photo Grid - Redesigned */}
        <View style={styles.gridSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Photos Captured</Text>
            <Text style={styles.sectionHint}>Tap any photo to view full size</Text>
          </View>
          <View style={styles.photoGrid} key={`photos-${lastUpdate}-${forceRefresh}`}>
            {photos.map((photo, index) => (
              <TouchableOpacity
                key={`photo-${photo.id}-${lastUpdate}-${forceRefresh}`}
                style={styles.photoCard}
                onPress={() => openPhotoModal(photo)}
                activeOpacity={0.8}
              >
                <Image 
                  key={`img-${photo.id}-${photo.uri}-${forceRefresh}`}
                  source={{ uri: `${photo.uri}?t=${lastUpdate}` }}
                  style={styles.photoImage} 
                />
                
                {/* Expand Icon for Clickability */}
                <View style={styles.expandIcon}>
                  <Text style={styles.expandIconText}>⤢</Text>
                </View>
                
                {/* Clean Quality Badge */}
                <View style={[
                  styles.qualityBadge,
                  { backgroundColor: getQualityColor(photo.quality.score) }
                ]}>
                  <Text style={styles.qualityBadgeText}>
                    {getQualityIcon(photo)}
                  </Text>
                </View>
                
                {/* Minimal Pose Label */}
                <View style={styles.photoLabelContainer}>
                  <Text style={styles.photoLabelText}>{photo.pose}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>


      </ScrollView>

      {/* Bottom Actions - Redesigned */}
      <View style={styles.bottomContainer}>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={retakeAll}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Retake All</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.primaryButton,
              !qualityCheck?.canProceed && styles.warningPrimaryButton
            ]}
            onPress={confirmAndCreateAvatar}
            disabled={isAnalyzing}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              {isAnalyzing ? 'Processing...' : 'Create Avatar'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Full Screen Photo Modal */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          {selectedPhoto && (
            <>
              {/* Full Screen Image - Main Focus */}
              <TouchableOpacity 
                style={styles.fullScreenImageContainer}
                onPress={handleModalTouch}
                activeOpacity={1}
              >
                <Image 
                  key={`modal-${selectedPhoto.id}-${selectedPhoto.uri}-${forceRefresh}`}
                  source={{ uri: `${selectedPhoto.uri}?t=${lastUpdate}` }} // Cache busting
                  style={styles.fullScreenImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>

              {/* Minimal Top Bar */}
              <View style={styles.minimalTopBar}>
                <TouchableOpacity onPress={closeModal} style={styles.minimalCloseButton}>
                  <Text style={styles.closeIcon}>×</Text>
                </TouchableOpacity>
                
                <Text style={styles.photoCounter}>
                  {photos.findIndex(p => p.id === selectedPhoto.id) + 1} / {photos.length}
                </Text>
                
                <View style={styles.headerSpacer} />
              </View>

              {/* Minimal Bottom Actions */}
              <View style={styles.minimalBottomBar}>
                {/* Quality indicator - subtle */}
                <View style={[
                  styles.qualityDot,
                  { backgroundColor: getQualityColor(selectedPhoto.quality.score) }
                ]} />
                
                <Text style={styles.photoLabel}>{selectedPhoto.pose}</Text>
                
                <TouchableOpacity 
                  style={styles.modalRetakeButton}
                  onPress={() => retakePhoto(selectedPhoto.id)}
                >
                  <Text style={styles.modalRetakeButtonText}>Retake</Text>
                </TouchableOpacity>
              </View>

              {/* Navigation hints - left and right tap areas */}
              {photos.length > 1 && (
                <>
                  {photos.findIndex(p => p.id === selectedPhoto.id) > 0 && (
                    <View style={styles.leftTapArea}>
                      <Text style={styles.navHint}>‹</Text>
                    </View>
                  )}
                  {photos.findIndex(p => p.id === selectedPhoto.id) < photos.length - 1 && (
                    <View style={styles.rightTapArea}>
                      <Text style={styles.navHint}>›</Text>
                    </View>
                  )}
                </>
              )}

              {/* Warning/Success overlay */}
              {selectedPhoto.quality.warning ? (
                <View style={styles.warningOverlay}>
                  <Text style={styles.warningText}>
                    {selectedPhoto.quality.warning}
                  </Text>
                </View>
              ) : selectedPhoto.quality.score >= 85 ? (
                <View style={styles.successOverlay}>
                  <Text style={styles.successText}>
                    Great quality! ✓
                  </Text>
                </View>
              ) : null}
            </>
          )}
        </View>
      </Modal>
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
    paddingHorizontal: Layout.sectionMargin,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: Layout.minTouchTarget,
    height: Layout.minTouchTarget,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily,
    color: Colors.text.primary,
  },
  placeholder: {
    width: Layout.minTouchTarget,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: Layout.sectionMargin,
  },

  // Quality Section - Redesigned
  qualitySection: {
    paddingVertical: Spacing.lg,
  },
  analyzingCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.cardPadding,
    alignItems: 'center',
    ...Shadows.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  analyzingIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  analyzingTitle: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  analyzingSubtitle: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily,
    color: Colors.text.secondary,
  },
  qualityCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.cardPadding,
    ...Shadows.card,
    borderWidth: 2,
  },
  qualityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.sm,
  },
  qualityScoreContainer: {
    alignItems: 'flex-start',
  },
  qualityScoreLabel: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  qualityScore: {
    fontSize: Typography.fontSize.h1,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily,
    color: Colors.text.primary,
  },
  qualityStatus: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily,
  },
  qualityMessage: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.caption,
  },

  // Grid Section - Redesigned
  gridSection: {
    paddingBottom: Spacing.xxl,
  },
  sectionHeader: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  sectionHint: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily,
    color: Colors.text.secondary,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'space-between',
  },
  photoCard: {
    width: thumbnailSize,
    height: thumbnailSize * 1.33,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.card,
    borderWidth: 1,
    borderColor: Colors.border,
    transform: [{ scale: 1 }],
  },
  photoImage: {
    width: '100%',
    flex: 1,
    backgroundColor: Colors.border,
  },
  qualityBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.button,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  qualityBadgeText: {
    fontSize: 14,
    color: Colors.background,
    fontWeight: Typography.fontWeight.semibold,
  },
  expandIcon: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    width: 24,
    height: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandIconText: {
    fontSize: 16,
    color: Colors.background,
    fontWeight: Typography.fontWeight.medium,
  },
  photoLabelContainer: {
    backgroundColor: Colors.background,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  photoLabelText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily,
    color: Colors.text.primary,
    textAlign: 'center',
  },



  // Bottom Actions - Redesigned for proper alignment
  bottomContainer: {
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Layout.sectionMargin,
    paddingVertical: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.lg,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'stretch',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.buttonPadding,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Layout.minTouchTarget,
    ...Shadows.button,
  },
  secondaryButtonText: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily,
    color: Colors.text.primary,
  },
  primaryButton: {
    flex: 2,
    backgroundColor: Colors.text.primary,  // Black background
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.buttonPadding,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Layout.minTouchTarget,
    ...Shadows.button,
  },
  warningPrimaryButton: {
    backgroundColor: Colors.warning,
  },
  primaryButtonText: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily,
    color: Colors.background,
  },

  // Modal Styles - Apple-inspired minimalism
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.text.primary, // Pure black background
  },
  fullScreenImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  
  // Minimal top bar - barely visible
  minimalTopBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    height: 44, // Apple's minimum touch target
  },
  minimalCloseButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 20,
    color: Colors.background,
    fontWeight: '300', // Light weight
  },
  photoCounter: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily,
    color: 'rgba(255, 255, 255, 0.8)', // Subtle white
    fontWeight: Typography.fontWeight.medium,
  },
  headerSpacer: {
    width: 44, // Same as close button for balance
  },
  
  // Minimal bottom bar - clean and simple
  minimalBottomBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    height: 60,
  },
  qualityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  photoLabel: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily,
    color: Colors.background,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
    flex: 1,
  },
  modalRetakeButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  modalRetakeButtonText: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily,
    color: Colors.background,
    fontWeight: Typography.fontWeight.medium,
  },
  
  // Warning - minimal and unobtrusive
  warningOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 110 : 90,
    left: Spacing.xl,
    right: Spacing.xl,
    backgroundColor: 'rgba(255, 149, 0, 0.9)', // Warning color with opacity
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  warningText: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily,
    color: Colors.background,
    textAlign: 'center',
    fontWeight: Typography.fontWeight.medium,
  },
  
  // Success - minimal and positive
  successOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 110 : 90,
    left: Spacing.xl,
    right: Spacing.xl,
    backgroundColor: 'rgba(52, 199, 89, 0.9)', // Success color with opacity
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  successText: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily,
    color: Colors.background,
    textAlign: 'center',
    fontWeight: Typography.fontWeight.medium,
  },
  
  // Navigation hints
  leftTapArea: {
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: [{ translateY: -25 }],
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderTopRightRadius: BorderRadius.full,
    borderBottomRightRadius: BorderRadius.full,
  },
  rightTapArea: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: [{ translateY: -25 }],
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderTopLeftRadius: BorderRadius.full,
    borderBottomLeftRadius: BorderRadius.full,
  },
  navHint: {
    fontSize: 24,
    color: Colors.background,
    fontWeight: 'bold',
  },
});