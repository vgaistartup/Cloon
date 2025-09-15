import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '@/components/Screen';
import Button from '@/components/Button';
import Icon from '@/components/Icon';
import { Colors, Typography, Spacing, BorderRadius, Layout } from '@/constants/theme';

export default function PinSetupScreen() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'create' | 'confirm'>('create');

  const handleNumberPress = (digit: string) => {
    // Haptic feedback
    if (Platform.OS === 'ios') {
      Vibration.vibrate([10]);
    }
    
    if (step === 'create' && pin.length < 6) {
      setPin(prev => prev + digit);
    } else if (step === 'confirm' && confirmPin.length < 6) {
      setConfirmPin(prev => prev + digit);
    }
  };

  const handleBackspace = () => {
    if (step === 'create') {
      setPin(prev => prev.slice(0, -1));
    } else {
      setConfirmPin(prev => prev.slice(0, -1));
    }
  };

  useEffect(() => {
    if (step === 'create' && pin.length === 6) {
      setTimeout(() => setStep('confirm'), 300);
    } else if (step === 'confirm' && confirmPin.length === 6) {
      if (pin === confirmPin) {
        setTimeout(() => router.push('/(tabs)/explore'), 300);
      } else {
        // Reset and try again
        setTimeout(() => {
          setConfirmPin('');
          setStep('create');
          setPin('');
        }, 500);
      }
    }
  }, [pin, confirmPin, step]);

  const renderPinDots = (currentPin: string) => (
    <View style={styles.pinDots}>
      {[...Array(6)].map((_, index) => (
        <View
          key={index}
          style={[
            styles.pinDot,
            index < currentPin.length && styles.pinDotFilled
          ]}
        />
      ))}
    </View>
  );

  const renderNumberPad = () => (
    <View style={styles.numberPad}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => (
        <TouchableOpacity
          key={number}
          style={styles.numberButton}
          onPress={() => handleNumberPress(number.toString())}
        >
          <Text style={styles.numberText}>{number}</Text>
        </TouchableOpacity>
      ))}
      <View style={styles.numberButton} />
      <TouchableOpacity
        style={styles.numberButton}
        onPress={() => handleNumberPress('0')}
      >
        <Text style={styles.numberText}>0</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.numberButton}
        onPress={handleBackspace}
      >
        <Icon name="arrow-back" size={24} color={Colors.text.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <Screen style={styles.container} padding={false}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.main}>
          <Text style={styles.title}>
            {step === 'create' ? 'Create your PIN' : 'Confirm your PIN'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'create' 
              ? 'Enter a 6-digit PIN for quick sign-in'
              : 'Re-enter your PIN to confirm'
            }
          </Text>

          {renderPinDots(step === 'create' ? pin : confirmPin)}
          {renderNumberPad()}
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
  },
  header: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  backButton: {
    padding: Spacing.sm,
    alignSelf: 'flex-start',
  },
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.fontSize.h1,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  pinDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.xxl * 1.5,
    gap: Spacing.lg,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  pinDotFilled: {
    backgroundColor: Colors.text.primary,  // Black background
    borderColor: Colors.accent,
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 240,
    gap: Spacing.lg,
  },
  numberButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: 24,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily,
    color: Colors.text.primary,
  },
});