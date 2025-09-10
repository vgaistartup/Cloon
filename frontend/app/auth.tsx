import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '@/components/Screen';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { AuthService } from '@/services/auth';
import { Colors, Typography, Spacing } from '@/constants/theme';

export default function AuthScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);

  const validatePhoneNumber = (phone: string) => {
    // Simple validation for demo - accepts any 10+ digit number
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10;
  };

  const handleSendOTP = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await AuthService.sendOTP(phoneNumber);
      if (response.success) {
        setStep('otp');
        Alert.alert('OTP Sent', response.message);
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to send OTP');
    } finally {
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
      const response = await AuthService.verifyOTP(phoneNumber, otpCode);
      if (response.success) {
        router.replace('/dashboard');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('phone');
    setOtpCode('');
  };

  return (
    <Screen style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome</Text>
            <Text style={styles.subtitle}>
              {step === 'phone' 
                ? 'Enter your phone number to continue'
                : 'Enter the OTP sent to your phone'
              }
            </Text>
          </View>

          <View style={styles.form}>
            {step === 'phone' ? (
              <>
                <Input
                  label="Phone Number"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="+1 (555) 123-4567"
                  keyboardType="phone-pad"
                  autoComplete="tel"
                />
                <Button
                  title="Send OTP"
                  onPress={handleSendOTP}
                  loading={loading}
                  style={styles.button}
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
                  style={styles.button}
                />
                <Button
                  title="Back"
                  onPress={handleBack}
                  variant="outline"
                  style={styles.backButton}
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
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  button: {
    marginTop: Spacing.lg,
  },
  backButton: {
    marginTop: Spacing.md,
  },
});