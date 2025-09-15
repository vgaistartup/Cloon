import React, { useEffect, useMemo, useState, useRef } from 'react';
import TriedOnSheet, { TriedOnItem } from '@/components/TriedOnSheet';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, Platform, ActionSheetIOS, ActivityIndicator, FlatList, Image, Modal, Pressable, ScrollView, Share, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Layout, Shadows } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Screen from '@/components/Screen';
import * as ImagePicker from 'expo-image-picker';
import ChevronTile from '@/components/ChevronTile';
import { useTriedOnQueue } from '@/contexts/TriedOnQueueContext';

// Optional haptics import with fallback
let Haptics: any;
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = {
    impactAsync: () => {},
    ImpactFeedbackStyle: { Light: 0, Medium: 1 }
  };
}

type AvatarState = 'empty' | 'exists' | 'loading' | 'error';

interface ClosetBottomSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  items: Array<{id: string, image: string, name?: string, inQueue?: boolean}>;
  onItemTap: (item: {id: string, image: string, name?: string, inQueue?: boolean}) => void;
  onItemLongPress: (item: {id: string, image: string, name?: string, inQueue?: boolean}) => void;
  onUpload: () => void;
  selectionMode?: boolean;
  selectedItems?: Set<string>;
  onBatchAddToQueue?: () => void;
  onBatchDelete?: () => void;
  onBatchPost?: () => void;
  onExitSelectionMode?: () => void;
}

interface LongPressActionBarProps {
  visible: boolean;
  onClose: () => void;
  onAddToQueue: () => void;
  onPost: () => void;
  onDelete: () => void;
  selectedCount?: number;
}

const LongPressActionBar: React.FC<LongPressActionBarProps> = ({
  visible,
  onClose,
  onAddToQueue,
  onPost,
  onDelete,
  selectedCount = 1,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
  >
    <TouchableOpacity
      style={styles.modalOverlay}
      activeOpacity={1}
      onPress={onClose}
    >
      <View style={styles.actionBarContainer}>
        {selectedCount > 1 && (
          <View style={styles.selectionHeader}>
            <Text style={styles.selectionCountText}>
              {selectedCount} Selected
            </Text>
          </View>
        )}
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[styles.longPressActionButton, styles.addToQueueButton]}
            onPress={onAddToQueue}
            accessibilityLabel="Add to queue"
            accessibilityRole="button"
          >
            <Ionicons name="add-circle-outline" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Add to Queue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.longPressActionButton, styles.postButton]}
            onPress={onPost}
            accessibilityLabel="Post"
            accessibilityRole="button"
          >
            <Ionicons name="share-outline" size={16} color="#666666" />
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.longPressActionButton, styles.deleteButton]}
            onPress={onDelete}
            accessibilityLabel="Delete"
            accessibilityRole="button"
          >
            <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  </Modal>
);

function ClosetBottomSheet({
  isOpen,
  onOpenChange,
  items,
  onItemTap,
  onItemLongPress,
  onUpload,
  selectionMode = false,
  selectedItems = new Set(),
  onBatchAddToQueue,
  onBatchDelete,
  onBatchPost,
  onExitSelectionMode,
}: ClosetBottomSheetProps) {
  const { height: screenHeight } = Dimensions.get('window');
  const sheetHeight = screenHeight * 0.7;
  const maxSheetHeight = screenHeight;

// Separate component for closet items to properly handle animations
const ClosetItem: React.FC<{
  item: {id: string, image: string, name?: string, inQueue?: boolean};
  onPress: () => void;
  onLongPress: () => void;
  isSelected?: boolean;
  selectionMode?: boolean;
}> = ({ item, onPress, onLongPress, isSelected = false, selectionMode = false }) => {
  const badgeScale = useRef(new Animated.Value(item.inQueue ? 1 : 0)).current;
  const badgeOpacity = useRef(new Animated.Value(item.inQueue ? 1 : 0)).current;

  useEffect(() => {
    if (item.inQueue) {
      Animated.parallel([
        Animated.spring(badgeScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(badgeOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(badgeScale, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(badgeOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [item.inQueue, badgeScale, badgeOpacity]);

  return (
    <TouchableOpacity
      style={styles.closetItem}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
      accessibilityLabel={selectionMode
        ? (isSelected ? `Deselect ${item.name || 'item'}` : `Select ${item.name || 'item'}`)
        : (item.inQueue ? `Remove ${item.name || 'item'} from tried-on queue` : `Add ${item.name || 'item'} to tried-on queue`)
      }
      accessibilityRole="button"
    >
      <Image source={{ uri: item.image }} style={styles.closetItemImage} />

      {/* Selection indicator */}
      {selectionMode && (
        <View style={[styles.selectionIndicator, isSelected && styles.selectionIndicatorSelected]}>
          {isSelected && (
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          )}
        </View>
      )}

      {/* Queue badge - only show when not in selection mode */}
      {!selectionMode && (
        <Animated.View
          style={[
            styles.queueBadge,
            {
              transform: [{ scale: badgeScale }],
              opacity: badgeOpacity,
            },
          ]}
          accessibilityLabel="Item added to tried-on queue"
        >
          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
        </Animated.View>
      )}
    </TouchableOpacity>
  );
};

  const renderClosetItem = ({ item }: { item: {id: string, image: string, name?: string, inQueue?: boolean} }) => (
    <ClosetItem
      item={item}
      onPress={() => onItemTap(item)}
      onLongPress={() => onItemLongPress(item)}
      isSelected={selectedItems.has(item.id)}
      selectionMode={selectionMode}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.closetEmptyState}>
      <View style={styles.closetEmptyIllustration}>
        <Ionicons name="shirt-outline" size={120} color="#D1D5DB" />
      </View>
      <Text style={styles.closetEmptyTitle}>Your closet is empty</Text>
      <TouchableOpacity style={styles.closetUploadButton} onPress={onUpload}>
        <Text style={styles.closetUploadButtonText}>Upload Garment</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={() => onOpenChange(false)}
    >
      <Pressable style={styles.closetBackdrop} onPress={() => onOpenChange(false)}>
        <Pressable style={[styles.closetSheet, { height: sheetHeight }]}>
          {/* Drag Handle */}
          <View style={styles.closetDragHandle} />

          {/* Header */}
          <View style={styles.closetHeader}>
            <Text style={styles.closetTitle}>
              {selectionMode ? `${selectedItems.size} Selected` : 'My Closet'}
            </Text>
            {selectionMode ? (
              <TouchableOpacity
                style={styles.closetCancelIcon}
                onPress={onExitSelectionMode}
              >
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.closetUploadIcon} onPress={onUpload}>
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Batch Operations */}
          {selectionMode && selectedItems.size > 0 && (
            <View style={styles.batchOperations}>
              <TouchableOpacity
                style={[styles.batchButton, styles.batchButtonPrimary]}
                onPress={onBatchAddToQueue}
              >
                <Ionicons name="add-circle-outline" size={16} color="#FFFFFF" />
                <Text style={styles.batchButtonText}>Add to Queue</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.batchButton, styles.batchButtonSecondary]}
                onPress={onBatchPost}
              >
                <Ionicons name="share-outline" size={16} color="#111" />
                <Text style={styles.batchButtonTextSecondary}>Post</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.batchButton, styles.batchButtonDestructive]}
                onPress={onBatchDelete}
              >
                <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                <Text style={styles.batchButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Content */}
          <View style={styles.closetContent}>
            {items.length === 0 ? (
              renderEmptyState()
            ) : (
              <FlatList
                data={items}
                keyExtractor={(item) => item.id}
                renderItem={renderClosetItem}
                numColumns={3}
                contentContainerStyle={styles.closetGrid}
                showsVerticalScrollIndicator={true}
                extraData={items}
              />
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function AvatarScreen() {
  const { width, height } = Dimensions.get('window');
  const NEUTRAL_BG = '#F9FAFB';
  const router = useRouter();
  const params = useLocalSearchParams();
  // Demo state; wire to real data later
  const [state, setState] = useState<AvatarState>('exists');
  const [building, setBuilding] = useState(false);
  const { triedOnQueue, addToTriedOnQueue, removeFromTriedOnQueue } = useTriedOnQueue();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [sheetActionIdx, setSheetActionIdx] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [closetSheetOpen, setClosetSheetOpen] = useState(false);
  const [closetItems, setClosetItems] = useState<Array<{id: string, image: string, name?: string, inQueue?: boolean}>>([
    // Empty by default - only uploaded garments will be visible
  ]);
  const [shareLoading, setShareLoading] = useState(false);
  // Multi-selection state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [actionBarVisible, setActionBarVisible] = useState(false);
  const [selectedClosetItem, setSelectedClosetItem] = useState<{id: string, image: string, name?: string, inQueue?: boolean} | null>(null);
  // Sheet dismiss handler
  const closeSheet = () => {
    setShowSheet(false);
    setSheetActionIdx(null);
  };
  // Handle thumbnail tap to update avatar
  const handleThumbnailTap = (item: { id: string; uri?: string }) => {
    // TODO: Implement avatar update logic
  };

  const hasAvatar = state === 'exists';

  const openOverflow = () => {
    const options = ['Cancel', 'Create New Avatar', 'Delete Avatar'];
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: 0, userInterfaceStyle: 'light', destructiveButtonIndex: 2 },
        (idx) => {
          if (idx === 1) {
            // Create new: go back to empty state (Upload / Guided options)
            setState('empty');
          }
          if (idx === 2) {
            Alert.alert('Delete Avatar', 'Are you sure you want to delete this avatar?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => setState('empty') },
            ]);
          }
        }
      );
    } else {
      // Android: simple chooser with confirm on delete
      Alert.alert('Avatar', 'Choose an action', [
        { text: 'Create New Avatar', onPress: () => setState('empty') },
        { text: 'Delete Avatar', style: 'destructive', onPress: () => {
            Alert.alert('Delete Avatar', 'Are you sure you want to delete this avatar?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => setState('empty') },
            ]);
          }
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  // If navigated with build=1, show build overlay then reveal avatar
  useEffect(() => {
    if (params.build === '1') {
      setBuilding(true);
      // Pretend server-side build; then show avatar
      const t = setTimeout(() => {
        setBuilding(false);
        setState('exists');
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [params.build]);

  const openGallery = async () => {
    try {
      // Request permission if needed
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission needed', 'Please allow photo library access to upload.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 10,
        quality: 0.9,
      });
      if (result.canceled) return;
      // TODO: handoff selected assets to your upload/processing flow
      // For now, just mark avatar as existing
      setState('exists');
    } catch (e) {
      Alert.alert('Could not open gallery');
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const handleClosetItemTap = (item: {id: string, image: string, name?: string, inQueue?: boolean}) => {
    console.log('handleClosetItemTap called:', { itemId: item.id, currentlyInQueue: item.inQueue });

    // Toggle tried-on queue status
    const triedOnItem: TriedOnItem = {
      id: item.id,
      image: item.image,
      meta: { name: item.name },
    };

    if (item.inQueue) {
      // Remove from queue
      console.log('Removing item from queue:', item.id);
      removeFromTriedOnQueue([item.id]);
      setClosetItems(prev => prev.map(i =>
        i.id === item.id ? { ...i, inQueue: false } : i
      ));
    } else {
      // Add to queue
      console.log('Adding item to queue:', triedOnItem);
      addToTriedOnQueue(triedOnItem);
      setClosetItems(prev => prev.map(i =>
        i.id === item.id ? { ...i, inQueue: true } : i
      ));
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleClosetItemSelection = (item: {id: string, image: string, name?: string, inQueue?: boolean}) => {
    if (selectionMode) {
      // In selection mode, toggle selection
      setSelectedItems(prev => {
        const newSelected = new Set(prev);
        if (newSelected.has(item.id)) {
          newSelected.delete(item.id);
        } else {
          newSelected.add(item.id);
        }
        return newSelected;
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      // Normal tap behavior
      handleClosetItemTap(item);
    }
  };

  const handleClosetItemLongPress = (item: {id: string, image: string, name?: string, inQueue?: boolean}) => {
    if (!selectionMode) {
      // Show action bar for single item
      setSelectedClosetItem(item);
      setActionBarVisible(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleActionBarClose = () => {
    setActionBarVisible(false);
    setSelectedClosetItem(null);
  };

  const handleAddToQueue = () => {
    if (selectedClosetItem) {
      handleClosetItemTap(selectedClosetItem);
    }
    handleActionBarClose();
  };

  const handleActionBarPost = () => {
    if (selectedClosetItem) {
      // TODO: Implement post functionality
      console.log('Post item:', selectedClosetItem);
      showToast('Post functionality coming soon!');
    }
    handleActionBarClose();
  };

  const handleActionBarDelete = () => {
    if (selectedClosetItem) {
      Alert.alert(
        'Delete Item',
        'Are you sure you want to delete this item?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              setClosetItems(prev => prev.filter(item => item.id !== selectedClosetItem.id));
              showToast('Item deleted');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
          },
        ]
      );
    }
    handleActionBarClose();
  };

  const handleBatchAddToQueue = () => {
    const selectedItemsArray = Array.from(selectedItems);
    const triedOnItems = selectedItemsArray.map(id => {
      const item = closetItems.find(i => i.id === id);
      return {
        id: item!.id,
        image: item!.image,
        meta: { name: item!.name },
      };
    });

    // Add all selected items to queue
    triedOnItems.forEach(item => addToTriedOnQueue(item));

    // Update closet items to reflect queue status
    setClosetItems(prev => prev.map(item =>
      selectedItems.has(item.id) ? { ...item, inQueue: true } : item
    ));

    // Exit selection mode
    setSelectionMode(false);
    setSelectedItems(new Set());

    showToast(`${selectedItemsArray.length} items added to tried-on queue`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleBatchDelete = () => {
    const selectedItemsArray = Array.from(selectedItems);
    Alert.alert(
      'Delete Items',
      `Are you sure you want to delete ${selectedItemsArray.length} items?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setClosetItems(prev => prev.filter(item => !selectedItems.has(item.id)));
            setSelectionMode(false);
            setSelectedItems(new Set());
            showToast(`${selectedItemsArray.length} items deleted`);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
        },
      ]
    );
  };

  const handleBatchPost = () => {
    const selectedItemsArray = Array.from(selectedItems);
    // TODO: Navigate to post creation with selected items
    showToast(`Post feature coming soon for ${selectedItemsArray.length} items`);
    setSelectionMode(false);
    setSelectedItems(new Set());
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedItems(new Set());
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleUploadGarment = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission needed', 'Please allow photo library access to upload garments.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 10,
        quality: 0.9,
      });
      if (result.canceled) return;

      // Add selected images to closet
      const newItems = result.assets.map((asset, index) => ({
        id: `uploaded-${Date.now()}-${index}`,
        image: asset.uri,
        name: `Garment ${closetItems.length + index + 1}`,
        inQueue: false,
      }));

      setClosetItems(prev => [...newItems, ...prev]);
      showToast(`Added ${newItems.length} garment${newItems.length > 1 ? 's' : ''} to closet`);
    } catch (e) {
      Alert.alert('Could not upload', 'Please try again.');
    }
  };

  const handleShare = async () => {
    if (!hasAvatar) {
      showToast('Create your avatar first');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setShareLoading(true);

      // Simulate avatar export (replace with actual PNG export)
      const avatarUri = 'https://via.placeholder.com/400x600.png?text=Avatar'; // TODO: Replace with actual avatar URI

      await Share.share({
        message: 'Check out my new look!',
        url: avatarUri,
        title: 'Share your look',
      });
    } catch (error) {
      console.error('Share failed:', error);
    } finally {
      setShareLoading(false);
    }
  };

  const handlePost = () => {
    if (!hasAvatar) {
      showToast('Create your avatar first');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // TODO: Replace with actual avatar data
    const payload = {
      imageUri: 'https://via.placeholder.com/400x600.png?text=Avatar', // TODO: Replace with actual avatar URI
      lookId: 'avatar-' + Date.now(),
      brand: 'Cloon',
      timestamp: new Date().toISOString(),
    };

    router.push({
      pathname: '/create-post',
      params: payload,
    });
  };

  // Only show header if avatar exists
  const Header = hasAvatar ? (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => {
          Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle.Light);
          setClosetSheetOpen(true);
        }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={styles.closetButton}
        activeOpacity={0.6}
      >
        <Text style={styles.closetButtonText}>Closet</Text>
      </TouchableOpacity>
      <View style={styles.headerSpacer} />
      <TouchableOpacity
        onPress={openOverflow}
        style={styles.overflowButton}
        activeOpacity={0.6}
      >
        <Ionicons name="ellipsis-horizontal" size={24} color="#111111" />
      </TouchableOpacity>
    </View>
  ) : null;

  const FirstTimeHero = (
    <View style={styles.hero}> 
      <View style={styles.silhouetteWrap}>
        <View style={styles.silhouette}>
          <Ionicons name="person-outline" size={120} color="#9CA3AF" />
        </View>
      </View>
      <View style={styles.ctaStack}>
  <TouchableOpacity style={styles.primaryBtn} onPress={openGallery}>
          <Text style={styles.primaryBtnText}>Upload Photos</Text>
        </TouchableOpacity>
  <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/guided-capture')}>
          <Text style={styles.secondaryBtnText}>Guided Capture</Text>
        </TouchableOpacity>
        <Text style={styles.caption}>Create your avatar to start trying looks.</Text>
      </View>
      {building && (
        <View style={styles.buildOverlayHero}>
          <ActivityIndicator color="#111" size="large" />
          <Text style={styles.buildText}>Building your avatar…</Text>
        </View>
      )}
    </View>
  );

  const AvatarHero = (
    <View style={styles.hero}> 
      <View style={styles.avatarCard}>
        <View style={styles.avatarRender} />
  </View>
      {building && (
        <View style={styles.buildOverlayHero}>
          <ActivityIndicator color="#111" size="large" />
          <Text style={styles.buildText}>Building your avatar…</Text>
        </View>
      )}
    </View>
  );

  // Supplementary strip removed per request

  const LoadingHero = (
    <View style={[styles.hero, { justifyContent: 'center' }]}> 
      <View style={[styles.silhouette, { backgroundColor: '#E5E7EB' }]} />
    </View>
  );

  const ErrorHero = (
    <View style={[styles.hero, { justifyContent: 'center', alignItems: 'center' }]}> 
      <Text style={styles.errorText}>Couldn’t load your avatar</Text>
      <TouchableOpacity style={[styles.secondaryBtn, { marginTop: 12 }]} onPress={() => setState('empty')}>
        <Text style={styles.secondaryBtnText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

   return (
  <>
  <Screen style={styles.container} hasBottomTabs>
       {Header}
       <View style={styles.bodyRow}>
         <View style={styles.avatarArea}>
           {state === 'loading' && LoadingHero}
           {state === 'error' && ErrorHero}
           {state === 'empty' && FirstTimeHero}
           {state === 'exists' && AvatarHero}
         </View>
         {state === 'exists' && (
           <>
             <View style={styles.actionButtonsRow}>
               <TouchableOpacity
                 style={[styles.actionButton, !hasAvatar && styles.actionButtonDisabled]}
                 onPress={handleShare}
                 hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                 accessibilityLabel="Share look"
                 accessibilityHint="Opens the system share sheet"
                 disabled={!hasAvatar}
               >
                 {shareLoading ? (
                   <ActivityIndicator size="small" color={hasAvatar ? '#111' : '#999'} />
                 ) : (
                   <Ionicons
                     name="share-outline"
                     size={20}
                     color={hasAvatar ? '#111' : '#999'}
                   />
                 )}
               </TouchableOpacity>
               <TouchableOpacity
                 style={[styles.actionButton, !hasAvatar && styles.actionButtonDisabled]}
                 onPress={handlePost}
                 hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                 accessibilityLabel="Post look"
                 accessibilityHint="Start a post with this look"
                 disabled={!hasAvatar}
               >
                 <Ionicons
                   name="add"
                   size={20}
                   color={hasAvatar ? '#111' : '#999'}
                 />
               </TouchableOpacity>
             </View>
             <View style={styles.queueArea}>
               <View style={styles.queueLabelRow}>
        <Text style={styles.queueLabel}>
          Tried-On Queue
          <Text style={styles.queueLabelSeparator}> · </Text>
          <Text style={styles.queueLabelCount}>{triedOnQueue.length}</Text>
        </Text>
      </View>
             {triedOnQueue.length === 0 ? (
               <View style={styles.emptyInlineHint}>
                 <Text style={styles.emptyHintText}>Your try-on queue is empty. Swipe right on outfits to add.</Text>
               </View>
             ) : (
               <View style={styles.thumbnailRow}>
                 {triedOnQueue.slice(0, 3).map((item: TriedOnItem, idx: number) => (
                   <TouchableOpacity
                     key={item.id}
                     style={styles.thumbnailCard}
                     activeOpacity={0.8}
                     onPressIn={e => e.target && e.target.setNativeProps({ style: { transform: [{ scale: 0.98 }] } })}
                     onPressOut={e => e.target && e.target.setNativeProps({ style: { transform: [{ scale: 1 }] } })}
                     onPress={() => {/* TODO: apply look on avatar */}}
                   >
                     <Image source={{ uri: item.image }} style={styles.thumbnailImage} resizeMode="cover" />
                   </TouchableOpacity>
                 ))}
                 <ChevronTile
                   queueLength={triedOnQueue.length}
                   screenWidth={width}
                   onPress={() => setSheetOpen(true)}
                 />
               </View>
             )}
           </View>
           </>
         )}
       </View>
  </Screen>
  <TriedOnSheet
    isOpen={sheetOpen}
    onOpenChange={setSheetOpen}
    items={triedOnQueue}
    onApply={(item) => {/* TODO: update avatar preview */ setSheetOpen(false); }}
    onDeleteSelected={(ids) => removeFromTriedOnQueue(ids)}
    onShareSelected={(ids) => {/* TODO: implement share logic */}}
  />
  <ClosetBottomSheet
    isOpen={closetSheetOpen}
    onOpenChange={setClosetSheetOpen}
    items={closetItems}
    onItemTap={handleClosetItemSelection}
    onItemLongPress={handleClosetItemLongPress}
    onUpload={handleUploadGarment}
    selectionMode={selectionMode}
    selectedItems={selectedItems}
    onBatchAddToQueue={handleBatchAddToQueue}
    onBatchDelete={handleBatchDelete}
    onBatchPost={handleBatchPost}
    onExitSelectionMode={exitSelectionMode}
  />
  <LongPressActionBar
    visible={actionBarVisible}
    onClose={handleActionBarClose}
    onAddToQueue={handleAddToQueue}
    onPost={handleActionBarPost}
    onDelete={handleActionBarDelete}
  />
  {toast && (
    <View style={styles.toast} pointerEvents="none">
      <Text style={styles.toastText}>{toast}</Text>
    </View>
  )}
</>
  );
}

const styles = StyleSheet.create({
  // ...existing styles...
  // ...existing styles...
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: Spacing.lg,
    paddingHorizontal: Layout.sectionMargin,
    paddingBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
  },
  bodyRow: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Colors.background,
  },
  avatarArea: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Layout.sectionMargin,
    paddingTop: Spacing.lg,
  },
  queueArea: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    height: 120,
  },
  queueLabelRow: {
    paddingLeft: 0, // aligns with first thumbnail
    paddingRight: 0,
    marginTop: 8, // reduced gap since action buttons are now above
    marginBottom: 6, // gap below label to thumbnails
    alignItems: 'flex-start',
  },
  queueLabel: {
    fontSize: 14,
    fontWeight: '600', // semi-bold
    color: '#6B7280',
    textTransform: 'capitalize',
    letterSpacing: 0.1,
  },
  queueLabelSeparator: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 14,
  },
  queueLabelCount: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 14,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  thumbnailRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  thumbnailCard: {
    width: 96,
    height: 96,
    borderRadius: 6,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  viewAllCard: {
    width: 96,
    height: 96,
    borderRadius: 6,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  viewAllCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    padding: 8,
  },
  viewAllCardLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 4,
  },
  emptyCard: {
    width: 96,
    height: 96,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  emptyText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  hero: {
  width: '100%',
  marginBottom: 12,
  flex: 3,
    alignItems: 'center',
  },
  silhouetteWrap: {
    height: '70%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  silhouette: {
  // width and height will be passed as style prop from component
  borderRadius: BorderRadius.xxl,
  borderWidth: 2,
  borderColor: '#E5E7EB',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: Colors.white,
  },
  ctaStack: {
    marginTop: 16,
    gap: 16,
  },
  primaryBtn: {
    height: 52,
    borderRadius: 28,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    height: 52,
    borderRadius: 28,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: '#111',
    fontSize: 16,
    fontWeight: '700',
  },
  caption: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 13,
  },
  avatarCard: {
    height: '70%',
    width: '86%',
    borderRadius: 18,
    backgroundColor: Colors.white,
    overflow: 'hidden',
  },
  avatarRender: {
    flex: 1,
    backgroundColor: '#D1D5DB',
    borderRadius: 18,
  },
  // supplementary strip styles removed
  errorText: {
    color: Colors.text.primary,
    fontSize: 16,
    marginBottom: 8,
  },
  buildOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '70%',
    borderRadius: 18,
    backgroundColor: 'rgba(249,250,251,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  buildText: {
    marginTop: 12,
    fontSize: 14,
    color: '#111',
    fontWeight: '600',
  },
  queueHeaderRowClean: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  queueTitleClean: {
    fontSize: 16,
    color: '#111',
    fontWeight: '700',
  },
  viewAllLink: {
    fontSize: 15,
    color: Colors.accent,
    fontWeight: '500',
  },
  extraOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  extraText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  // removed old viewAllCard style (now replaced below)
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  buildOverlayHero: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(249,250,251,0.85)',
    zIndex: 10,
  },
  fadeLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  width: 24,
  backgroundColor: 'transparent',
  },
  fadeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 24,
    backgroundColor: 'transparent',
  },
  // Bottom Sheet Styles
  sheetBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 1,
  },
  sheetContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 2,
  },
  sheetHeader: {
    height: 56,
    backgroundColor: '#000000',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 8,
  },
  sheetGridWrap: {
    paddingBottom: 24,
  },
  sheetGridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'flex-start',
  },
  sheetThumbWrap: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 6,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  sheetThumbImg: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  badgeOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sheetActionMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 8,
    padding: 8,
    zIndex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetActionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 4,
    backgroundColor: '#F3F4F6',
    width: '100%',
    alignItems: 'center',
  },
  sheetActionText: {
    fontSize: 16,
    color: '#111',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#111',
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyInlineHint: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  emptyHintText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(17,17,17,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  toast: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  toastText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  closetButton: {
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 0, // Rectangle shape
    backgroundColor: 'transparent', // Invisible background
    justifyContent: 'center',
    alignItems: 'center',
  },
  closetButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
    textDecorationLine: 'underline',
    textDecorationColor: '#DDD',
    textDecorationStyle: 'solid',
  },
  headerSpacer: {
    flex: 1,
  },
  overflowButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Closet Bottom Sheet Styles
  closetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  closetSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 12,
  },
  closetDragHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  closetHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  closetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  closetUploadIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closetContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  closetGrid: {
    paddingBottom: 20,
    alignItems: 'stretch',
  },
  closetItem: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: Dimensions.get('window').width / 3 - 24, // Account for padding and margins
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  closetItemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 8,
  },
  queueBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(17, 17, 17, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closetEmptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  closetEmptyIllustration: {
    marginBottom: 24,
  },
  closetEmptyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  closetUploadButton: {
    height: 52,
    borderRadius: 28,
    backgroundColor: '#111',
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  closetUploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  closetCancelIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
  },
  batchOperations: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  batchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  batchButtonPrimary: {
    backgroundColor: '#111',
  },
  batchButtonSecondary: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  batchButtonDestructive: {
    backgroundColor: '#DC2626',
  },
  batchButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  batchButtonTextSecondary: {
    color: '#111',
    fontSize: 14,
    fontWeight: '600',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionIndicatorSelected: {
    backgroundColor: '#111',
    borderColor: '#111',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  actionBarContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  selectionHeader: {
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectionCountText: {
    fontFamily: Typography.fontFamily,
    fontSize: 16,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  actionBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  longPressActionButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  addToQueueButton: {
    backgroundColor: '#000000',
  },
  postButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    fontFamily: Typography.fontFamily,
    fontSize: 14,
    fontWeight: Typography.fontWeight.semibold,
    color: '#FFFFFF',
    marginLeft: 8,
    letterSpacing: 0.2,
  },
  postButtonText: {
    fontFamily: Typography.fontFamily,
    fontSize: 14,
    fontWeight: Typography.fontWeight.semibold,
    color: '#666666',
    marginLeft: 8,
    letterSpacing: 0.2,
  },
});