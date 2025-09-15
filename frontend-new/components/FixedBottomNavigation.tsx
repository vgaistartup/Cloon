import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
// When used as a custom tabBar, expo-router passes BottomTabBarProps
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';

interface TabItemProps {
  name: string;
  isActive: boolean;
  onPress: () => void;
}

const renderTabIcon = (name: string, isActive: boolean) => {
  const color = isActive ? Colors.text.primary : '#262626';
  const size = 26; // keep constant; let Animated scale provide emphasis

  let iconName: keyof typeof Ionicons.glyphMap;

  switch (name) {
    case 'explore':
      iconName = isActive ? 'search' : 'search-outline';
      break;
    case 'avatar':
      iconName = isActive ? 'person' : 'person-outline';
      break;
    case 'closet':
      iconName = isActive ? 'shirt' : 'shirt-outline';
      break;
    case 'wardrobenew':
      iconName = isActive ? 'shirt' : 'shirt-outline';
      break;
    case 'profile':
      iconName = isActive ? 'person-circle' : 'person-circle-outline';
      break;
    default:
      iconName = 'ellipse-outline';
  }

  return <Ionicons name={iconName} size={size} color={color} />;
};

const TabItem: React.FC<TabItemProps> = ({ name, isActive, onPress }) => {
  const scale = useRef(new Animated.Value(isActive ? 1 : 0.95)).current;
  useEffect(() => {
    Animated.spring(scale, {
      toValue: isActive ? 1.08 : 0.95,
      friction: 6,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, [isActive]);

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => {
        Animated.spring(scale, {
          toValue: 0.92,
          friction: 6,
          tension: 120,
          useNativeDriver: true,
        }).start();
      }}
      onPressOut={() => {
        Animated.spring(scale, {
          toValue: isActive ? 1.08 : 0.95,
          friction: 6,
          tension: 120,
          useNativeDriver: true,
        }).start();
      }}
      style={styles.tabItem}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {renderTabIcon(name, isActive)}
      </Animated.View>
    </TouchableOpacity>
  );
};

const FixedBottomNavigation: React.FC<BottomTabBarProps> = ({ state, navigation, insets }) => {
  // Route names should match files under app/(tabs)/
  const tabs = state.routes.map((r) => r.name);

  const handlePress = (routeKey: string, routeName: string, isFocused: boolean) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: routeKey,
      canPreventDefault: true,
    });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(routeName as never);
    }
  };

  return (
    <View
      style={[
        styles.blurContainer,
        // Slightly reduce safe-area padding similar to Instagram while keeping the home indicator clear
        { paddingBottom: Math.max((insets?.bottom || 0) - 4, 8) },
      ]}
    >
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const isActive = state.index === index;
          const routeName = (route.name as string).toLowerCase();
          const supported = ['explore', 'avatar', 'closet', 'profile'] as const;
          const name = (supported.includes(routeName as any) ? routeName : 'explore') as typeof supported[number];
          return (
            <TabItem
              key={route.key}
              name={name}
              isActive={isActive}
              onPress={() => handlePress(route.key, route.name as string, isActive)}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  blurContainer: {
    // As a custom tabBar we return a normal view (Tabs anchors it at bottom)
    overflow: 'hidden',
  backgroundColor: '#FFFFFF',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  height: 60,
  backgroundColor: '#FFFFFF',
  borderTopWidth: 0.5,
  borderTopColor: 'rgba(0, 0, 0, 0.08)',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  paddingVertical: Spacing.xs,
  },
});

export default FixedBottomNavigation;
