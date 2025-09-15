import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  ListRenderItem,
  Alert,
  Platform,
  ActionSheetIOS,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
  Share,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { Animated, Easing, PanResponder } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Layout, Shadows } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
// Optional gradient for edge fades
let LinearGradient: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  LinearGradient = require('expo-linear-gradient').LinearGradient;
} catch {}

export type ProfileUser = {
  id: string;
  name: string;
  role?: 'BRAND' | 'CREATOR' | 'USER';
  username: string; // without @
  avatarUrl?: string;
  triedOn?: number;
  followers?: number;
  following?: number;
  closetItems?: number; // optional count of closet items
  tags?: string[]; // up to 3
  collections?: CollectionItem[]; // optional collections
};

export type LookItem = {
  id: string;
  imageUrl?: string; // remote URL
  image?: ImageSourcePropType; // local asset
  triedCount?: number; // optional per-look tried-on count
};

type Props = {
  user: ProfileUser;
  looks: LookItem[];
  loading?: boolean;
  onFollow: () => void;
  onMessage: () => void;
  onSave: () => void;
  onLookPress: (look: LookItem) => void;
  onScrolledChange?: (scrolled: boolean) => void;
  isSelf?: boolean;
  // Optional: provide placeholder image URLs (used when looks is empty)
  placeholderLooks?: Array<string | ImageSourcePropType>;
};

type CollectionItem = { id: string; name: string; coverUrl?: string };

type CollectionsProps = {
  isSelf?: boolean;
  collections: CollectionItem[];
  loading?: boolean;
  onPressCollection: (id: string) => void;
  onCreateCollection: () => void;
};

function CollectionChip({ item, onPress }: { item: CollectionItem; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={`${item.name} collection`}
      style={styles.collectionChip}
      activeOpacity={0.85}
    >
      {item.coverUrl ? (
        <Image source={{ uri: item.coverUrl }} style={styles.collectionCover} />
      ) : (
        <View style={styles.collectionCoverFallback} />
      )}
      <View style={styles.collectionTextWrap}>
        <Text style={styles.collectionTitle} numberOfLines={1}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );
}

function CreateChip({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel="Create a new collection"
      style={[styles.collectionChip, styles.createChip]}
      activeOpacity={0.9}
    >
      <View style={styles.collectionTextWrap}>
        <Text style={styles.collectionTitle} numberOfLines={1}>+ Create Collection</Text>
      </View>
    </TouchableOpacity>
  );
}

// Edge fades removed per spec; solid background chips without side overlays

function ProfileCollectionsRow({ isSelf, collections, loading, onPressCollection, onCreateCollection }: CollectionsProps) {
  useEffect(() => {
    const urls = collections.slice(0, 8).map((c) => c.coverUrl).filter(Boolean) as string[];
    urls.forEach((u) => Image.prefetch(u).catch(() => {}));
  }, [collections]);

  if (!loading && (!collections || collections.length === 0)) {
    if (!isSelf) return null;
    return (
      <View style={styles.collectionsWrap}>
        <CreateChip onPress={onCreateCollection} />
        <Text style={styles.collectionsHelper}>Start a collection to group related looks.</Text>
      </View>
    );
  }

  const data: Array<CollectionItem | { id: 'create' } | null> = loading
    ? new Array(4).fill(null)
    : isSelf
      ? ([...collections, { id: 'create' } as any])
      : collections;

  const renderItem = ({ item }: { item: any }) => {
    if (!item) {
      return (
        <View style={styles.collectionChip}>
          <View style={styles.skelSquare} />
          <View style={styles.collectionTextWrap}>
            <View style={styles.skelBar} />
            <View style={styles.skelBarSm} />
          </View>
        </View>
      );
    }
    if (item.id === 'create') return <CreateChip onPress={onCreateCollection} />;
    return <CollectionChip item={item} onPress={() => onPressCollection(item.id)} />;
  };

  return (
    <View style={styles.collectionsWrap}>
      <View style={styles.collectionsScrollerBg}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.collectionsListContent, { paddingHorizontal: 20, alignItems: 'center' }]}
        >
          {data.map((it, idx) => {
            const key = it && (it as any).id ? String((it as any).id) : `sk-${idx}`;
            return (
              <View key={key} style={{ marginRight: idx === data.length - 1 ? 0 : 12 }}>
              {renderItem({ item: it })}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

type MetricsProps = {
  triedOn: number;
  looksPosted: number;
  closetItems: number;
  followers: number;
  following: number;
  bio?: string;
  onOpenSocial?: () => void;
  onSelectSegment?: (seg: 'Looks' | 'Closet' | 'Stats') => void;
};

function TriedOnMetric({
  triedOn,
  followers,
  following,
}: { triedOn: number; followers: number; following: number }) {
  const [open, setOpen] = useState(false);
  const anim = useRef(new Animated.Value(0)).current; // 0 closed, 1 open
  useEffect(() => {
    Animated.timing(anim, {
      toValue: open ? 1 : 0,
      duration: 140,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [open, anim]);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-4, 0] });
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <View style={styles.triedMetricWrap}>
      <Pressable style={styles.triedMetricRow} onPress={() => setOpen((v) => !v)} accessibilityRole="button" accessibilityLabel={kA11yLabel(triedOn)}>
        <Text style={styles.triedMetricNum}>{formatK(triedOn)}</Text>
        <Text style={styles.triedMetricLabel}>Tried-On</Text>
      </Pressable>
      {/** Floating dropdown */}
      {(
        <Animated.View pointerEvents={open ? 'auto' : 'none'} style={[styles.triedDropdown, { opacity, transform: [{ translateY }] }]}> 
          <View style={styles.triedDropdownRow}>
            <Text style={styles.triedDropdownLabel}>Followers</Text>
            <Text style={styles.triedDropdownValue}>{formatK(followers)}</Text>
          </View>
          <View style={styles.triedDropdownRow}>
            <Text style={styles.triedDropdownLabel}>Following</Text>
            <Text style={styles.triedDropdownValue}>{formatK(following)}</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

function ProfileMetricsBlock({
  triedOn,
  looksPosted,
  closetItems,
  followers,
  following,
  bio,
  onOpenSocial,
  onSelectSegment,
}: MetricsProps) {
  return (
    <View style={styles.metricsBlockWrap}>
      {/* Primary metrics row: 3 columns */}
      <View style={styles.metricsPrimaryRow}>
        <Pressable
          style={styles.metricCol}
          accessibilityRole="button"
          accessibilityLabel={`${formatK(triedOn)} Tried On`}
          onPress={() => onSelectSegment?.('Stats')}
        >
          <Text style={styles.metricNum}>{formatK(triedOn)}</Text>
          <Text style={styles.metricLabel}>Tried On</Text>
        </Pressable>
        <Pressable
          style={styles.metricCol}
          accessibilityRole="button"
          accessibilityLabel={`${formatK(looksPosted)} Looks`}
          onPress={() => onSelectSegment?.('Looks')}
        >
          <Text style={styles.metricNum}>{formatK(looksPosted)}</Text>
          <Text style={styles.metricLabel}>Looks</Text>
        </Pressable>
        <Pressable
          style={styles.metricCol}
          accessibilityRole="button"
          accessibilityLabel={`${formatK(closetItems)} Closet items`}
          onPress={() => onSelectSegment?.('Closet')}
        >
          <Text style={styles.metricNum}>{formatK(closetItems)}</Text>
          <Text style={styles.metricLabel}>Closet</Text>
        </Pressable>
      </View>

      {/* Social row */}
      <Pressable
        style={styles.metricsSocialRow}
        onPress={onOpenSocial}
        accessibilityRole="button"
        accessibilityLabel="View followers and following"
      >
  <Text style={styles.metricsSocialText}>
          {`${formatK(followers)} Followers • ${formatK(following)} Following`}
        </Text>
      </Pressable>

      {/* Bio */}
      {!!bio && (
        <Text style={styles.metricsBio} numberOfLines={1} ellipsizeMode="tail">
          {bio}
        </Text>
      )}
    </View>
  );
}

const SEGMENTS = ['Looks', 'Closet'] as const;
type Segment = typeof SEGMENTS[number];

const screenWidth = Dimensions.get('window').width;
const MAX_WIDTH = 390; // as per spec
const CONTENT_PADDING_H = 20;
// Grid spacing: 16px outer padding, 12px gaps between items
const GRID_PADDING_H = 16;
const GRID_GAP = 12;
const containerWidth = Math.min(screenWidth, MAX_WIDTH);
const CARD_WIDTH = Math.floor((containerWidth - GRID_PADDING_H * 2 - GRID_GAP) / 2);
// Hero carousel sizing
// Make hero fully adjusted to the container width with no side inset/peek
const HERO_PEEK = 0;
const HERO_CARD_INSET = 0; // no inset for full fit inside container padding
const HERO_CARD_WIDTH = containerWidth - CONTENT_PADDING_H * 2 - HERO_PEEK - HERO_CARD_INSET;
// Increase height so the avatar is clearly visible while preserving contain-fit
const HERO_HEIGHT = Math.round(Math.max(260, Math.min(360, containerWidth * 0.68)));
// Default placeholders provided by user
const PLACEHOLDER_LOOKS: LookItem[] = [
  { id: 'placeholder-1', imageUrl: 'https://cdn.shopify.com/s/files/1/0863/2936/0687/files/Screenshot_2025-09-12_at_3.03.30_PM.png?v=1757671715' },
  { id: 'placeholder-2', imageUrl: 'https://cdn.shopify.com/s/files/1/0863/2936/0687/files/Screenshot_2025-09-12_at_3.03.50_PM.png?v=1757671715' },
  { id: 'placeholder-3', imageUrl: 'https://cdn.shopify.com/s/files/1/0863/2936/0687/files/Screenshot_2025-09-12_at_3.03.36_PM.png?v=1757671715' },
];

export default function ProfileLooksScreen({
  user,
  looks,
  loading,
  onFollow,
  onMessage,
  onSave,
  onLookPress,
  onScrolledChange,
  isSelf = false,
  placeholderLooks,
}: Props) {
  const router = useRouter();
  const [segment, setSegment] = useState<Segment>('Looks');
  const selectedIndex = SEGMENTS.indexOf(segment);
  const listRef = useRef<FlatList<LookItem>>(null);
  const heroScrollX = useRef(new Animated.Value(0)).current;
  const [heroIndex, setHeroIndex] = useState(0);
  const heroData = useMemo<LookItem[]>(() => {
    const top = Array.isArray(looks) ? looks.slice(0, 5) : [];
    if (top.length) return top;
    const injected = Array.isArray(placeholderLooks) && placeholderLooks.length
      ? placeholderLooks.map((src, i) =>
          typeof src === 'string'
            ? { id: `placeholder-${i + 1}`, imageUrl: src }
            : { id: `placeholder-${i + 1}`, image: src }
        )
      : [];
    if (injected.length) return injected;
    return PLACEHOLDER_LOOKS;
  }, [looks, placeholderLooks]);
  // Removed social modal as metrics block below avatar is deleted
  const [showOverflowModal, setShowOverflowModal] = useState(false);
  const sheetProgress = useRef(new Animated.Value(0)).current; // 0=closed,1=open
  const sheetDrag = useRef(new Animated.Value(0)).current; // drag dy >= 0
  const SHEET_H = 380;
  const sheetTranslate = Animated.add(
    sheetProgress.interpolate({ inputRange: [0, 1], outputRange: [SHEET_H, 0] }),
    sheetDrag
  );
  const backdropOpacity = sheetProgress.interpolate({ inputRange: [0, 1], outputRange: [0, 0.4] });

  const openOverflow = () => {
    setShowOverflowModal(true);
    sheetDrag.setValue(0);
    Animated.timing(sheetProgress, {
      toValue: 1,
      duration: 240,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };
  const closeOverflow = () => {
    Animated.timing(sheetProgress, {
      toValue: 0,
      duration: 200,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setShowOverflowModal(false);
    });
  };

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dy) > 4,
      onPanResponderMove: (_e, g) => {
        const dy = Math.max(0, g.dy);
        sheetDrag.setValue(dy);
      },
      onPanResponderRelease: (_e, g) => {
        const dy = Math.max(0, g.dy);
        const shouldClose = dy > 80 || g.vy > 0.8;
        if (shouldClose) {
          closeOverflow();
        } else {
          Animated.spring(sheetDrag, { toValue: 0, useNativeDriver: true, bounciness: 0 }).start();
        }
      },
    })
  ).current;
  const [toast, setToast] = useState<string | null>(null);
  const [handleHintVisible, setHandleHintVisible] = useState(false);
  const handleHintOpacity = useRef(new Animated.Value(0)).current;
  const [sharing, setSharing] = useState(false);

  // Optional: index profile for local search (name + handle)
  try {
    // Lazy import to avoid bundling issues if file is missing in some builds
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const search = require('@/services/search');
    if (search && typeof search.indexProfile === 'function') {
      search.indexProfile({ id: user.id, name: user.name, handle: user.username });
    }
  } catch {}

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1600);
  }, []);

  // For sizing the Try Look button to roughly match dots width
  // Fixed Try Look button width to avoid auto-resizing with indicator count
  const TRY_BUTTON_WIDTH = 140;

  // Sliding underline indicator state
  const ICON_SIZE = 26;
  const UNDERLINE_SIDE_EXTRA = 10; // a bit narrower for icon-only tabs
  const INDICATOR_WIDTH = ICON_SIZE + UNDERLINE_SIDE_EXTRA * 2; // wider than icon
  // Keep tabs indicator calculations aligned to the actual inner width (exclude horizontal padding)
  const TABS_PADDING_H = CONTENT_PADDING_H;
  const indicatorLeft = useRef(new Animated.Value(0)).current;
  const tabsWidthRef = useRef(0); // kept for backward compat
  const tabsInnerWidthRef = useRef(0);
  // We compute equal segment centers based on total width; no per-tab centers needed now
  // Pre-create per-tab scale values to avoid hooks in loops
  const tabScalesRef = useRef(SEGMENTS.map((_, i) => new Animated.Value(i === selectedIndex ? 1.08 : 0.95)));

  // Sync scales when selected tab changes
  useEffect(() => {
    tabScalesRef.current.forEach((scale, i) => {
      Animated.spring(scale, {
        toValue: i === selectedIndex ? 1.08 : 0.95,
        friction: 6,
        tension: 120,
        useNativeDriver: true,
      }).start();
    });
  }, [selectedIndex]);

  const updateIndicatorPosition = useCallback((index: number, animate = true) => {
    const inner = tabsInnerWidthRef.current;
    if (!inner) return;
    const segW = inner / SEGMENTS.length;
    const center = segW * index + segW / 2;
    // Absolute left includes the left padding offset of the tabs container
    const left = TABS_PADDING_H + (center - INDICATOR_WIDTH / 2);
    if (animate) {
      Animated.spring(indicatorLeft, {
        toValue: left,
        useNativeDriver: false,
        friction: 8,
        tension: 140,
      }).start();
    } else {
      indicatorLeft.setValue(left);
    }
  }, [indicatorLeft]);

  useEffect(() => {
    updateIndicatorPosition(selectedIndex, true);
  }, [selectedIndex, updateIndicatorPosition]);

  // App-level header removed per spec. Only profile strip remains.

  // Overflow/extra actions removed to keep action row focused on primary actions

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    onScrolledChange?.(y > 8);
  }, [onScrolledChange]);

  // No global header here

  const ProfileBlock = (
    <View style={styles.profileHeader}>
      {/* Hero swipeable looks carousel */}
      <View style={styles.heroWrap}>
        <Animated.FlatList
          data={heroData}
          keyExtractor={(i: LookItem) => i.id}
          horizontal
          showsHorizontalScrollIndicator={false}
              snapToInterval={HERO_CARD_WIDTH + HERO_PEEK}
          decelerationRate="fast"
              contentContainerStyle={{ paddingHorizontal: CONTENT_PADDING_H }}
              ItemSeparatorComponent={() => <View style={{ width: HERO_PEEK }} />}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: heroScrollX } } }],
            {
              useNativeDriver: true,
              listener: (e: any) => {
                const x = e?.nativeEvent?.contentOffset?.x ?? 0;
                const w = HERO_CARD_WIDTH + HERO_PEEK;
                const idx = Math.max(0, Math.min(heroData.length - 1, Math.round(x / w)));
                setHeroIndex(idx);
              },
            }
          )}
          onMomentumScrollEnd={(e) => {
            const x = e.nativeEvent.contentOffset.x;
            const w = HERO_CARD_WIDTH + HERO_PEEK;
            const idx = Math.max(0, Math.min(heroData.length - 1, Math.round(x / w)));
            setHeroIndex(idx);
          }}
          renderItem={({ item, index }) => {
            const inputRange = [
              (index - 1) * (HERO_CARD_WIDTH + HERO_PEEK),
              index * (HERO_CARD_WIDTH + HERO_PEEK),
              (index + 1) * (HERO_CARD_WIDTH + HERO_PEEK),
            ];
            const scale = heroScrollX.interpolate({
              inputRange,
              outputRange: [0.98, 1, 0.98],
              extrapolate: 'clamp',
            });
            const hasImage = !!(item.imageUrl || item.image);
            const count = typeof item.triedCount === 'number' ? item.triedCount : 4200 + (index * 137) % 900; // placeholder variety
            return (
              <Animated.View style={[styles.heroCard, { width: HERO_CARD_WIDTH, height: HERO_HEIGHT, transform: [{ scale }] }]}>
                {hasImage ? (
                  <Image source={item.image ? item.image : { uri: item.imageUrl! }} style={styles.heroImageContain} />
                ) : (
                  <View style={styles.heroPlaceholderWrap} />
                )}
                {/* Counter moved above indicator dots */}
              </Animated.View>
            );
          }}
        />
      </View>

      {/* Dots above the Try Look button, aligned to button width */}
      <View style={styles.heroActionsRow}>
        <View style={styles.heroActionBlock}>
          {/* Per-look tried-on counter (centered, above dots) */}
          {heroData.length > 0 && (() => {
            const it = heroData[Math.max(0, Math.min(heroIndex, heroData.length - 1))];
            const val = it && typeof it.triedCount === 'number' ? it.triedCount : (4200 + (heroIndex * 137) % 900);
            return (
              <Text style={styles.heroUnderlineTextCenter} accessibilityLabel={`${formatK(val)} tried on`} numberOfLines={1}>
                {`${formatK(val)} Tried-On`}
              </Text>
            );
          })()}
          {heroData.length > 1 && (
            <View style={styles.heroDotsOverBtn}>
              {heroData.map((_, i) => {
                const interval = HERO_CARD_WIDTH + HERO_PEEK;
                const inputRange = [
                  (i - 1) * interval,
                  i * interval,
                  (i + 1) * interval,
                ];
                const scale = heroScrollX.interpolate({
                  inputRange,
                  outputRange: [1, 1.28, 1],
                  extrapolate: 'clamp',
                });
                const opacity = heroScrollX.interpolate({
                  inputRange,
                  outputRange: [0, 1, 0],
                  extrapolate: 'clamp',
                });
                return (
                  <Animated.View key={i} style={{ transform: [{ scale }], marginHorizontal: 6 }}>
                    <View style={styles.heroDot}>
                      <Animated.View style={[styles.heroDotOverlay, { opacity }]} />
                    </View>
                  </Animated.View>
                );
              })}
            </View>
          )}
          <TouchableOpacity
            style={[styles.btnPillPrimary, { width: TRY_BUTTON_WIDTH }]}
            onPress={() => {
              if (isSelf) {
                Alert.alert('Edit Look', 'Replace or update this look');
              } else {
                Alert.alert('Try Look', 'Applying to your avatar…');
              }
            }}
            accessibilityRole="button"
            accessibilityLabel={isSelf ? 'Edit look' : 'Try look'}
          >
            <Text style={styles.btnPillPrimaryText} numberOfLines={1}>
              {isSelf ? 'Edit Look' : 'Try Look'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

  {/* Metrics block removed per request */}

      {/* Collections row (new) */}
      <ProfileCollectionsRow
        isSelf={isSelf}
        collections={(user.collections || []).map((c: any, i) => {
          if (typeof c === 'string') {
            const id = slugify(c) || `c-${i}`;
            return { id, name: c };
          }
          const name = c?.name ?? `Collection ${i + 1}`;
          const id = c?.id || (name ? slugify(String(name)) : `c-${i}`) || `c-${i}`;
          return { id: String(id), name: String(name), coverUrl: c?.coverUrl };
        })}
        loading={loading}
        onPressCollection={(id) => router.push(`/collection/${id}`)}
        onCreateCollection={() => router.push('/collections/create')}
      />
    </View>
  );

  // replaced by animated openOverflow above

  const Toolbar = (
    <View style={styles.toolbar} accessibilityRole="header">
      {/* Left: Name row + badge row */}
      <View style={{ flex: 1 }}>
        {/* Row 1: Name (press/long-press) */}
        <Pressable
          onPress={() => {
            setHandleHintVisible(true);
            handleHintOpacity.setValue(0);
            Animated.timing(handleHintOpacity, { toValue: 0.6, duration: 180, useNativeDriver: false }).start(() => {
              setTimeout(() => {
                Animated.timing(handleHintOpacity, { toValue: 0, duration: 300, useNativeDriver: false }).start(() => setHandleHintVisible(false));
              }, 2000);
            });
          }}
          onLongPress={async () => {
            try {
              await Clipboard.setStringAsync(`@${user.username}`);
              showToast('Handle copied');
            } catch {}
          }}
          accessibilityLabel={`${user.name}`}
        >
          <Text style={styles.toolbarTitle} numberOfLines={1} ellipsizeMode="tail">{user.name}</Text>
        </Pressable>
        {/* Optional handle hint (temporary) */}
        {handleHintVisible && (
          <Animated.Text style={[styles.handleHint, { opacity: handleHintOpacity }]} numberOfLines={1} ellipsizeMode="middle">
            @{user.username}
          </Animated.Text>
        )}
  {/* Row 2: Tried-On metric row with dropdown */}
  <View style={{ marginTop: 4 }}>
          <TriedOnMetric triedOn={user.triedOn ?? 0} followers={user.followers ?? 0} following={user.following ?? 0} />
        </View>
      </View>
      {/* Right: overflow/settings icon */}
      {isSelf ? (
        <TouchableOpacity hitSlop={HIT} onPress={() => router.push('/settings')}>
          <Ionicons name="settings-outline" size={22} color="#111" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity hitSlop={HIT} onPress={openOverflow}>
          <Ionicons name="ellipsis-horizontal" size={22} color="#111" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderItem: ListRenderItem<LookItem> = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => onLookPress(item)}>
      <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
      {/* Subtle tried-on overlay (mirror glyph + count) */}
      <View style={styles.cardTriedWrap} pointerEvents="none">
        <Svg width={16} height={16} viewBox="0 0 16 16" color="rgba(255,255,255,0.92)" accessibilityRole="image" accessibilityLabel="Tried-On">
          {/* Frame (open bottom): arced top + side posts */}
          <Path d="M3 2.8 C 6.3 2.0, 9.7 2.0, 13 2.8" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
          <Path d="M2.6 3.2 V 12.4" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
          <Path d="M13.4 3.2 V 12.4" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
          {/* Head: slightly lower/smaller to create clear gap from top arc */}
          <Circle cx={8} cy={6.4} r={2.0} stroke="currentColor" strokeWidth={1.5} fill="none" />
          {/* Subtle neck */}
          <Path d="M8 8.2 v 0.5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
          {/* Shoulders: balanced curve */}
          <Path d="M5 11.6 c 1.4 -1.4, 4.6 -1.4, 6 0" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" fill="none" />
        </Svg>
        <Text style={styles.cardTriedText}>{formatK(typeof item.triedCount === 'number' ? item.triedCount : 0)}</Text>
      </View>
    </TouchableOpacity>
  );

  const keyExtractor = (item: LookItem) => item.id;

  // Loading shimmer placeholders
  const Shimmer = () => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP, paddingHorizontal: GRID_PADDING_H, marginTop: 12 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={i} style={[styles.card, styles.shimmer]} />
      ))}
    </View>
  );

  // Grid data per tab: use avatar placeholder images for Closet and Stats for now
  const avatarPlaceholder = user.avatarUrl || (PLACEHOLDER_LOOKS[0]?.imageUrl ?? undefined);
  const closetItemsData: LookItem[] = useMemo(() => {
    const count = Math.max(0, user.closetItems ?? 6); // default a few tiles if count unknown
    return Array.from({ length: count }).map((_, i) => ({ id: `closet-${i + 1}`, imageUrl: avatarPlaceholder }));
  }, [user.closetItems, avatarPlaceholder]);
  const filteredLooks = useMemo(() => {
    switch (segment) {
      case 'Closet':
        return closetItemsData;
      case 'Looks':
      default:
  return (Array.isArray(looks) && looks.length > 0) ? looks : heroData;
    }
  }, [segment, looks, closetItemsData, heroData]);

  const header = (
    <View style={styles.headerContainer}>
  {Toolbar}
      {ProfileBlock}
      {/* Tabs: Looks / Closet / Stats */}
      <View
        style={styles.tabsWrap}
        onLayout={(e) => {
          const width = e.nativeEvent.layout.width;
          const inner = width - TABS_PADDING_H * 2;
          tabsInnerWidthRef.current = inner;
          // position indicator for initial tab without animation
          const segW = inner / SEGMENTS.length;
          const center = segW * selectedIndex + segW / 2;
          const left = TABS_PADDING_H + (center - INDICATOR_WIDTH / 2);
          indicatorLeft.setValue(left);
        }}
      >
        {SEGMENTS.map((label, i) => {
          const isActive = segment === label;
          const scale = tabScalesRef.current[i];
          const iconNameActive = label === 'Looks' ? 'grid' : 'shirt';
          const iconNameInactive = label === 'Looks' ? 'grid-outline' : 'shirt-outline';
          return (
            <TouchableOpacity
              key={label}
              style={styles.tabItem}
              onPress={() => {
                setSegment(label as Segment);
                updateIndicatorPosition(i);
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${label} tab`}
            >
              <Animated.View style={{ transform: [{ scale }] }}>
                <Ionicons name={(isActive ? iconNameActive : iconNameInactive) as any} size={ICON_SIZE} color={isActive ? '#000' : '#6B7280'} />
              </Animated.View>
            </TouchableOpacity>
          );
        })}
        <Animated.View style={[styles.indicator, { width: INDICATOR_WIDTH, transform: [{ translateX: indicatorLeft }] }]} />
      </View>
    </View>
  );

  return (
    <>
  {/* Social modal removed with metrics block */}
      {/* Overflow Bottom Sheet */}
      <Modal visible={showOverflowModal} transparent onRequestClose={closeOverflow}>
        <Pressable style={[styles.sheetBackdrop, { opacity: 1 }]} onPress={closeOverflow}>
          <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'black', opacity: backdropOpacity }]} />
        </Pressable>
        <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetTranslate }] }]} {...pan.panHandlers}>
          <View style={styles.sheetHandle} />
          {/* Handle / username */}
          <TouchableOpacity
            style={styles.sheetHandleRow}
            onPress={async () => {
              try { await Clipboard.setStringAsync(`@${user.username}`); showToast('Handle copied'); } catch {}
            }}
            accessibilityLabel={`Username @${user.username}, double tap to copy`}
            accessibilityRole="button"
          >
            <Text style={styles.sheetUsername}>@{user.username}</Text>
          </TouchableOpacity>
          {/* Followers / Following */}
          <View style={styles.sheetCountsRow}>
            <View style={styles.sheetCountCol}>
              <Text style={styles.sheetCountNumber}>{formatK(user.followers ?? 0)}</Text>
              <Text style={styles.sheetCountLabel}>Followers</Text>
            </View>
            <View style={styles.sheetCountCol}>
              <Text style={styles.sheetCountNumber}>{formatK(user.following ?? 0)}</Text>
              <Text style={styles.sheetCountLabel}>Following</Text>
            </View>
          </View>
          {/* Actions */}
          <TouchableOpacity
            style={styles.sheetActionRow}
            onPress={async () => {
              if (sharing) return;
              try {
                setSharing(true);
                await Share.share({ message: `Check out @${user.username} on Cloon` });
              } catch {
                // ignore
              } finally {
                setSharing(false);
                // Close after share completes to prevent UI flicker or freeze
                closeOverflow();
              }
            }}
            disabled={sharing}
          >
            <Ionicons name="share-outline" size={18} color="#111" style={styles.sheetActionIcon} />
            <Text style={styles.sheetActionText}>Share Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sheetActionRow} onPress={() => { Alert.alert('Reported', 'Thanks for the report.'); closeOverflow(); }}>
            <Ionicons name="flag-outline" size={18} color="#DC2626" style={styles.sheetActionIcon} />
            <Text style={[styles.sheetActionText, styles.sheetActionDestructive]}>Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sheetActionRow} onPress={() => { Alert.alert('Blocked', `You will no longer see @${user.username}`); closeOverflow(); }}>
            <Ionicons name="ban-outline" size={18} color="#DC2626" style={styles.sheetActionIcon} />
            <Text style={[styles.sheetActionText, styles.sheetActionDestructive]}>Block</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sheetCancelRow} onPress={closeOverflow}>
            <Text style={styles.sheetCancelText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
      {/* Toast */}
      {toast && (
        <View style={styles.toast} pointerEvents="none">
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
      <FlatList
        ref={listRef}
        style={styles.list}
        onScroll={onScroll}
        scrollEventThrottle={16}
        data={loading ? [] : filteredLooks}
        keyExtractor={keyExtractor}
        numColumns={2}
        renderItem={renderItem}
        ListHeaderComponent={header}
        columnWrapperStyle={{ gap: GRID_GAP, paddingHorizontal: GRID_PADDING_H }}
  contentContainerStyle={{ paddingTop: 6, paddingBottom: 80, rowGap: GRID_GAP / 2 }}
        ListEmptyComponent={
          loading ? (
            <View>
              <Shimmer />
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>No looks yet</Text>
              <Text style={styles.emptyBody}>Check Closet to upload or explore.</Text>
            </View>
          )
        }
      />
    </>
  );
}

function formatK(n?: number) {
  if (n == null) return '0';
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(n % 1000 >= 100 ? 1 : 0)}K`;
}

// Convert a number to an accessibility label with spelled-out K units.
function kA11yLabel(n?: number) {
  const formatted = formatK(n ?? 0); // e.g., "27.1K" or "27K" or "420"
  if (!formatted.toUpperCase().includes('K')) {
    return `${formatted} tried on total`;
  }
  const numPart = formatted.replace(/K/i, '');
  // Speak dot as "point" when there is a decimal
  const parts = numPart.split('.');
  const whole = parts[0];
  const frac = parts[1];
  const spoken = frac ? `${whole} point ${frac}` : whole;
  return `${spoken} K tried on total`;
}

const styles = StyleSheet.create({
  shellContent: {
    paddingTop: 8,
    paddingBottom: Spacing.xxl,
  },
  outer: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MAX_WIDTH,
  },
  headerContainer: { paddingTop: 0 },
  list: { flex: 1 },
  profileHeader: {
    paddingHorizontal: CONTENT_PADDING_H,
    paddingTop: 6, // tighter to move avatar up after header
    gap: 10,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: CONTENT_PADDING_H,
    paddingTop: 8,
  paddingBottom: 4,
  },
  toolbarLeft: { gap: 2 },
  toolbarTitle: { fontSize: 20, fontWeight: Typography.fontWeight.semibold, color: '#111' },
  toolbarSubtitle: { fontSize: 13, color: '#6B7280', fontWeight: Typography.fontWeight.medium },
  handleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bullet: { color: '#6B7280' },
  triedBadge: { height: 24, borderRadius: 12, paddingHorizontal: 10, backgroundColor: '#F2F2F7', justifyContent: 'center' },
  triedBadgeText: { fontSize: 12, color: '#111', fontWeight: Typography.fontWeight.medium },
  handleHint: { fontSize: 13, color: '#000', opacity: 0.6, marginTop: 2 },
  // Tried-On Metric header row
  triedMetricWrap: { position: 'relative', alignSelf: 'flex-start' },
  triedMetricRow: { flexDirection: 'row', alignItems: 'center' },
  triedMetricNum: { fontSize: 16, fontWeight: Typography.fontWeight.medium, color: '#6B7280', marginRight: 6 },
  triedMetricLabel: { fontSize: 13, color: '#6B7280', fontWeight: Typography.fontWeight.medium, letterSpacing: 0.2 },
  triedDropdown: {
    position: 'absolute',
    top: 28,
    left: 0,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
    minWidth: 200,
  },
  triedDropdownRow: { flexDirection: 'column', alignItems: 'flex-start', paddingVertical: 4 },
  triedDropdownLabel: { fontSize: 12, color: '#6B7280', fontWeight: Typography.fontWeight.medium },
  triedDropdownValue: { fontSize: 16, color: '#111', fontWeight: Typography.fontWeight.semibold, marginTop: 2 },
  toolbarHandle: { fontSize: 15, color: Colors.text.primary, fontWeight: Typography.fontWeight.medium },
  rowStart: { flexDirection: 'row', alignItems: 'center' },
  avatarWrap72: { width: 80, height: 80, borderRadius: 40, overflow: 'hidden', backgroundColor: Colors.border, marginRight: 14 },
  avatarFill: { width: '100%', height: '100%' },
  avatarPlaceholder: {
    backgroundColor: Colors.border,
  },
  nameRowNew: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  name20: { fontSize: 20, fontWeight: Typography.fontWeight.semibold, color: Colors.text.primary },
  roleChip: { height: 20, paddingHorizontal: 10, borderRadius: 10, backgroundColor: '#F2F2F7', justifyContent: 'center' },
  roleChipText: { fontSize: 11, color: '#6E6E73', fontWeight: Typography.fontWeight.medium },
  metrics3: { flexDirection: 'row', gap: 16, marginTop: 4 },
  metricCol: { flex: 1, alignItems: 'center' },
  metricColIconOnly: { justifyContent: 'center' },
  metricColWithArrow: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  metricInnerCol: { alignItems: 'center' },
  metricNum: { fontSize: 20, fontWeight: Typography.fontWeight.semibold, color: '#111', textAlign: 'center' },
  metricLabel: { fontSize: 13, color: '#6B7280', fontWeight: Typography.fontWeight.medium, marginTop: 4, textAlign: 'center' },
  tags13: { fontSize: 13, color: Colors.text.secondary, marginTop: 6 },
  handleRowNew: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  handleUnderline: { color: Colors.text.primary, textDecorationLine: 'underline' },
  actionsRowNew: { flexDirection: 'row', gap: 12, marginTop: 12, alignItems: 'center' },
  heroWrap: { marginTop: 8, marginBottom: 14, position: 'relative' },
  // Pure white background and squared edges to emphasize the avatar on a clean canvas
  heroCard: { borderRadius: 0, overflow: 'hidden', backgroundColor: '#FFFFFF' },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  heroImageContain: { width: '100%', height: '100%', resizeMode: 'contain', backgroundColor: '#FFFFFF' },
  heroPlaceholderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  heroBadge: { position: 'absolute', left: 10, bottom: 10, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 12 },
  heroBadgeText: { fontSize: 12.5, fontWeight: Typography.fontWeight.medium },
  heroUnderlineWrap: { position: 'absolute', left: 0, right: 0, bottom: 8, alignItems: 'center' },
  heroUnderlineText: { fontSize: 12.5, color: '#111', fontWeight: Typography.fontWeight.medium, textDecorationLine: 'underline', letterSpacing: 0.2 },
  heroUnderlineTextCenter: { fontSize: 16, color: '#6B7280', fontWeight: Typography.fontWeight.medium, letterSpacing: 0.2, textAlign: 'center', marginBottom: 8 },
  heroCta: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    ...Shadows.button,
  },
  heroDots: { position: 'absolute', top: 6, left: 0, right: 0, height: 14, alignItems: 'center', justifyContent: 'center', zIndex: 2, flexDirection: 'row' },
  heroDotsTop: { paddingTop: 4, paddingBottom: 4, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  heroDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.15)', overflow: 'hidden' },
  heroDotActive: { backgroundColor: '#000000' },
  heroDotOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 4, backgroundColor: '#000000' },
  heroActionsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: CONTENT_PADDING_H, marginTop: 6 },
  heroActionBlock: { alignItems: 'center', justifyContent: 'center' },
  heroDotsOverBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  btnPillLight: { flexDirection: 'row', alignItems: 'center', height: 40, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' },
  btnPillLightText: { color: Colors.text.primary, fontWeight: Typography.fontWeight.medium },
  btnPillPrimary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 42, paddingHorizontal: 18, borderRadius: 21, backgroundColor: '#000000' },
  btnPillPrimaryText: { color: '#FFFFFF', fontWeight: Typography.fontWeight.semibold, fontSize: 16 },
  metricsRowWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  metricsPanel: { flex: 1, flexDirection: 'column', backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, ...Shadows.card },
  metricsPanelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metricsSecondRow: { marginTop: 8, flexDirection: 'row', alignItems: 'center' },
  metricsSecondRowArrow: { marginLeft: 'auto' },
  socialArrowBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6', marginLeft: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  socialArrowInline: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', borderWidth: 0 },
  socialDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D1D5DB', marginLeft: 8 },
  metricsBioText: { fontSize: 13, color: Colors.text.secondary, marginTop: 8, textAlign: 'center' },
  // New metrics block styles
  metricsBlockWrap: { alignSelf: 'center', width: '100%', maxWidth: MAX_WIDTH, paddingHorizontal: 16 },
  metricsPrimaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 },
  metricsSocialRow: { marginTop: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  metricsSocialText: { fontSize: 13, fontWeight: Typography.fontWeight.medium, color: '#374151' },
  metricsBio: { marginTop: 10, marginBottom: 10, fontSize: 13, lineHeight: 18, color: '#555', textAlign: 'center', paddingHorizontal: 16 },
  btn40: { height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, borderWidth: 1, borderColor: '#E5E5EA' },
  btnFollow: { backgroundColor: '#000', minWidth: 92, borderColor: '#000' },
  btnFollowText: { color: '#fff', fontWeight: Typography.fontWeight.medium },
  btnMessage: { backgroundColor: Colors.background, minWidth: 120 },
  btnMessageText: { color: Colors.text.primary, fontWeight: Typography.fontWeight.medium },
  // Removed small icon-only buttons to declutter primary actions
  tabsWrap: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: CONTENT_PADDING_H, marginTop: 10, paddingBottom: 1 },
  tabItem: { flex: 1, alignItems: 'center', paddingTop: 10, paddingBottom: 2 },
  indicator: {
    position: 'absolute',
  height: 2,
  borderRadius: 1,
    backgroundColor: '#000',
  bottom: 0,
    left: 0,
  },
  tabLabel15: { fontSize: 15 },
  tabActiveText: { color: '#000', fontWeight: Typography.fontWeight.semibold },
  tabInactiveText: { color: '#6B7280' },
  tabActiveUnderline: { borderBottomWidth: 2, borderBottomColor: '#000', paddingBottom: 6 },
  card: { width: CARD_WIDTH, aspectRatio: 1, backgroundColor: Colors.border, borderRadius: 12, overflow: 'hidden' },
  cardImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  cardTriedWrap: { position: 'absolute', left: 8, bottom: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 4 },
  cardTriedLabel: { fontSize: 12, color: '#FFFFFF', fontWeight: Typography.fontWeight.medium },
  cardTriedText: { marginLeft: 4, fontSize: 12, fontWeight: Typography.fontWeight.medium, color: '#FFFFFF' },
  shimmer: {
    backgroundColor: Colors.border,
    opacity: 0.6,
  },
  emptyWrap: {
    paddingHorizontal: CONTENT_PADDING_H,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.h2,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  emptyBody: {
    color: Colors.text.secondary,
  },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' },
  modalCard: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#FFFFFF', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, gap: 12 },
  modalHandle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', marginBottom: 6 },
  modalTitle: { fontSize: 16, fontWeight: Typography.fontWeight.semibold, color: Colors.text.primary, marginBottom: 4 },
  modalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  modalLabel: { color: Colors.text.secondary },
  modalValue: { color: Colors.text.primary, fontWeight: Typography.fontWeight.medium },
  actionRow: { paddingVertical: 12 },
  actionText: { fontSize: 16, color: Colors.text.primary },
  toast: { position: 'absolute', bottom: 90, left: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.85)', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, alignItems: 'center' },
  toastText: { color: '#fff', fontSize: 13, fontWeight: Typography.fontWeight.medium },
  // Bottom sheet styles
  sheetBackdrop: { ...StyleSheet.absoluteFillObject },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 12,
    elevation: 10,
  },
  sheetHandle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', marginBottom: 8 },
  sheetHandleRow: { alignItems: 'center', paddingVertical: 10 },
  sheetUsername: { fontSize: 14, color: '#6B7280', fontWeight: Typography.fontWeight.medium },
  sheetCountsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, marginBottom: 10 },
  sheetCountCol: { alignItems: 'center', flex: 1 },
  sheetCountNumber: { fontSize: 18, color: '#111', fontWeight: Typography.fontWeight.semibold },
  sheetCountLabel: { fontSize: 13, color: '#6B7280', fontWeight: Typography.fontWeight.medium, marginTop: 2 },
  sheetActionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  sheetActionIcon: { marginRight: 10 },
  sheetActionText: { fontSize: 16, color: '#111', fontWeight: Typography.fontWeight.medium },
  sheetActionDestructive: { color: '#DC2626' },
  sheetCancelRow: { alignItems: 'center', paddingVertical: 12 },
  sheetCancelText: { fontSize: 15, color: '#6B7280' },
  // Collections Row styles
  collectionsWrap: { paddingHorizontal: 0, marginTop: 12 },
  collectionsListContent: {},
  collectionsScrollerBg: { backgroundColor: 'transparent', borderRadius: 0, marginHorizontal: 0, paddingHorizontal: 0 },
  collectionsHelper: { marginTop: 8, fontSize: 11, color: '#6B7280' },
  collectionChip: {
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F6F7F8',
    borderColor: '#ECECEC',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  collectionCover: { width: 28, height: 28, borderRadius: 6, resizeMode: 'cover' },
  collectionCoverFallback: { width: 28, height: 28, borderRadius: 6, backgroundColor: '#E5E7EB' },
  collectionTextWrap: { marginLeft: 10, justifyContent: 'center' },
  collectionTitle: { fontSize: 15, fontWeight: Typography.fontWeight.medium, color: '#111' },
  createChip: { borderStyle: 'dashed' },
  createIconCircle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#ECECEC' },
  skelSquare: { width: 28, height: 28, borderRadius: 6, backgroundColor: '#E5E7EB' },
  skelBar: { width: 80, height: 12, borderRadius: 4, backgroundColor: '#E5E7EB', marginTop: 4 },
  skelBarSm: { width: 50, height: 10, borderRadius: 4, backgroundColor: '#E5E7EB', marginTop: 4 },
});

const HIT = { top: 8, bottom: 8, left: 8, right: 8 } as const;

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
