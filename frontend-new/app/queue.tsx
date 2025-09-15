import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Layout, Spacing } from '@/constants/theme';

export default function QueueScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const count = Number(params.count || 0);
  const data = Array.from({ length: count }, (_, i) => ({ id: String(i + 1) }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Back" style={styles.backBtn}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Tried-On Queue</Text>
        <View style={{ width: 48 }} />
      </View>
      <FlatList
        data={data}
        keyExtractor={(it) => it.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.thumb} />
            <Text style={styles.rowText}>Item {item.id}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: Spacing.lg,
    paddingHorizontal: Layout.sectionMargin,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 48,
    height: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backText: { color: '#111', fontWeight: '700' },
  title: { fontSize: 18, fontWeight: '700', color: '#111' },
  list: { padding: Layout.sectionMargin },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  thumb: { width: 56, height: 56, borderRadius: 8, backgroundColor: '#E5E7EB', marginRight: 12 },
  rowText: { fontSize: 14, color: '#111', fontWeight: '600' },
});
