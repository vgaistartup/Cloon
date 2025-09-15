import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, Pressable, FlatList, Image, StyleSheet, PanResponder, Dimensions, SafeAreaView, Share, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

export type TriedOnItem = {
  id: string;
  image: string;
  meta?: any;
};

interface TriedOnSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  items: TriedOnItem[];
  onApply: (item: TriedOnItem) => void;
  onDeleteSelected: (ids: string[]) => void;
  onShareSelected: (ids: string[]) => void;
}

const SHEET_MIN_HEIGHT = Math.round(Dimensions.get('window').height * 0.7);
const SHEET_MAX_HEIGHT = Dimensions.get('window').height;
const THUMB_SIZE = 104;
const GRID_GAP = 8;
const GRID_PAD = 16;

export default function TriedOnSheet({
  isOpen,
  onOpenChange,
  items,
  onApply,
  onDeleteSelected,
  onShareSelected,
}: TriedOnSheetProps) {
  const { width: containerWidth } = useWindowDimensions();
  const GRID_PAD = 16;
  const GRID_GAP = 8;
  const gridCols = 3;
  // Compute tile size based on container width
  const tileSize = Math.floor((containerWidth - 2 * GRID_PAD - 2 * GRID_GAP) / gridCols);

  const [selectionMode, setSelectionMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => {
        // Only set pan responder for downward gestures on the grabber
        return gesture.dy > 0 && Math.abs(gesture.dy) > 5;
      },
      onPanResponderMove: () => {},
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 80) {
          onOpenChange(false);
        }
      },
    })
  ).current;

  useEffect(() => {
    if (!isOpen) {
      setSelectionMode(false);
      setSelected([]);
    }
  }, [isOpen]);

  const handleThumbPress = (item: TriedOnItem) => {
    if (selectionMode) {
      setSelected((prev) => {
        const newSelected = prev.includes(item.id)
          ? prev.filter((id) => id !== item.id)
          : [...prev, item.id];

        // Automatically exit selection mode if no items are selected
        if (newSelected.length === 0) {
          setSelectionMode(false);
        }

        return newSelected;
      });
    } else {
      onApply(item);
      onOpenChange(false);
    }
  };

  const handleThumbLongPress = (item: TriedOnItem) => {
    if (!selectionMode) {
      setSelectionMode(true);
      setSelected([item.id]);
    } else {
      handleThumbPress(item);
    }
  };

  const handleDelete = () => {
    // Call the parent callback to permanently delete items
    onDeleteSelected(selected);
    // Reset selection state
    setSelected([]);
    setSelectionMode(false);
  };

  const handleShare = async () => {
    if (selected.length === 0) return;
    try {
      // For demo, share the first selected item's image URL
      const firstItem = items.find(item => item.id === selected[0]);
      if (firstItem) {
        await Share.share({
          message: firstItem.image,
          url: firstItem.image,
          title: 'Share Look',
        });
      }
    } catch (e) {
      // Optionally handle error
    }
    onShareSelected(selected);
  };

  const renderActionBar = () => (
    <View style={styles.actionBar}>
      <Text style={styles.selectLabel}>Select ({selected.length})</Text>
      <View style={styles.actionIcons}>
        <TouchableOpacity onPress={handleDelete} hitSlop={12}>
          <Ionicons name="trash-outline" size={28} color="#111" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare} hitSlop={12}>
          <Ionicons name="share-outline" size={28} color="#111" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Use actual items or empty array for proper empty state
  const displayItems = items;

  return (
    <Modal visible={isOpen} animationType="slide" transparent onRequestClose={() => onOpenChange(false)}>
      <View style={styles.modalContainer}>
        <Pressable style={styles.backdrop} onPress={() => onOpenChange(false)} />
        <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
          <View
            style={[
              styles.sheet,
              {
                height: SHEET_MIN_HEIGHT,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              },
            ]}
          >
          {/* Grabber */}
          <View style={styles.grabber} {...panResponder.panHandlers} />
          {selectionMode && renderActionBar()}
          <FlatList
            data={[...displayItems].reverse()}
            keyExtractor={(item) => item.id}
            numColumns={3}
            contentContainerStyle={{
              paddingLeft: GRID_PAD,
              paddingRight: GRID_PAD + 24, // Increased padding for better scroll indicator separation
              paddingTop: 16,
              paddingBottom: 24,
              rowGap: GRID_GAP,
            }}
            columnWrapperStyle={{ justifyContent: 'flex-start', gap: GRID_GAP }}
            style={{ flex: 1 }}
            contentInsetAdjustmentBehavior="never"
            scrollIndicatorInsets={{ left: 0, right: 24, top: 8, bottom: 12 }}
            getItemLayout={(_, index) => ({
              length: tileSize + GRID_GAP,
              offset: (tileSize + GRID_GAP) * index,
              index,
            })}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <Ionicons name="shirt-outline" size={48} color="#9CA3AF" />
                <Text style={styles.emptyTitle}>No tried-on items yet</Text>
                <Text style={styles.emptySubtitle}>Swipe right on outfits in your closet to add them here</Text>
              </View>
            )}
            renderItem={({ item }) => {
              const isSelected = selected.includes(item.id);
              return (
                <Pressable
                  style={[{
                    width: tileSize,
                    height: tileSize,
                    borderRadius: 8,
                    backgroundColor: '#F3F4F6',
                    overflow: 'hidden',
                    position: 'relative',
                  }, isSelected && styles.selectedThumb]}
                  onPress={() => handleThumbPress(item)}
                  onLongPress={() => handleThumbLongPress(item)}
                  hitSlop={8}
                >
                  <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%', borderRadius: 8 }} />
                  {selectionMode && isSelected && (
                    <View style={styles.checkmarkChip}>
                      <Ionicons name="checkmark" size={18} color="#fff" />
                    </View>
                  )}
                </Pressable>
              );
            }}
          />
        </View>
      </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: SHEET_MIN_HEIGHT,
    maxHeight: SHEET_MAX_HEIGHT,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginTop: 8,
    marginBottom: 12,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 40,
    marginBottom: 8,
  },
  selectLabel: {
    fontSize: 14,
    color: '#111',
    fontWeight: '500',
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  grid: {
    flex: 1,
  },
  gridContent: {
    paddingLeft: GRID_PAD,
    paddingRight: GRID_PAD,
    paddingTop: 16,
    paddingBottom: 24,
    gap: GRID_GAP,
  },
  thumbWrap: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
    position: 'relative',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  selectedThumb: {
    borderWidth: 2,
    borderColor: '#111',
  },
  checkmarkChip: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(17,17,17,0.8)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#111',
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  exploreBtn: {
    marginTop: 16,
    backgroundColor: '#111',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  exploreBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});
