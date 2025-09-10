import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform, Animated } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Colors, Typography, Spacing, Shadows } from '@/constants/theme';

// Optional haptics import with fallback
let Haptics: any;
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = {
    impactAsync: () => {},
    ImpactFeedbackStyle: { Light: 'light' }
  };
}

interface TabItemProps {
  name: string;
  label: string;
  route: string;
  isActive: boolean;
  onPress: () => void;
}

// Premium micro-interactions with spring animations
const TabIcon = ({ name, isActive }: { name: string; isActive: boolean }) => {
  const scaleAnim = useRef(new Animated.Value(isActive ? 1 : 0.95)).current;
  const opacityAnim = useRef(new Animated.Value(isActive ? 1 : 0.6)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isActive ? 1 : 0.95,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(opacityAnim, {
        toValue: isActive ? 1 : 0.6,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isActive]);
  
  const strokeWidth = isActive ? 2.5 : 1.5;
  const color = isActive ? '#000000' : '#8E8E93';
  const size = 26;

  switch (name) {
    case 'explore':
      // Perfect magnifying glass
      const exploreIcon = (
        <>
          <View 
            style={[
              styles.searchCircle,
              {
                width: size * 0.55,
                height: size * 0.55,
                borderRadius: size * 0.275,
                borderWidth: strokeWidth,
                borderColor: color,
              }
            ]}
          />
          <View 
            style={[
              styles.searchHandle,
              {
                width: strokeWidth,
                height: size * 0.28,
                backgroundColor: color,
                position: 'absolute',
                top: size * 0.6,
                left: size * 0.6,
                transform: [{ rotate: '45deg' }],
                borderRadius: strokeWidth / 2,
              }
            ]}
          />
        </>
      );
      return exploreIcon;

    case 'wardrobe':
      // Clean t-shirt outline
      return (
        <View style={styles.iconContainer}>
          {/* T-shirt body */}
          <View 
            style={[
              styles.tshirtBody,
              {
                width: size * 0.6,
                height: size * 0.65,
                borderWidth: strokeWidth,
                borderColor: color,
                borderRadius: 3,
              }
            ]}
          />
          {/* Left sleeve */}
          <View 
            style={[
              styles.tshirtSleeve,
              {
                width: size * 0.25,
                height: size * 0.35,
                borderWidth: strokeWidth,
                borderColor: color,
                borderRadius: 2,
                position: 'absolute',
                left: size * 0.05,
                top: size * 0.08,
              }
            ]}
          />
          {/* Right sleeve */}
          <View 
            style={[
              styles.tshirtSleeve,
              {
                width: size * 0.25,
                height: size * 0.35,
                borderWidth: strokeWidth,
                borderColor: color,
                borderRadius: 2,
                position: 'absolute',
                right: size * 0.05,
                top: size * 0.08,
              }
            ]}
          />
          {/* Neckline */}
          <View 
            style={[
              styles.tshirtNeck,
              {
                width: size * 0.3,
                height: size * 0.15,
                borderBottomWidth: strokeWidth,
                borderLeftWidth: strokeWidth,
                borderRightWidth: strokeWidth,
                borderColor: color,
                borderBottomLeftRadius: size * 0.15,
                borderBottomRightRadius: size * 0.15,
                position: 'absolute',
                top: size * 0.08,
                alignSelf: 'center',
              }
            ]}
          />
        </View>
      );

    case 'avatar':
      // Person in square frame
      return (
        <View style={styles.iconContainer}>
          <View 
            style={[
              styles.avatarFrame,
              {
                width: size * 0.75,
                height: size * 0.75,
                borderWidth: strokeWidth,
                borderColor: color,
                borderRadius: 4,
              }
            ]}
          >
            {/* Person head */}
            <View 
              style={[
                styles.personHead,
                {
                  width: size * 0.2,
                  height: size * 0.2,
                  borderRadius: size * 0.1,
                  borderWidth: strokeWidth,
                  borderColor: color,
                  marginTop: size * 0.08,
                }
              ]}
            />
            {/* Person body */}
            <View 
              style={[
                styles.personBody,
                {
                  width: size * 0.35,
                  height: size * 0.28,
                  borderTopWidth: strokeWidth,
                  borderLeftWidth: strokeWidth,
                  borderRightWidth: strokeWidth,
                  borderColor: color,
                  borderTopLeftRadius: size * 0.175,
                  borderTopRightRadius: size * 0.175,
                  marginTop: size * 0.05,
                }
              ]}
            />
          </View>
        </View>
      );

    case 'closet':
      // 2x2 grid
      return (
        <View style={styles.iconContainer}>
          <View style={styles.gridContainer}>
            {/* Top row */}
            <View style={styles.gridRow}>
              <View 
                style={[
                  styles.gridSquare,
                  {
                    width: size * 0.32,
                    height: size * 0.32,
                    borderWidth: strokeWidth,
                    borderColor: color,
                    borderRadius: 2,
                  }
                ]}
              />
              <View 
                style={[
                  styles.gridSquare,
                  {
                    width: size * 0.32,
                    height: size * 0.32,
                    borderWidth: strokeWidth,
                    borderColor: color,
                    borderRadius: 2,
                    marginLeft: size * 0.08,
                  }
                ]}
              />
            </View>
            {/* Bottom row */}
            <View style={[styles.gridRow, { marginTop: size * 0.08 }]}>
              <View 
                style={[
                  styles.gridSquare,
                  {
                    width: size * 0.32,
                    height: size * 0.32,
                    borderWidth: strokeWidth,
                    borderColor: color,
                    borderRadius: 2,
                  }
                ]}
              />
              <View 
                style={[
                  styles.gridSquare,
                  {
                    width: size * 0.32,
                    height: size * 0.32,
                    borderWidth: strokeWidth,
                    borderColor: color,
                    borderRadius: 2,
                    marginLeft: size * 0.08,
                  }
                ]}
              />
            </View>
          </View>
        </View>
      );

    case 'profile':
      // Person in circle
      return (
        <View style={styles.iconContainer}>
          <View 
            style={[
              styles.profileCircle,
              {
                width: size * 0.75,
                height: size * 0.75,
                borderRadius: size * 0.375,
                borderWidth: strokeWidth,
                borderColor: color,
              }
            ]}
          >
            {/* Person head */}
            <View 
              style={[
                styles.personHead,
                {
                  width: size * 0.2,
                  height: size * 0.2,
                  borderRadius: size * 0.1,
                  borderWidth: strokeWidth,
                  borderColor: color,
                  marginTop: size * 0.08,
                }
              ]}
            />
            {/* Person body */}
            <View 
              style={[
                styles.personBody,
                {
                  width: size * 0.35,
                  height: size * 0.28,
                  borderTopWidth: strokeWidth,
                  borderLeftWidth: strokeWidth,
                  borderRightWidth: strokeWidth,
                  borderColor: color,
                  borderTopLeftRadius: size * 0.175,
                  borderTopRightRadius: size * 0.175,
                  marginTop: size * 0.05,
                }
              ]}
            />
          </View>
        </View>
      );

    default:
      return <View style={styles.iconContainer} />;
  }
};

const TabItem = ({ name, label, route, isActive, onPress }: TabItemProps) => {
  const labelOpacity = useRef(new Animated.Value(isActive ? 1 : 0.7)).current;
  const labelScale = useRef(new Animated.Value(isActive ? 1 : 0.95)).current;
  const backgroundOpacity = useRef(new Animated.Value(isActive ? 1 : 0)).current;
  const backgroundScale = useRef(new Animated.Value(isActive ? 1 : 0.8)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(labelOpacity, {
        toValue: isActive ? 1 : 0.7,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(labelScale, {
        toValue: isActive ? 1 : 0.95,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(backgroundOpacity, {
        toValue: isActive ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(backgroundScale, {
        toValue: isActive ? 1 : 0.8,
        useNativeDriver: true,
        tension: 300,
        friction: 12,
      }),
    ]).start();
  }, [isActive]);
  
  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Premium selected background */}
      <Animated.View 
        style={[
          styles.selectedBackground,
          {
            opacity: backgroundOpacity,
            transform: [{ scale: backgroundScale }],
          }
        ]} 
      />
      
      <TabIcon name={name} isActive={isActive} />
      <Animated.Text 
        style={[
          styles.tabLabel,
          { 
            color: isActive ? '#000000' : '#8E8E93',
            fontWeight: isActive ? '600' : '500',
            opacity: labelOpacity,
            transform: [{ scale: labelScale }],
          }
        ]}
      >
        {label}
      </Animated.Text>
      
      {/* Premium active indicator dot */}
      {isActive && (
        <Animated.View 
          style={[
            styles.activeIndicator,
            {
              opacity: labelOpacity,
              transform: [{ scale: labelScale }],
            }
          ]} 
        />
      )}
    </TouchableOpacity>
  );
};

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { name: 'explore', label: 'Explore', route: '/(tabs)/explore' },
    { name: 'wardrobe', label: 'Wardrobe', route: '/(tabs)/wardrobe' },
    { name: 'avatar', label: 'Avatar', route: '/(tabs)/avatar' },
    { name: 'closet', label: 'Closet', route: '/(tabs)/closet' },
    { name: 'profile', label: 'Profile', route: '/(tabs)/profile' },
  ];

  const handleTabPress = (route: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(route as any);
  };

  return (
    <View style={[styles.container, { position: 'absolute', bottom: 0, left: 0, right: 0 }]}>
      {/* Premium background blur */}
      <View style={styles.blurBackdrop} />
      
      {/* Content */}
      <View style={styles.content}>
        {tabs.map((tab) => (
          <TabItem
            key={tab.name}
            name={tab.name}
            label={tab.label}
            route={tab.route}
            isActive={pathname === tab.route}
            onPress={() => handleTabPress(tab.route)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: 'transparent',
  },
  
  blurBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderTopWidth: 0.33,
    borderTopColor: 'rgba(0, 0, 0, 0.04)',
  },
  
  content: {
    flexDirection: 'row',
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 12,
    paddingHorizontal: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -0.5 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 0,
  },

  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  selectedBackground: {
    position: 'absolute',
    top: 2,
    left: 8,
    right: 8,
    bottom: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 10,
  },

  tabLabel: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : Typography.fontFamily,
    marginTop: 6,
    letterSpacing: -0.08,
    textAlign: 'center',
  },
  
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#000000',
  },

  // Icon container
  iconContainer: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  // Search icon styles
  searchCircle: {
    backgroundColor: 'transparent',
  },
  searchHandle: {
    // Positioned absolutely in the icon
  },

  // T-shirt icon styles
  tshirtBody: {
    backgroundColor: 'transparent',
  },
  tshirtSleeve: {
    backgroundColor: 'transparent',
  },
  tshirtNeck: {
    backgroundColor: 'transparent',
  },

  // Avatar/Profile icon styles
  avatarFrame: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  profileCircle: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  personHead: {
    backgroundColor: 'transparent',
  },
  personBody: {
    backgroundColor: 'transparent',
  },

  // Grid icon styles
  gridContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridRow: {
    flexDirection: 'row',
  },
  gridSquare: {
    backgroundColor: 'transparent',
  },
});