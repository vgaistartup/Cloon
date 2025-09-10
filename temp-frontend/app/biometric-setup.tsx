import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Vibration,
  Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '@/components/Screen';
import Button from '@/components/Button';
import Icon from '@/components/Icon';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout } from '@/constants/theme';

type SignInOption = 'biometric' | 'pin' | null;

export default function BiometricSetupScreen() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<SignInOption>(null);
  const [hapticEnabled, setHapticEnabled] = useState(true);

  const handleOptionSelect = (option: SignInOption) => {
    // Haptic feedback on selection
    if (hapticEnabled && Platform.OS === 'ios') {
      Vibration.vibrate([10]);
    }
    setSelectedOption(option);
  };

  const handleContinue = () => {
    if (selectedOption === 'biometric') {
      // In a real app, this would trigger biometric enrollment
      router.push('/(tabs)/explore');
    } else if (selectedOption === 'pin') {
      // Navigate to PIN setup screen (to be implemented)
      router.push('/pin-setup');
    }
  };

  const handleSkip = () => {
    router.push('/(tabs)/explore');
  };

  const toggleHaptic = () => {
    setHapticEnabled(!hapticEnabled);
    if (!hapticEnabled && Platform.OS === 'ios') {
      Vibration.vibrate([10]); // Test vibration when enabling
    }
  };

  return (
    <Screen style={styles.container} padding={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Choose quick sign-in</Text>
          <Text style={styles.subtitle}>
            Set up a faster way to access your account next time
          </Text>
        </View>

        {/* Options Cards */}
        <View style={styles.optionsContainer}>
          {/* Biometric Option */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedOption === 'biometric' && styles.optionCardSelected
            ]}
            onPress={() => handleOptionSelect('biometric')}
          >
            <View style={styles.optionIconContainer}>
              <Icon 
                name="person" 
                size={32} 
                color={selectedOption === 'biometric' ? Colors.accent : Colors.text.primary} 
              />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>
                {Platform.OS === 'ios' ? 'Face ID' : 'Biometric'}
              </Text>
              <Text style={styles.optionDescription}>
                Use your {Platform.OS === 'ios' ? 'Face ID' : 'fingerprint'} for quick access
              </Text>
            </View>
            {selectedOption === 'biometric' && (
              <View style={styles.checkmark}>
                <Icon name="checkmark" size={20} color={Colors.accent} />
              </View>
            )}
          </TouchableOpacity>

          {/* PIN Option */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedOption === 'pin' && styles.optionCardSelected
            ]}
            onPress={() => handleOptionSelect('pin')}
          >
            <View style={styles.optionIconContainer}>
              <Text style={[
                styles.pinIcon,
                { color: selectedOption === 'pin' ? Colors.accent : Colors.text.primary }
              ]}>
                123
              </Text>
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>6-digit PIN</Text>
              <Text style={styles.optionDescription}>
                Create a secure PIN for quick sign-in
              </Text>
            </View>
            {selectedOption === 'pin' && (
              <View style={styles.checkmark}>
                <Icon name="checkmark" size={20} color={Colors.accent} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Haptic Feedback Toggle */}
        {Platform.OS === 'ios' && (
          <TouchableOpacity style={styles.hapticToggle} onPress={toggleHaptic}>
            <Text style={styles.hapticLabel}>Haptic feedback</Text>
            <View style={[styles.toggle, hapticEnabled && styles.toggleActive]}>
              <View style={[styles.toggleThumb, hapticEnabled && styles.toggleThumbActive]} />
            </View>
          </TouchableOpacity>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="Continue"
            onPress={handleContinue}
            disabled={!selectedOption}
            style={styles.continueButton}
          />
          
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Set up later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Layout.sectionMargin,
    justifyContent: 'center',
    maxWidth: Layout.maxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  
  // Header section
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl * 1.5,
  },
  title: {
    fontSize: Typography.fontSize.h1,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.md,
  },
  
  // Options container
  optionsContainer: {
    marginBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  
  // Option cards
  optionCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.cardPadding,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.card,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 80,
  },
  optionCardSelected: {
    borderColor: Colors.accent,
    borderWidth: 2,
  },
  
  optionIconContainer: {
    width: 56,
    height: 56,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  
  pinIcon: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily,
  },
  
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  optionDescription: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  
  checkmark: {
    width: 32,
    height: 32,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  
  // Haptic toggle
  hapticToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
  },
  hapticLabel: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily,
    color: Colors.text.primary,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: Colors.text.primary,  // Black background
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.background,
    ...Shadows.card,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  
  // Action buttons
  actions: {
    gap: Spacing.lg,
  },
  continueButton: {
    width: '100%',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  skipText: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily,
    color: Colors.text.secondary,
  },
});