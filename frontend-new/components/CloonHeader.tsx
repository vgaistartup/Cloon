import React, { useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, ColorValue, Animated, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/constants/theme';

export type HeaderTheme = 'light' | 'dark';

export interface CloonHeaderProps {
  theme?: HeaderTheme;
  height?: number; // 56–60pt
  scrolled?: boolean; // show divider when true
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
  style?: ViewStyle;
}

interface HeaderIconProps {
  name: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  accessibilityLabel: string;
  color?: ColorValue;
  size?: number;
  badgeCount?: number; // optional badge
  pulseOnMount?: boolean; // pulse once ~400ms on first render
}

export const HeaderIcon: React.FC<HeaderIconProps> = ({
  name,
  onPress,
  accessibilityLabel,
  color = Colors.text.primary,
  size = 24,
  badgeCount,
  pulseOnMount,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (pulseOnMount) {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.12, duration: 200, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [pulseOnMount, scale]);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={styles.iconButton}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons name={name} size={size} color={color as string} />
        {typeof badgeCount === 'number' && badgeCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeCount > 9 ? '9+' : badgeCount}</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

// Spacer for center alignment when needed
export const HeaderSpace: React.FC<{ width?: number } & React.ComponentProps<typeof View>> = ({ width = 0, style, ...rest }) => (
  <View style={[{ width, flex: width === 0 ? 1 : undefined }, style]} {...rest} />
);

export const CloonHeader: React.FC<CloonHeaderProps> = ({
  theme = 'light',
  height = Platform.OS === 'ios' ? 56 : 56,
  scrolled = false,
  left,
  center,
  right,
  style,
}) => {
  const palette = useMemo(() => {
    const background = theme === 'light' ? Colors.white : Colors.black;
    const foreground = theme === 'light' ? Colors.text.primary : Colors.white;
    const divider = Colors.border;
    return { background, foreground, divider };
  }, [theme]);

  return (
    <SafeAreaView edges={['top']} style={[{ backgroundColor: palette.background }, scrolled && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.divider }]}>
      <View style={[styles.container, { height }, style]}>
        <View style={styles.side}>{left}</View>
        <View style={styles.center}>{center ?? <HeaderSpace />}</View>
        <View style={styles.side}>{right}</View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  side: {
    minWidth: 60, // ensure room for at least one icon or wordmark
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    right: -2,
    top: -2,
    backgroundColor: Colors.accent,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
});

export default CloonHeader;
