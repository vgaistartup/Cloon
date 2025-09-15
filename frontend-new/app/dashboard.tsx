import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, Pressable, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '@/components/Screen';
import { Colors, Typography, Spacing } from '@/constants/theme';
import CloonHeader, { HeaderIcon, HeaderSpace } from '@/components/CloonHeader';

export default function DashboardScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [scrolled, setScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [badgeCount] = useState<number>(3); // example unread notifications

  const handleScroll = (e: any) => {
    const y = e.nativeEvent.contentOffset?.y ?? 0;
    if (!scrolled && y > 1) setScrolled(true);
    if (scrolled && y <= 1) setScrolled(false);
  };

  const wordmark = (
    <TouchableOpacity
      onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
      onLongPress={() => router.push('/about')}
      accessibilityLabel="Cloon, tap to scroll to top, long press for about"
      style={styles.wordmarkHit}
    >
      <Text style={styles.wordmark}>Cloon</Text>
    </TouchableOpacity>
  );

  const right = (
    <View style={{ flexDirection: 'row' }}>
      <HeaderIcon
        name="search-outline"
        accessibilityLabel="Search"
        onPress={() => router.push('/search')}
        pulseOnMount
      />
      <HeaderIcon
        name={badgeCount > 0 ? 'notifications' : 'notifications-outline'}
        accessibilityLabel="Notifications"
        onPress={() => setShowNotifications(true)}
        badgeCount={badgeCount}
      />
    </View>
  );

  return (
    <Screen>
      <CloonHeader theme="light" scrolled={scrolled} left={wordmark} center={<HeaderSpace />} right={right} />
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Discover</Text>
          {/* ...existing content... */}
        </View>
      </ScrollView>

      {/* Simple notifications bottom sheet */}
      <Modal transparent visible={showNotifications} animationType="slide" onRequestClose={() => setShowNotifications(false)}>
        <Pressable style={styles.sheetOverlay} onPress={() => setShowNotifications(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Notifications</Text>
          <View style={{ height: 8 }} />
          <Text style={styles.sheetItem}>• Welcome to Cloon!</Text>
          <Text style={styles.sheetItem}>• Your avatar is ready.</Text>
          <Text style={styles.sheetItem}>• New styles in your size.</Text>
          <View style={{ height: Spacing.lg }} />
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.h1,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  wordmark: {
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  wordmarkHit: {
    minWidth: 60,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  sheetOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 48,
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    marginBottom: Spacing.md,
  },
  sheetTitle: {
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
  },
  sheetItem: {
    fontSize: Typography.fontSize.body,
    marginVertical: 4,
  },
});