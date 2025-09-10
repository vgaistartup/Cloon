import React from 'react';
import { Text, StyleSheet, Platform } from 'react-native';
import { Colors } from '@/constants/theme';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

// Unicode icon mapping for reliable cross-platform display
const iconMap: { [key: string]: string } = {
  // Navigation icons
  'arrow-back': '←',
  'chevron-down': '▼',
  'chevron-up': '▲',
  'chevron-left': '◀',
  'chevron-right': '▶',
  
  // Tab navigation icons
  'search': '⌕',
  'shirt': '👔',
  'user-square': '⬜',
  'grid-2x2': '⊞',
  'user-circle': '⭕',
  
  // Alternative tab icons (more readable)
  'explore': '○',
  'wardrobe': '□',
  'avatar': '△',
  'closet': '⬚',
  'profile': '●',
  
  // Action icons
  'close': '✕',
  'checkmark': '✓',
  'add': '+',
  'remove': '−',
  
  // Common icons
  'camera': '📷',
  'camera-outline': '📷',
  'images': '🖼',
  'person': '👤',
  'person-outline': '👤',
  'log-out-outline': '⇥',
  
  // Status icons
  'heart': '♥',
  'heart-outline': '♡',
  'star': '★',
  'star-outline': '☆',
  
  // System icons
  'menu': '☰',
  'settings': '⚙',
  'home': '🏠',
  'notifications-outline': '🔔',
  'notifications': '🔔',
  'bookmark-outline': '🔖',
  'bookmark': '🔖',
  'share-outline': '📤',
  'grid-outline': '⊞',
};

export default function Icon({ name, size = 20, color = Colors.text.primary, style }: IconProps) {
  const iconCharacter = iconMap[name] || '?';
  
  return (
    <Text 
      style={[
        styles.icon,
        { 
          fontSize: size, 
          color: color,
          lineHeight: size * 1.2, // Ensure proper vertical alignment
        },
        style
      ]}
    >
      {iconCharacter}
    </Text>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontWeight: 'normal',
    textAlign: 'center',
    // Ensure consistent rendering across platforms
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
});

// For backward compatibility and easier usage
export const IconNames = {
  ARROW_BACK: 'arrow-back',
  CHEVRON_DOWN: 'chevron-down',
  CHEVRON_UP: 'chevron-up',
  CLOSE: 'close',
  CHECKMARK: 'checkmark',
  CAMERA: 'camera',
  CAMERA_OUTLINE: 'camera-outline',
  IMAGES: 'images',
  PERSON: 'person',
  PERSON_OUTLINE: 'person-outline',
  LOG_OUT: 'log-out-outline',
  MENU: 'menu',
  SETTINGS: 'settings',
  SEARCH: 'search',
  HOME: 'home',
} as const;