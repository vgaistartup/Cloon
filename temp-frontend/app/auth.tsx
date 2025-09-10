import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '@/components/Screen';
import Input from '@/components/Input';
import Button from '@/components/Button';
import PhoneInput from '@/components/PhoneInput';
import { AuthService } from '@/services/auth';
import { Colors, Typography, Spacing, Layout } from '@/constants/theme';

export default function AuthScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);

  const validatePhoneNumber = (phone: string) => {
    // Validate exactly 10 digits (no formatting)
    return phone.length === 10 && /^\d{10}$/.test(phone);
  };

  // Check if phone number is complete for button state
  const isPhoneComplete = phoneNumber.length === 10 && /^\d{10}$/.test(phoneNumber);
  
  // Check if OTP is complete for button state
  const isOtpComplete = otpCode.length === 6;

  const handleSendOTP = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      // Mock OTP functionality for demo - always succeeds
      setTimeout(() => {
        setStep('otp');
        Alert.alert('OTP Sent', 'Your verification code is: 123456 (Demo mode)');
        setLoading(false);
      }, 1000);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to send OTP');
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length < 4) {
      Alert.alert('Invalid OTP', 'Please enter the complete OTP');
      return;
    }

    setLoading(true);
    try {
      // Mock OTP verification - accepts 123456 or any 6-digit code
      setTimeout(() => {
        if (otpCode === '123456' || otpCode.length === 6) {
          router.replace('/biometric-setup');
        } else {
          Alert.alert('Invalid OTP', 'Please enter 123456 for demo mode');
        }
        setLoading(false);
      }, 1000);
    } catch (error: any) {
      Alert.alert('Error', 'Verification failed');
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('phone');
    setOtpCode('');
  };

  return (
    <Screen style={styles.container} padding={false}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Minimal header with generous spacing */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome</Text>
            <Text style={styles.subtitle}>
              {step === 'phone' 
                ? 'Enter your phone number to continue'
                : 'Enter the OTP sent to your phone'
              }
            </Text>
          </View>

          {/* Clean form with breathing space */}
          <View style={styles.form}>
            {step === 'phone' ? (
              <>
                <PhoneInput
                  label="Phone Number"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="Phone Number"
                />
                <Button
                  title="Send OTP"
                  onPress={handleSendOTP}
                  loading={loading}
                  disabled={!isPhoneComplete}
                  style={styles.primaryButton}
                />
              </>
            ) : (
              <>
                <Input
                  label="OTP Code"
                  value={otpCode}
                  onChangeText={setOtpCode}
                  placeholder="Enter 6-digit code"
                  keyboardType="number-pad"
                  maxLength={6}
                  autoComplete="sms-otp"
                />
                <Button
                  title="Verify OTP"
                  onPress={handleVerifyOTP}
                  loading={loading}
                  disabled={!isOtpComplete}
                  style={styles.primaryButton}
                />
                <Button
                  title="Back"
                  onPress={handleBack}
                  variant="secondary"
                  style={styles.secondaryButton}
                />
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,     // Pure white background
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Layout.sectionMargin, // 32px generous margins
    justifyContent: 'center',
    maxWidth: Layout.maxContentWidth,        // Max 960px constraint
    alignSelf: 'center',
    width: '100%',
  },
  
  // Minimal header with generous spacing
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl * 1.5,        // Extra breathing space
  },
  title: {
    fontSize: Typography.fontSize.h1,        // 30px page title
    fontWeight: Typography.fontWeight.semibold, // SemiBold weight
    fontFamily: Typography.fontFamily,       // Inter typeface
    color: Colors.text.primary,              // Pure black
    marginBottom: Spacing.lg,                // 24px spacing
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.fontSize.body,      // 17px body text
    fontFamily: Typography.fontFamily,       // Inter typeface
    color: Colors.text.secondary,            // Neutral gray #6E6E73
    textAlign: 'center',
    lineHeight: 24,                          // Simple line height
    paddingHorizontal: Spacing.md,
  },
  
  // Clean form with proper spacing
  form: {
    width: '100%',
  },
  primaryButton: {
    marginTop: Spacing.lg,                   // 24px section margin
  },
  disabledButton: {
    backgroundColor: Colors.border,          // Light gray when disabled
    opacity: 0.6,
  },
  secondaryButton: {
    marginTop: Spacing.md,
  },
});