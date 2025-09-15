import React from 'react';
import { Tabs } from 'expo-router';
import FixedBottomNavigation from '@/components/FixedBottomNavigation';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <FixedBottomNavigation {...props} />}
    >
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="closet" />
      <Tabs.Screen name="avatar" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}