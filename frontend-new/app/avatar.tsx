import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Screen from '@/components/Screen';
import { Typography } from '@/constants/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function AvatarScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (params.build === '1') {
      // Redirect to the tabbed avatar route which shows build animation
      router.replace({ pathname: '/(tabs)/avatar', params: { build: '1' } });
    }
  }, [params.build]);

  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>Avatar</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.fontSize.h1,
  },
});
