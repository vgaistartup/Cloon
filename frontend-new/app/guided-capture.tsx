import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  Platform,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
// Optional imports - fallback if not available
let Speech: any;
let Haptics: any;
try {
  Speech = require('expo-speech');
} catch {
  Speech = { speak: () => {}, stop: () => {} };
}
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = {
    impactAsync: () => {},
    notificationAsync: () => {},
    ImpactFeedbackStyle: { Medium: 'medium' },
    NotificationFeedbackType: { Success: 'success' }
  };
}
import Icon from '@/components/Icon';
import Screen from '@/components/Screen';
import Button from '@/components/Button';
import PoseGuide from '@/components/PoseGuide';
import { Colors, Typography, Spacing, BorderRadius, Layout } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

interface CaptureStep {
  id: number;
  pose: string;
  instruction: string;
  voiceGuidance: string;
  silhouettePosition: 'center' | 'left' | 'right' | 'up' | 'down';
}

const captureSteps: CaptureStep[] = [
  {
    id: 1,
    pose: 'Front Face',
    instruction: 'Look straight at the camera',
    voiceGuidance: 'Please look straight at the camera and align your face with the silhouette',
    silhouettePosition: 'center',
  },
  {
    id: 2,
    pose: 'Left Profile',
    instruction: 'Turn slightly left',
    voiceGuidance: 'Turn your head slightly to the left while keeping your shoulders straight',
    silhouettePosition: 'left',
  },
  {
    id: 3,
    pose: 'Right Profile',
    instruction: 'Turn slightly right',
    voiceGuidance: 'Now turn your head slightly to the right while keeping your shoulders straight',
    silhouettePosition: 'right',
  },
  {
    id: 4,
    pose: 'Looking Up',
    instruction: 'Tilt your head slightly up',
    voiceGuidance: 'Tilt your head slightly upward while maintaining eye contact with the camera',
    silhouettePosition: 'up',
  },
  {
    id: 5,
    pose: 'Looking Down',
    instruction: 'Tilt your head slightly down',
    voiceGuidance: 'Tilt your head slightly downward while keeping your face visible',
    silhouettePosition: 'down',
  },
  {
    id: 6,
    pose: 'Final Front',
    instruction: 'Final front-facing pose',
    voiceGuidance: 'Perfect! One final front-facing photo to complete your avatar',
    silhouettePosition: 'center',
  },
];

interface PhotoCapture {
  stepId: number;
  pose: string;
  uri: string;
  timestamp: number;
}

export default function GuidedCaptureScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [permission, requestPermission] = useCameraPermissions();
  
  // Check if we're in retake mode
  const isRetakeMode = params.retakeMode === 'true';
  const retakeStep = params.retakeStep ? parseInt(params.retakeStep as string) : 0;
  const existingPhotos = params.existingPhotos ? JSON.parse(params.existingPhotos as string) : [];
  
  const [currentStep, setCurrentStep] = useState(retakeStep);
  // NEW: Proper photo mapping by step ID
  const [capturedPhotos, setCapturedPhotos] = useState<Map<number, PhotoCapture>>(() => {
    const photoMap = new Map();
    // In retake mode, pre-populate with existing photo for the step being retaken
    if (isRetakeMode && existingPhotos[retakeStep]) {
      const existingPhoto = existingPhotos[retakeStep];
      photoMap.set(existingPhoto.id, {
        stepId: existingPhoto.id,
        pose: existingPhoto.pose,
        uri: existingPhoto.uri,
        timestamp: Date.now()
      });
    }
    return photoMap;
  });
  const [isCapturing, setIsCapturing] = useState(false);
  const [isPoseDetected, setIsPoseDetected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showRetake, setShowRetake] = useState(false);
  
  const cameraRef = useRef<CameraView>(null);
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const silhouetteAnimation = useRef(new Animated.Value(0)).current;
  const poseDetectionAnimation = useRef(new Animated.Value(0)).current;
  const processingAnimation = useRef(new Animated.Value(0)).current;
  const buttonPulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Camera permissions are handled by useCameraPermissions hook
  }, []);

  // Auto-request permission on mount or when undetermined/canAskAgain
  useEffect(() => {
    (async () => {
      if (!permission) {
        try { await requestPermission(); } catch {}
        return;
      }
      // If not granted and can ask again, prompt
      if (!permission.granted && permission.canAskAgain) {
        try { await requestPermission(); } catch {}
      }
    })();
  }, [permission?.status]);

  useEffect(() => {
    // Animate progress bar based on captured photos count
    const capturedCount = capturedPhotos.size;
    Animated.timing(progressAnimation, {
      toValue: capturedCount / captureSteps.length,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [capturedPhotos.size]);

  useEffect(() => {
    // Animate silhouette when step changes
    Animated.sequence([
      Animated.timing(silhouetteAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(silhouetteAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Voice guidance for new step
    if (voiceEnabled && currentStep < captureSteps.length) {
      setTimeout(() => {
        Speech.speak(captureSteps[currentStep].voiceGuidance, {
          language: 'en',
          pitch: 1.0,
          rate: 0.8,
        });
      }, 800);
    }

    // Simulate pose detection after instruction
    setTimeout(() => {
      simulatePoseDetection();
    }, 2000);
  }, [currentStep, voiceEnabled]);

  const requestCameraPermission = async () => {
    if (!permission?.granted) {
      await requestPermission();
    }
  };

  const simulatePoseDetection = () => {
    setIsProcessing(true);
    
    // Start subtle processing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(processingAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(processingAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    // Simulate AR-based pose detection
    setTimeout(() => {
      setIsProcessing(false);
      setIsPoseDetected(true);
      processingAnimation.stopAnimation();
      processingAnimation.setValue(0);
      
      Animated.timing(poseDetectionAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Start button pulse when ready
      startButtonPulse();
      
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }, 1500);
  };

  const startButtonPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonPulseAnimation, {
          toValue: 1.05,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(buttonPulseAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    // Also start success ring pulse
    startSuccessRingPulse();
  };

  const startSuccessRingPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(processingAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(processingAnimation, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopButtonPulse = () => {
    buttonPulseAnimation.stopAnimation();
    buttonPulseAnimation.setValue(1);
    processingAnimation.stopAnimation();
    processingAnimation.setValue(0);
  };

  const renderPoseGuide = (position: string) => {
    const poseMap: { [key: string]: 'center' | 'left' | 'right' | 'up' | 'down' } = {
      center: 'center',
      left: 'left', 
      right: 'right',
      up: 'up',
      down: 'down'
    };
    
    return (
      <PoseGuide 
        pose={poseMap[position] || 'center'}
        isDetected={isPoseDetected}
        isProcessing={isProcessing}
      />
    );
  };

  const capturePhoto = async () => {
    if (!cameraRef.current || !isPoseDetected) return;

    setIsCapturing(true);
    stopButtonPulse();
    
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (photo?.uri) {
        // Show processing state during quality analysis
        setIsProcessing(true);
        
        const currentStepData = captureSteps[currentStep];
        const photoCapture: PhotoCapture = {
          stepId: currentStepData.id,
          pose: currentStepData.pose,
          uri: photo.uri,
          timestamp: Date.now()
        };
        
        console.log(`📸 Captured photo for step ${currentStepData.id}: ${currentStepData.pose}`);
        
        // Simulate quality analysis delay
        setTimeout(() => {
          // Store photo mapped to its step ID
          setCapturedPhotos(prev => new Map(prev.set(currentStepData.id, photoCapture)));
          setShowRetake(true);
          setIsPoseDetected(false);
          setIsCapturing(false);
          setIsProcessing(false);

          // Reset pose detection animation
          poseDetectionAnimation.setValue(0);

          if (Platform.OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }

          // Auto-advance to next step after short delay
          setTimeout(() => {
            proceedToNextStep();
          }, 1500);
        }, 1200); // Simulate quality analysis time
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture photo');
      setIsCapturing(false);
      setIsProcessing(false);
      stopButtonPulse();
    }
  };

  const retakePhoto = () => {
    const currentStepData = captureSteps[currentStep];
    // Remove the photo for current step
    setCapturedPhotos(prev => {
      const newMap = new Map(prev);
      newMap.delete(currentStepData.id);
      return newMap;
    });
    setShowRetake(false);
    setIsPoseDetected(false);
    setIsProcessing(false);
    stopButtonPulse();
    poseDetectionAnimation.setValue(0);
    
    // Restart pose detection
    setTimeout(() => {
      simulatePoseDetection();
    }, 1000);
  };

  const proceedToNextStep = () => {
    if (isRetakeMode) {
      // In retake mode, we only capture one photo and return to review
      completeRetake();
    } else if (currentStep < captureSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setShowRetake(false);
      setIsPoseDetected(false);
      poseDetectionAnimation.setValue(0);
    } else {
      // All photos captured - complete avatar creation
      completeAvatarCreation();
    }
  };

  const completeRetake = () => {
    const capturedPhoto = capturedPhotos.get(captureSteps[retakeStep].id);
    if (!capturedPhoto) {
      console.error('❌ GuidedCapture: No captured photo for retake');
      return;
    }
    
    console.log('📸 GuidedCapture: Completing retake for step', retakeStep, 'pose:', capturedPhoto.pose);
    
    // Create updated photos array with proper pose mapping
    const updatedPhotos = existingPhotos.map((photo: any) => {
      if (photo.id === captureSteps[retakeStep].id) {
        const newPhoto = {
          id: photo.id,
          uri: capturedPhoto.uri,
          pose: capturedPhoto.pose,
          quality: simulatePhotoQuality()
        };
        console.log('✅ GuidedCapture: Updated photo', photo.id, ':', newPhoto.pose);
        return newPhoto;
      }
      return photo;
    });
    
    const timestamp = Date.now();
    console.log('🚀 GuidedCapture: Navigating back with timestamp:', timestamp);
    
    router.replace({
      pathname: '/photo-review',
      params: {
        photos: JSON.stringify(updatedPhotos),
        timestamp: timestamp.toString(),
        retaken: 'true'
      }
    });
  };

  // Add simulatePhotoQuality function for retake mode
  const simulatePhotoQuality = () => {
    const score = 75 + Math.random() * 20; // Better score for retaken photos
    const isBlurry = score < 80 && Math.random() < 0.2;
    const brightness = 70 + Math.random() * 25;
    
    let warning: string | undefined;
    if (isBlurry) warning = 'Photo appears blurry';
    else if (brightness < 70) warning = 'Slightly dark - consider retaking';
    
    return { isBlurry, brightness, score, warning };
  };

  const completeAvatarCreation = () => {
    // Convert Map to properly structured array with correct pose mapping
    const photoArray = Array.from({ length: captureSteps.length }, (_, index) => {
      const stepId = index + 1;
      const capturedPhoto = capturedPhotos.get(stepId);
      const stepData = captureSteps[index];
      
      if (capturedPhoto) {
        return {
          id: stepId,
          uri: capturedPhoto.uri,
          pose: capturedPhoto.pose,
          quality: simulatePhotoQuality()
        };
      } else {
        // Fallback - should not happen in normal flow
        return {
          id: stepId,
          uri: `https://via.placeholder.com/400x600/007AFF/FFFFFF?text=${encodeURIComponent(stepData.pose)}`,
          pose: stepData.pose,
          quality: simulatePhotoQuality()
        };
      }
    });
    
    console.log('🎨 GuidedCapture: Completing avatar with photos:', photoArray.map(p => `${p.id}: ${p.pose}`));
    
    router.push({
      pathname: '/photo-review',
      params: {
        photos: JSON.stringify(photoArray),
        timestamp: Date.now().toString()
      }
    });
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (!voiceEnabled) {
      Speech.speak('Voice guidance enabled');
    } else {
      Speech.stop();
    }
  };

  if (permission === null) {
    return (
      <Screen style={styles.container}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </Screen>
    );
  }

  if (permission.granted === false) {
    return (
      <Screen style={styles.container}>
        <Text style={styles.permissionText}>Camera access denied</Text>
        {permission.canAskAgain ? (
          <Button
            title="Grant Permission"
            onPress={requestCameraPermission}
            style={styles.permissionButton}
          />
        ) : (
          <Button
            title="Open Settings"
            onPress={() => Linking.openSettings?.()}
            style={styles.permissionButton}
          />
        )}
      </Screen>
    );
  }

  const currentStepData = captureSteps[currentStep];
  const progress = capturedPhotos.size / captureSteps.length;

  return (
    <View style={styles.container}>
      {/* Full-screen camera view */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="front"
      >
        {/* Clean header overlay */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrow-back" size={20} color={Colors.background} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {isRetakeMode ? 'Retake Photo' : 'Create Avatar'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {isRetakeMode 
                ? `${captureSteps[currentStep]?.pose}`
                : `Step ${currentStep + 1} of ${captureSteps.length}`
              }
            </Text>
          </View>
          
          <TouchableOpacity onPress={toggleVoice} style={styles.voiceButton}>
            <Text style={styles.voiceIcon}>{voiceEnabled ? '🔊' : '🔇'}</Text>
          </TouchableOpacity>
        </View>

        {/* Minimal progress indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressDots}>
            {captureSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index < capturedPhotos.size && styles.progressDotCompleted,
                  index === currentStep && styles.progressDotActive,
                ]}
              />
            ))}
          </View>
          
          {isProcessing && (
            <View style={styles.processingBadge}>
              <Text style={styles.processingBadgeText}>
                {isCapturing ? 'Analyzing...' : 'Detecting...'}
              </Text>
            </View>
          )}
        </View>

        {/* Clean pose guidance */}
        <View style={styles.poseGuidance}>
          <Text style={styles.poseTitle}>{currentStepData?.pose}</Text>
          <Text style={styles.poseInstruction}>
            {isProcessing && isCapturing 
              ? 'Analyzing photo quality...'
              : isProcessing 
              ? 'Detecting your pose...'
              : isPoseDetected 
              ? 'Perfect pose! Tap capture'
              : currentStepData?.instruction
            }
          </Text>
        </View>

        {/* Refined silhouette overlay */}
        <Animated.View
          style={[
            styles.silhouetteOverlay,
            {
              opacity: silhouetteAnimation,
              transform: [
                {
                  scale: silhouetteAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={[styles.silhouette, getSilhouetteStyle(currentStepData?.silhouettePosition)]}>
            <Animated.View 
              style={[
                styles.silhouetteFrame,
                {
                  borderColor: isPoseDetected 
                    ? 'rgba(255, 255, 255, 0.9)'
                    : 'rgba(255, 255, 255, 0.4)',
                  backgroundColor: isPoseDetected
                    ? 'rgba(255, 255, 255, 0.15)'
                    : 'rgba(255, 255, 255, 0.05)',
                  transform: [
                    {
                      scale: isPoseDetected 
                        ? poseDetectionAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.05],
                          })
                        : 1,
                    },
                  ],
                },
              ]}
            >
              {renderPoseGuide(currentStepData?.silhouettePosition)}
            </Animated.View>
          </View>
        </Animated.View>



        {/* Clean bottom controls */}
        <View style={styles.bottomControls}>
          {/* Capture controls */}
          <View style={styles.captureControls}>
            {showRetake && (
              <TouchableOpacity
                style={styles.retakeButton}
                onPress={retakePhoto}
              >
                <Text style={styles.retakeButtonText}>Retake</Text>
              </TouchableOpacity>
            )}

            <Animated.View
              style={{
                transform: [{ scale: isPoseDetected ? buttonPulseAnimation : 1 }],
              }}
            >
              <TouchableOpacity
                style={[
                  styles.captureButton,
                  {
                    backgroundColor: isPoseDetected ? Colors.text.primary : 'rgba(255, 255, 255, 0.2)',
                    borderColor: isPoseDetected ? Colors.background : 'rgba(255, 255, 255, 0.4)',
                    opacity: (!isPoseDetected || isCapturing) ? 0.6 : 1,
                  },
                ]}
                onPress={capturePhoto}
                disabled={!isPoseDetected || isCapturing}
              >
                <Text style={styles.captureButtonText}>
                  {isCapturing && isProcessing 
                    ? 'Analyzing...' 
                    : isCapturing 
                    ? 'Capturing...' 
                    : isPoseDetected 
                    ? 'Capture Photo'
                    : 'Align Pose'
                  }
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const getSilhouetteStyle = (position: string) => {
  switch (position) {
    case 'left':
      return { transform: [{ rotate: '-10deg' }] };
    case 'right':
      return { transform: [{ rotate: '10deg' }] };
    case 'up':
      return { transform: [{ translateY: -10 }] };
    case 'down':
      return { transform: [{ translateY: 10 }] };
    default:
      return {};
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.text.primary,
  },
  camera: {
    flex: 1,
  },
  
  // Clean header design
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: Layout.sectionMargin,
    paddingBottom: Spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily,
    color: Colors.background,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  voiceButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceIcon: {
    fontSize: 16,
  },

  // Clean progress design
  progressContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 130 : 110,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: Layout.sectionMargin,
  },
  progressDots: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  progressDotCompleted: {
    backgroundColor: Colors.text.primary,
    borderColor: Colors.text.primary,
  },
  progressDotActive: {
    backgroundColor: Colors.background,
    borderColor: Colors.background,
    width: 24,
  },
  processingBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  processingBadgeText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily,
    color: Colors.background,
  },

  // Pose guidance
  poseGuidance: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 200 : 180,
    left: Layout.sectionMargin,
    right: Layout.sectionMargin,
    alignItems: 'center',
  },
  poseTitle: {
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily,
    color: Colors.background,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  poseInstruction: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.body,
  },

  // Refined silhouette
  silhouetteOverlay: {
    position: 'absolute',
    top: '45%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -120 }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  silhouette: {
    width: 200,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  silhouetteFrame: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.xxl,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  silhouetteIcon: {
    fontSize: 64,
    color: 'rgba(255, 255, 255, 0.6)',
  },

  // Clean bottom controls
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  captureControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.sectionMargin,
    paddingVertical: Spacing.lg,
    gap: Spacing.lg,
  },
  captureButton: {
    paddingHorizontal: Spacing.xl * 2,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.full,
    minWidth: 140,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  captureButtonText: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily,
    color: Colors.background,
  },
  retakeButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  retakeButtonText: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily,
    color: Colors.background,
  },

  // Permission states
  permissionText: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  permissionButton: {
    alignSelf: 'center',
  },
});