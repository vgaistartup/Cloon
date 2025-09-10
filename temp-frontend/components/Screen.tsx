import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Layout } from '@/constants/theme';

interface ScreenProps {
  children: React.ReactNode;
  style?: object;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  padding?: boolean;  // Whether to add screen padding
}

export default function Screen({ 
  children, 
  style,
  edges = ['top', 'bottom'],
  padding = true
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  
  const paddingTop = edges.includes('top') ? insets.top : 0;
  const paddingBottom = edges.includes('bottom') ? insets.bottom : 0;
  const paddingLeft = edges.includes('left') ? insets.left : 0;
  const paddingRight = edges.includes('right') ? insets.right : 0;

  return (
    <View 
      style={[
        styles.container,
        {
          paddingTop,
          paddingBottom,
          paddingLeft,
          paddingRight,
        },
        padding && styles.withPadding,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,     // Pure white background
  },
  withPadding: {
    paddingHorizontal: Layout.screenPadding, // 20px screen padding
  },
});