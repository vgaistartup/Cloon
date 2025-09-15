import React from 'react';
import { TextInput, Text, View, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Spacing, Typography, Layout } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export default function Input({
  label,
  error,
  containerStyle,
  style,
  ...props
}: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={Colors.text.secondary}  // #6E6E73 per design system
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  label: {
    fontSize: Typography.fontSize.body,       // 17px default text
    fontWeight: Typography.fontWeight.medium, // Medium weight
    fontFamily: Typography.fontFamily,        // Inter typeface
    color: Colors.text.primary,               // Black text
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,               // Light gray #E5E5EA
    borderRadius: BorderRadius.xl,            // Rounded rectangles
    paddingHorizontal: Spacing.inputPadding,  // 16px padding
    paddingVertical: Spacing.inputPadding,    // 16px padding
    fontSize: Typography.fontSize.body,       // 17px body text
    fontFamily: Typography.fontFamily,        // Inter typeface
    color: Colors.text.primary,               // Black text
    backgroundColor: Colors.background,       // White background
    minHeight: Layout.minTouchTarget,         // 44px minimum
  },
  inputError: {
    borderColor: Colors.error,                // Red border for errors
  },
  error: {
    fontSize: Typography.fontSize.caption,    // 13px caption
    fontFamily: Typography.fontFamily,        // Inter typeface
    color: Colors.error,                      // Red text
    marginTop: Spacing.xs,
    lineHeight: 18,                           // Simple line height
  },
});