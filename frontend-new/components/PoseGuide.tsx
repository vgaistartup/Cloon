import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

interface PoseGuideProps {
  pose: 'center' | 'left' | 'right' | 'up' | 'down';
  isDetected: boolean;
  isProcessing: boolean;
}

export default function PoseGuide({ pose, isDetected, isProcessing }: PoseGuideProps) {
  const successAnimation = useRef(new Animated.Value(0)).current;
  const processingAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isDetected) {
      // Success animation
      Animated.timing(successAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      successAnimation.setValue(0);
    }
  }, [isDetected]);

  useEffect(() => {
    if (isProcessing) {
      // Processing pulse animation
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
    } else {
      processingAnimation.stopAnimation();
      processingAnimation.setValue(0);
    }
  }, [isProcessing]);

  const renderFaceShape = () => {
    const isProfile = pose === 'left' || pose === 'right';
    
    if (isProfile) {
      return (
        <View 
          style={[
            styles.faceProfile,
            pose === 'left' && styles.faceLeft,
            pose === 'right' && styles.faceRight,
          ]} 
        />
      );
    }
    
    return <View style={styles.faceFront} />;
  };

  const renderDirectionArrow = () => {
    if (isDetected) return null;
    
    const arrows = {
      left: '←',
      right: '→',
      up: '↑',
      down: '↓',
      center: null,
    };
    
    const arrow = arrows[pose];
    if (!arrow) return null;
    
    return (
      <Text style={styles.directionArrow}>{arrow}</Text>
    );
  };

  const renderEyes = () => {
    return (
      <View style={styles.eyes}>
        <View style={styles.eye} />
        <View style={styles.eye} />
      </View>
    );
  };

  const renderSuccessState = () => {
    if (!isDetected) return null;
    
    const isProfile = pose === 'left' || pose === 'right';
    
    return (
      <Animated.View 
        style={[
          isProfile ? styles.smileProfile : styles.smile,
          {
            opacity: successAnimation,
            transform: [
              {
                scaleX: successAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
            ],
          },
        ]}
      />
    );
  };

  const getHintText = () => {
    if (isDetected) return 'Perfect!';
    
    const hints = {
      center: 'Face forward',
      left: 'Turn left',
      right: 'Turn right',
      up: 'Look up',
      down: 'Look down',
    };
    
    return hints[pose];
  };

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.faceOutline,
          {
            opacity: isProcessing 
              ? processingAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.6, 1],
                })
              : 1,
            transform: [
              {
                scale: isDetected 
                  ? successAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.05],
                    })
                  : 1,
              },
            ],
          },
        ]}
      >
        {renderFaceShape()}
        {renderDirectionArrow()}
        
        {/* Eyes always visible */}
        <View style={styles.faceFeatures}>
          {renderEyes()}
          {renderSuccessState()}
        </View>
      </Animated.View>
      
      <Text style={styles.hintText}>
        {getHintText()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  
  // Face outline container
  faceOutline: {
    width: 80,
    height: 100,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  
  // Face shapes
  faceFront: {
    width: 60,
    height: 80,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  faceProfile: {
    width: 40,
    height: 80,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  faceLeft: {
    borderTopRightRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    marginLeft: -10,
  },
  faceRight: {
    borderTopLeftRadius: BorderRadius.xl,
    borderBottomLeftRadius: BorderRadius.xl,
    marginRight: -10,
  },
  
  // Direction arrow
  directionArrow: {
    position: 'absolute',
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: 'bold',
    top: -35,
  },
  
  // Face features container
  faceFeatures: {
    position: 'absolute',
    top: 25,
    alignItems: 'center',
  },
  eyes: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  eye: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  smile: {
    width: 20,
    height: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
  },
  smileProfile: {
    width: 20,
    height: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    transform: [{ scaleY: 1.1 }],
  },
  
  // Hint text
  hintText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});