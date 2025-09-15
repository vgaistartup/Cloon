import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, Animated } from 'react-native';
import { Colors, BorderRadius, Spacing, Typography, Shadows, Animation, Layout } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const scaleAnim = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    variant === 'primary' && styles.shadow,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof styles],
    styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles],
    disabled && styles.textDisabled,
    textStyle,
  ];

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={buttonStyle}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'primary' ? Colors.background : Colors.text.primary} />
        ) : (
          <Text style={textStyles}>{title}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.xl,        // 16-20px rounded corners
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: Layout.minTouchTarget,     // 44px minimum tap target
  },
  
  // Button variants per Design System v1.0
  primary: {
    backgroundColor: Colors.text.primary,  // Black background
  },
  secondary: {
    backgroundColor: 'transparent',       // Outline style
    borderWidth: 1,
    borderColor: Colors.border,           // Light gray border #E5E5EA
  },
  tertiary: {
    backgroundColor: 'transparent',       // Text only
  },
  
  // Sizes with proper padding
  sm: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  md: {
    paddingHorizontal: Spacing.buttonPadding,  // 16px padding
    paddingVertical: 12,
  },
  lg: {
    paddingHorizontal: 24,
    paddingVertical: Spacing.buttonPadding,    // 16px padding
  },
  
  // Shadow for primary buttons (soft, diffuse)
  shadow: {
    ...Shadows.button,
  },
  
  disabled: {
    opacity: 0.5,
  },
  
  // Text styles
  text: {
    fontFamily: Typography.fontFamily,
    fontWeight: Typography.fontWeight.medium,  // Medium weight
    textAlign: 'center',
  },
  
  // Text colors per variant
  textPrimary: {
    color: Colors.background,             // White text on blue
  },
  textSecondary: {
    color: Colors.text.primary,           // Black text
  },
  textTertiary: {
    color: Colors.text.secondary,         // Gray text
  },
  
  // Text sizes
  textSm: {
    fontSize: 14,
  },
  textMd: {
    fontSize: Typography.fontSize.body,   // 17px default
  },
  textLg: {
    fontSize: 18,
  },
  
  textDisabled: {
    opacity: 0.7,
  },
});