import React from 'react';
import { Tabs } from 'expo-router';
import BottomNavigation from '@/components/BottomNavigation';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="wardrobe" />
      <Tabs.Screen name="avatar" />
      <Tabs.Screen name="closet" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}