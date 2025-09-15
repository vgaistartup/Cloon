import React, { useState, useRef, useCallback, memo, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, Share, Vibration } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { runOnJS, useSharedValue, withSpring, withTiming, interpolate, useAnimatedStyle, Extrapolation, useAnimatedScrollHandler } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Image as ExpoImage } from 'expo-image';
import { TriedOnItem } from '@/components/TriedOnSheet';
import { useTriedOnQueue } from '@/contexts/TriedOnQueueContext';

interface FashionCardProps {
  item: FashionItem;
  cardHeight: number;
  isActive: boolean;
  onHorizontalActive: (active: boolean) => void;
  nextItem?: FashionItem;
  onCommit: (dir: 'right' | 'left') => void;
  hasNext: boolean;
  onActiveLoaded: (id: string) => void;
  navHeight: number;
  isFollowed: boolean;
  nextIsFollowed: boolean;
  onFollow: (id: string) => void;
  onShare: (item: FashionItem) => void;
  index: number;
  scrollY: SharedValue<number>;
}

const { height: windowHeight } = Dimensions.get('window');

// Fresh sample data - no reference to existing wardrobe code
const FASHION_ITEMS = [
  {
    id: 'item-1',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=800&fit=crop',
    brandName: 'StyleCo',
    triedOnCount: '2.1K',
  },
  {
    id: 'item-2', 
    imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=800&fit=crop',
    brandName: 'TrendLab',
    triedOnCount: '3.5K',
  },
  {
    id: 'item-3',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=800&fit=crop', 
    brandName: 'ModernWear',
    triedOnCount: '1.8K',
  },
  {
    id: 'item-4',
    imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=800&fit=crop',
    brandName: 'ChicStyle',
    triedOnCount: '4.2K',
  },
  {
    id: 'item-5',
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=800&fit=crop',
    brandName: 'UrbanFit',
    triedOnCount: '6.7K',
  },
  {
    id: 'item-6',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=800&fit=crop',
    brandName: 'FashionHub',
    triedOnCount: '5.3K',
  },
  {
    id: 'item-7',
    imageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=800&fit=crop',
    brandName: 'StyleStreet',
    triedOnCount: '2.8K',
  },
  {
    id: 'item-8',
    imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=800&fit=crop',
    brandName: 'TrendSetter',
    triedOnCount: '7.1K',
  },
  {
    id: 'item-9',
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=800&fit=crop',
    brandName: 'UrbanStyle',
    triedOnCount: '4.6K',
  },
  {
    id: 'item-10',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=800&fit=crop',
    brandName: 'ModaViva',
    triedOnCount: '3.9K',
  },
  {
    id: 'item-11',
    imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=800&fit=crop',
    brandName: 'ChicMode',
    triedOnCount: '5.7K',
  },
  {
    id: 'item-12',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=800&fit=crop',
    brandName: 'FashionForward',
    triedOnCount: '6.2K',
  },
  {
    id: 'item-13',
    imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=800&fit=crop',
    brandName: 'StyleEssence',
    triedOnCount: '4.1K',
  },
  {
    id: 'item-14',
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=800&fit=crop',
    brandName: 'TrendElite',
    triedOnCount: '8.3K',
  },
  {
    id: 'item-15',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=800&fit=crop',
    brandName: 'UrbanChic',
    triedOnCount: '3.4K',
  },
  {
    id: 'item-16',
    imageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=800&fit=crop',
    brandName: 'ModaTrend',
    triedOnCount: '5.9K',
  },
  {
    id: 'item-17',
    imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=800&fit=crop',
    brandName: 'StyleVibe',
    triedOnCount: '7.8K',
  },
  {
    id: 'item-18',
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=800&fit=crop',
    brandName: 'FashionPulse',
    triedOnCount: '4.7K',
  },
  {
    id: 'item-19',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=800&fit=crop',
    brandName: 'ChicUrban',
    triedOnCount: '6.5K',
  },
  {
    id: 'item-20',
    imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=800&fit=crop',
    brandName: 'TrendModa',
    triedOnCount: '9.2K',
  },
];

interface FashionItem {
  id: string;
  imageUrl: string;
  brandName: string;
  triedOnCount: string;
}

interface FashionCardProps {
  item: FashionItem;
  cardHeight: number;
  isActive: boolean;
  onHorizontalActive: (active: boolean) => void;
  nextItem?: FashionItem;
  onCommit: (dir: 'right' | 'left') => void;
  hasNext: boolean;
  onActiveLoaded: (id: string) => void;
  navHeight: number;
  isFollowed: boolean;
  nextIsFollowed: boolean;
  onFollow: (id: string) => void;
  onShare: (item: FashionItem) => void;
  index: number;
  scrollY: SharedValue<number>;
}

const FashionCard = memo(function FashionCard({ item, cardHeight, isActive, onHorizontalActive, nextItem, onCommit, hasNext, onActiveLoaded, navHeight, isFollowed, nextIsFollowed, onFollow, onShare, index, scrollY }: FashionCardProps) {
  // Phase 2: visual feedback (translateX + tilt) and underlay
  const startTs = useSharedValue(0);
  const hActive = useSharedValue(0);
  const tx = useSharedValue(0);
  const rot = useSharedValue(0); // degrees
  const underlayOpacity = useSharedValue(0);
  const underlayScale = useSharedValue(0.98);
  const screenWidth = Dimensions.get('window').width;
  const nextReady = useSharedValue(0);
  const currentOverlayOpacity = useSharedValue(1);

  // Reset readiness when next item changes
  useEffect(() => {
    nextReady.value = 0;
    underlayScale.value = 0.98;
  }, [nextItem?.imageUrl]);

  const pan = Gesture.Pan()
    .enabled(isActive)
    .activeOffsetX([-20, 20])
    .failOffsetY([-12, 12])
    .onBegin((e) => {
      'worklet';
      const t = (e as any).eventTimestamp ?? (e as any).timestamp ?? (e as any).time ?? 0;
      startTs.value = t;
      hActive.value = 0;
      tx.value = 0;
      rot.value = 0;
  currentOverlayOpacity.value = 1;
    })
    .onUpdate((e) => {
      'worklet';
      if (!isActive) return;
      const dx = e.translationX;
      const dy = e.translationY;
      const t = (e as any).eventTimestamp ?? (e as any).timestamp ?? (e as any).time ?? 0;
      const dt = startTs.value > 0 ? (t - startTs.value) : 0;
      const axisOK = Math.abs(dx) > 1.3 * Math.abs(dy);
      const timeOK = startTs.value === 0 ? true : dt <= 100; // if timestamp missing, allow
      if (hActive.value !== 1 && axisOK && timeOK) {
        hActive.value = 1;
        try { runOnJS(onHorizontalActive)(true); } catch (_) {}
        underlayOpacity.value = 0.08;
      }
      // If active, update transforms continuously
      if (hActive.value === 1) {
        const clampedDx = Math.max(-2000, Math.min(2000, dx));
        tx.value = clampedDx;
        const frac = Math.max(-1, Math.min(1, clampedDx / screenWidth));
        const deg = Math.max(-6, Math.min(6, frac * 6));
        rot.value = deg;
        const prog = Math.min(1, Math.abs(clampedDx) / screenWidth);
        // Gate fade by nextReady: keep near-min until ready
        if (nextReady.value === 1) {
          underlayOpacity.value = withTiming(
            prog < 0.35
              ? interpolate(prog, [0, 0.35], [0.08, 0.35], Extrapolation.CLAMP)
              : interpolate(prog, [0.35, 1], [0.35, 1], Extrapolation.CLAMP),
            { duration: 60 }
          );
        } else {
          underlayOpacity.value = 0.12; // minimal glimpse until ready
        }
        // Scale underlay from 0.98 -> 1.0 as progress increases to avoid a pop on commit
        underlayScale.value = withTiming(
          interpolate(prog, [0, 1], [0.98, 1], Extrapolation.CLAMP),
          { duration: 60 }
        );
      }
    })
  .onEnd((_e) => {
      'worklet';
      if (hActive.value === 1) {
        try { runOnJS(onHorizontalActive)(false); } catch (_) {}
        // Phase 3: decide commit vs cancel
    const dx = tx.value; // last translation
    const vx = (_e as any).velocityX ?? 0;
        const shouldCommitBase = Math.abs(dx) >= 0.3 * screenWidth || Math.abs(vx) >= 800;
    if (shouldCommitBase) {
          const dir = dx >= 0 ? 1 : -1;
          // Guard: if no next item, block right-swipe commit (cancel instead)
          if (dir > 0 && !hasNext) {
            // cancel
            tx.value = withSpring(0, { stiffness: 260, damping: 26, mass: 0.9 });
            rot.value = withSpring(0, { stiffness: 260, damping: 26, mass: 0.9 });
      underlayOpacity.value = 0;
            currentOverlayOpacity.value = 1;
            hActive.value = 0;
            try { runOnJS(Vibration.vibrate)(10); } catch(_) {}
            return;
          }
          // Ensure the underlay (next) is fully visible and full scale instantly on commit
          underlayOpacity.value = 1;
          underlayScale.value = 1;
          // Hide current overlay instantly so text changes immediately
          currentOverlayOpacity.value = 0;
      const target = dir * screenWidth * 1.2;
          tx.value = withSpring(target, { stiffness: 220, damping: 28, mass: 1, overshootClamping: true }, (finished) => {
            'worklet';
            if (finished) {
              rot.value = 0;
              try { runOnJS(onCommit)(dir > 0 ? 'right' : 'left'); } catch (_) {}
            }
          });
        } else {
          // cancel
          tx.value = withSpring(0, { stiffness: 260, damping: 26, mass: 0.9 });
          rot.value = withSpring(0, { stiffness: 260, damping: 26, mass: 0.9 });
          underlayOpacity.value = 0;
          underlayScale.value = 0.98;
          currentOverlayOpacity.value = 1;
        }
      }
      try { runOnJS(onHorizontalActive)(false); } catch (_) {}
      hActive.value = 0;
    })
    .onFinalize((_e) => {
      'worklet';
      if (hActive.value === 1) {
        try { runOnJS(onHorizontalActive)(false); } catch (_) {}
      }
      hActive.value = 0;
    });

  // Double-tap to like (right commit)
  const doubleTap = Gesture.Tap()
    .enabled(isActive)
    .numberOfTaps(2)
    .onEnd((_e, success) => {
      'worklet';
      if (!success) return;
      // ensure next is visible
      underlayOpacity.value = 1;
      underlayScale.value = 1;
      const target = screenWidth * 1.2;
      tx.value = withSpring(target, { stiffness: 220, damping: 28, mass: 1, overshootClamping: true }, (finished) => {
        'worklet';
        if (finished) {
          rot.value = 0;
          try { runOnJS(onCommit)('right'); } catch(_) {}
        }
      });
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { rotateZ: `${rot.value}deg` },
    ],
  }));

  const underlayStyle = useAnimatedStyle(() => ({
    opacity: underlayOpacity.value,
    transform: [{ scale: underlayScale.value }],
  }));

  const activeOverlayStyle = useAnimatedStyle(() => {
    // Vertical fade when swiping up: start fading after 50% height, fully faded by 90%
    const rel = scrollY.value - index * cardHeight; // 0 -> cardHeight as this card moves up
    const prog = rel / cardHeight;
    let vFade = 1;
    if (prog > 0) {
      if (prog <= 0.5) vFade = 1;
      else if (prog >= 0.9) vFade = 0;
      else vFade = interpolate(prog, [0.5, 0.9], [1, 0], Extrapolation.CLAMP);
    }
    return { opacity: currentOverlayOpacity.value * vFade };
  });

  const CardInner = (
    <View style={[styles.fashionCard, { height: cardHeight }]}> 
      {/* Underlay: next item behind current incl. its overlay (non-interactive) */}
      {isActive && nextItem?.imageUrl ? (
        <Animated.View style={[styles.underlayWrap, underlayStyle]} pointerEvents="none">
          <ExpoImage
            source={{ uri: nextItem.imageUrl }}
            style={styles.fashionImage}
            contentFit="cover"
            transition={0}
            cachePolicy="memory-disk"
            onLoad={() => { nextReady.value = 1; }}
          />
          {/* Next item's overlay (fades in with underlay) */}
          <BottomOverlay
            item={nextItem}
            navHeight={navHeight}
            isFollowed={nextIsFollowed}
            onFollow={onFollow}
            onShare={onShare}
          />
        </Animated.View>
      ) : null}
      {/* Foreground: current item with transform + overlay (moves/tilts with card) */}
      <Animated.View style={[styles.cardTransformWrap, cardStyle]}>
        <ExpoImage
          source={{ uri: item.imageUrl }}
          style={styles.fashionImage}
          contentFit="cover"
          transition={0}
          cachePolicy="memory-disk"
          onLoad={() => { try { runOnJS(onActiveLoaded)(item.id) } catch(_) {} }}
        />
        <Animated.View style={activeOverlayStyle}>
          <BottomOverlay
            item={item}
            navHeight={navHeight}
            isFollowed={isFollowed}
            onFollow={onFollow}
            onShare={onShare}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );

  // Only the active card gets the gesture wrapper; others render plain
  return isActive ? (
    <GestureDetector gesture={Gesture.Simultaneous(doubleTap, pan)}>{CardInner}</GestureDetector>
  ) : (
    CardInner
  );
});

interface BottomOverlayProps {
  item: FashionItem;
  navHeight: number;
  isFollowed: boolean;
  onFollow: (id: string) => void;
  onShare: (item: FashionItem) => void;
}

const BottomOverlay: React.FC<BottomOverlayProps> = ({ item, navHeight, isFollowed, onFollow, onShare }) => {
  return (
    <>
      {/* Left side controls */}
      <View style={[styles.leftControls, { bottom: navHeight - 16 }]}>
  <Text style={styles.brandText} allowFontScaling={false}>{item.brandName}</Text>
        <View style={styles.dotSeparator} />
        <View style={styles.triedOnContainer}>
          {/* Mirror glyph from Profile Looks grid overlay */}
          <Svg width={16} height={16} viewBox="0 0 16 16">
            <Path d="M3 2.8 C 6.3 2.0, 9.7 2.0, 13 2.8" stroke="white" strokeWidth={1.75} strokeLinecap="round" fill="none" />
            <Path d="M2.6 3.2 V 12.4" stroke="white" strokeWidth={1.75} strokeLinecap="round" fill="none" />
            <Path d="M13.4 3.2 V 12.4" stroke="white" strokeWidth={1.75} strokeLinecap="round" fill="none" />
            <Circle cx={8} cy={6.4} r={2.0} stroke="white" strokeWidth={1.75} fill="none" />
            <Path d="M8 8.2 v 0.5" stroke="white" strokeWidth={1.75} strokeLinecap="round" fill="none" />
            <Path d="M5 11.6 c 1.4 -1.4, 4.6 -1.4, 6 0" stroke="white" strokeWidth={1.75} strokeLinecap="round" fill="none" />
          </Svg>
          <Text style={styles.triedOnText} allowFontScaling={false}>{item.triedOnCount}</Text>
        </View>
        {!isFollowed && (
          <TouchableOpacity style={styles.followOutline} onPress={() => onFollow(item.id)}>
            <Text style={styles.followText} allowFontScaling={false}>Follow</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Right side controls */}
      <View style={[styles.rightControls, { bottom: navHeight - 16 }]}>
        <TouchableOpacity style={styles.actionButton} onPress={() => onShare(item)}>
          <Ionicons name="share-outline" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </>
  );
};

export default function WardrobeNew() {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
  const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set());
  const [lockVertical, setLockVertical] = useState(false);
  const { triedOnQueue, addToTriedOnQueue } = useTriedOnQueue();
  const listRef = useRef<any>(null);
  
  // Filter out swiped items to prevent duplicates
  const availableItems = FASHION_ITEMS.filter(item => !swipedIds.has(item.id));
  
  // Layout calculations
  const navHeight = 60 + Math.max(insets.bottom - 4, 8);
  const cardHeight = windowHeight - navHeight;
  // Track vertical scroll position for overlay fading
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      'worklet';
      scrollY.value = event.contentOffset.y;
    },
  });

  const onHorizontalActive = useCallback((active: boolean) => {
    setLockVertical(active);
  }, []);

  const renderFashionItem = ({ item, index }: { item: FashionItem; index: number }) => (
    <FashionCard
      item={item}
      cardHeight={cardHeight}
      isActive={index === currentIndex}
      onHorizontalActive={onHorizontalActive}
      nextItem={availableItems[index + 1]}
      onCommit={handleCommit}
  hasNext={index + 1 < availableItems.length}
  navHeight={navHeight}
  isFollowed={followedIds.has(item.id)}
  nextIsFollowed={followedIds.has(availableItems[index + 1]?.id ?? '')}
  onFollow={handleFollow}
  onShare={handleShare}
  index={index}
  scrollY={scrollY}
      onActiveLoaded={(id) => {
        // no-op: active image loaded
      }}
    />
  );

  const getItemKey = (item: FashionItem) => item.id;

  const handleViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      if (typeof index === 'number') {
        setCurrentIndex(index);
      }
    }
  }).current;

  const viewConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const activeItem = availableItems[currentIndex] || availableItems[0];

  // Prewarm images for current+1 and current+2
  useEffect(() => {
    const u1 = availableItems[currentIndex + 1]?.imageUrl;
    const u2 = availableItems[currentIndex + 2]?.imageUrl;
    try {
      // @ts-ignore: expo-image provides prefetch
      if (u1) ExpoImage.prefetch?.(u1);
      // @ts-ignore
      if (u2) ExpoImage.prefetch?.(u2);
    } catch {}
  }, [currentIndex, availableItems]);

  const handleFollow = (id: string) => {
    setFollowedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const handleShare = async (item: FashionItem) => {
    try {
      await Share.share({
        message: `Check out this look from ${item.brandName} on Cloon.`,
        url: item.imageUrl,
        title: `${item.brandName} on Cloon`,
      });
    } catch (e) {
      // no-op
    }
  };

    // Phase 3: commit handler - jump to next index without animation to avoid flicker
    const handleCommit = useCallback((dir: 'right' | 'left') => {
      // Get the current item from availableItems
      const currentItem = availableItems[currentIndex];

      // Add to tried-on queue if swiping right
      if (dir === 'right' && currentItem) {
        const triedOnItem: TriedOnItem = {
          id: currentItem.id,
          image: currentItem.imageUrl,
          meta: {
            brandName: currentItem.brandName,
            triedOnCount: currentItem.triedOnCount
          }
        };
        addToTriedOnQueue(triedOnItem);
      }

      // Mark item as swiped (both left and right swipes) - this will filter it out
      if (currentItem) {
        setSwipedIds(prev => new Set([...prev, currentItem.id]));
      }

      setLockVertical(false);
      try {
        // Removed announcement for cleaner UX
      } catch {}
      // After filtering out the swiped item, the next item becomes the current item
      // So we stay at the same index position, which now shows what was previously index+1
      // No need to increment currentIndex - let the filtering handle the transition
    }, [currentIndex, addToTriedOnQueue, availableItems]);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar style="light" translucent />
      
      <Animated.FlatList
        ref={listRef}
        data={availableItems}
        renderItem={renderFashionItem}
        keyExtractor={getItemKey}
        pagingEnabled
        snapToInterval={cardHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        style={[styles.feedList, { height: cardHeight }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!lockVertical}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewConfig}
        initialNumToRender={3}
        windowSize={4}
        maxToRenderPerBatch={3}
  onScroll={scrollHandler}
  scrollEventThrottle={16}
      />

  {/* BottomOverlay now lives inside each card so it moves with card. */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  feedList: {
    width: '100%',
  },
  fashionCard: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  fashionImage: {
    width: '100%',
    height: '100%',
  },
  underlayWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  cardTransformWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  leftControls: {
    position: 'absolute',
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandText: {
    color: 'white',
  fontSize: 17,
  fontWeight: '800',
  includeFontPadding: false,
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'white',
  },
  triedOnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  triedOnText: {
    color: 'white',
  fontSize: 14,
  fontWeight: '800',
  includeFontPadding: false,
  },
  followText: {
    color: 'white',
  fontSize: 15,
  fontWeight: '800',
  includeFontPadding: false,
  },
  followOutline: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  rightControls: {
    position: 'absolute',
    right: 16,
    alignItems: 'center',
    gap: 16,
  },
  actionButton: {
    // Pure white icons, no background
  },
});
