import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function clamp(min: number, value: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

export default function ChevronTile({ queueLength, screenWidth, onPress }: { queueLength: number, screenWidth: number, onPress: () => void }) {
  const thumbSize = 96;
  const gap = 12;
  const padding = 16;
  const chevronWidth = clamp(48, screenWidth - (padding * 2) - (thumbSize * 3) - (gap * 2), 72);
  return (
    <TouchableOpacity
      style={[styles.chevronCard, { width: chevronWidth }]} 
      activeOpacity={0.8}
      onPressIn={e => e.target && e.target.setNativeProps({ style: { transform: [{ scale: 0.98 }] } })}
      onPressOut={e => e.target && e.target.setNativeProps({ style: { transform: [{ scale: 1 }] } })}
      onPress={onPress}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="chevron-up-outline" size={18} color="rgba(17,17,17,0.7)" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chevronCard: {
    height: 96,
    borderRadius: 6,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 0,
    marginRight: 0,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
