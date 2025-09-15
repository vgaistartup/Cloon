import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ScrollView,
  Image,
  Platform,
  StatusBar,
  Animated,
  Alert,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout } from '@/constants/theme';
import Screen from '@/components/Screen';

const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

// Mock data for demonstration
const mockHeroData = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
    title: 'Summer Vibes',
    subtitle: 'Fresh looks for the season',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
    title: 'Urban Style',
    subtitle: 'City-inspired fashion',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400',
    title: 'Minimalist',
    subtitle: 'Clean and timeless',
  },
];

const mockTrendingLooks = [
  { id: '1', image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300', brand: 'Zara', caption: 'Casual chic' },
  { id: '2', image: 'https://images.unsplash.com/photo-1506629905607-0b5b8b5b9b5b?w=300', brand: 'H&M', caption: 'Street style' },
  { id: '3', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300', brand: 'Nike', caption: 'Athleisure' },
  { id: '4', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300', brand: 'Adidas', caption: 'Sporty look' },
];

const mockMostTriedOn = [
  { id: '1', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200' },
  { id: '2', image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=200' },
  { id: '3', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200' },
  { id: '4', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=200' },
  { id: '5', image: 'https://images.unsplash.com/photo-1582582494368-986c84ba9e2c?w=200' },
];

const mockCollections = [
  { id: '1', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400', title: 'Summer Collection' },
  { id: '2', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400', title: 'Urban Essentials' },
  { id: '3', image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400', title: 'Minimal Wardrobe' },
];

const mockBrands = [
  { id: '1', name: 'Zara', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200' },
  { id: '2', name: 'H&M', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=200' },
  { id: '3', name: 'Nike', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200' },
  { id: '4', name: 'Adidas', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200' },
];

const mockSeasonalDrops = [
  { id: '1', image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300', tag: 'NEW' },
  { id: '2', image: 'https://images.unsplash.com/photo-1506629905607-0b5b8b5b9b5b?w=300', tag: 'HOT' },
  { id: '3', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300', tag: 'TREND' },
  { id: '4', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300', tag: 'LIMITED' },
];

interface HeroItemProps {
  item: typeof mockHeroData[0];
}

const HeroItem: React.FC<HeroItemProps> = ({ item }) => (
  <View style={styles.heroItem}>
    <Image source={{ uri: item.image }} style={styles.heroImage} />
    <View style={styles.heroOverlay}>
      <Text style={styles.heroTitle}>{item.title}</Text>
      <Text style={styles.heroSubtitle}>{item.subtitle}</Text>
    </View>
  </View>
);

interface SectionHeaderProps {
  title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

interface TrendingLookItemProps {
  item: typeof mockTrendingLooks[0];
  onPress: () => void;
  onLongPress: () => void;
}

const TrendingLookItem: React.FC<TrendingLookItemProps> = ({ item, onPress, onLongPress }) => (
  <TouchableOpacity
    style={styles.trendingItem}
    onPress={onPress}
    onLongPress={onLongPress}
    accessibilityLabel={`Trending look by ${item.brand}`}
    accessibilityRole="button"
  >
    <Image source={{ uri: item.image }} style={styles.trendingImage} />
    <View style={styles.trendingGradient} />
    <Text style={styles.trendingCaption}>{item.caption}</Text>
  </TouchableOpacity>
);

interface MostTriedOnItemProps {
  item: typeof mockMostTriedOn[0];
  onPress: () => void;
  onLongPress: () => void;
}

const MostTriedOnItem: React.FC<MostTriedOnItemProps> = ({ item, onPress, onLongPress }) => (
  <TouchableOpacity
    style={styles.mostTriedItem}
    onPress={onPress}
    onLongPress={onLongPress}
    accessibilityLabel="Most tried-on item"
    accessibilityRole="button"
  >
    <Image source={{ uri: item.image }} style={styles.mostTriedImage} />
  </TouchableOpacity>
);

interface CollectionItemProps {
  item: typeof mockCollections[0];
  onPress: () => void;
}

const CollectionItem: React.FC<CollectionItemProps> = ({ item, onPress }) => (
  <TouchableOpacity
    style={styles.collectionItem}
    onPress={onPress}
    accessibilityLabel={`Collection: ${item.title}`}
    accessibilityRole="button"
  >
    <Image source={{ uri: item.image }} style={styles.collectionImage} />
    <View style={styles.collectionOverlay}>
      <Text style={styles.collectionTitle}>{item.title}</Text>
    </View>
  </TouchableOpacity>
);

interface BrandItemProps {
  item: typeof mockBrands[0];
  onPress: () => void;
}

const BrandItem: React.FC<BrandItemProps> = ({ item, onPress }) => (
  <TouchableOpacity
    style={styles.brandItem}
    onPress={onPress}
    accessibilityLabel={`Brand: ${item.name}`}
    accessibilityRole="button"
  >
    <Image source={{ uri: item.image }} style={styles.brandImage} />
    <Text style={styles.brandName}>{item.name}</Text>
  </TouchableOpacity>
);

interface SeasonalDropItemProps {
  item: typeof mockSeasonalDrops[0];
  onPress: () => void;
  onLongPress: () => void;
}

const SeasonalDropItem: React.FC<SeasonalDropItemProps> = ({ item, onPress, onLongPress }) => (
  <TouchableOpacity
    style={styles.seasonalItem}
    onPress={onPress}
    onLongPress={onLongPress}
    accessibilityLabel={`Seasonal drop with tag ${item.tag}`}
    accessibilityRole="button"
  >
    <Image source={{ uri: item.image }} style={styles.seasonalImage} />
    <View style={styles.seasonalTag}>
      <Text style={styles.seasonalTagText}>{item.tag}</Text>
    </View>
  </TouchableOpacity>
);

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
            style={[styles.actionButton, styles.addToQueueButton]}
            onPress={onAddToQueue}
            accessibilityLabel="Add to queue"
            accessibilityRole="button"
          >
            <Ionicons name="add-circle-outline" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Add to Queue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.postButton]}
            onPress={onPost}
            accessibilityLabel="Post"
            accessibilityRole="button"
          >
            <Ionicons name="share-outline" size={16} color="#666666" />
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
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

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [heroIndex, setHeroIndex] = useState(0);
  const [actionBarVisible, setActionBarVisible] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const scrollY = useRef(new Animated.Value(0)).current;

  const topBarHeight = insets.top + 56;
  const bottomReserve = 60 + 24; // bottomNavHeight + 24
  const heroHeight = Math.min(viewportHeight * 0.5, 420);

  const handleHeroScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    setHeroIndex(roundIndex);
  };

  const handleSearchFocus = () => {
    // TODO: Show recent queries or search suggestions
  };

  const handleItemPress = (type: string, item: any) => {
    Alert.alert('Navigate', `Navigate to ${type} detail: ${item.id}`);
  };

  const handleItemLongPress = (type: string, item: any) => {
    const itemId = `${type}-${item.id}`;
    const newSelectedItems = new Set(selectedItems);
    
    if (newSelectedItems.has(itemId)) {
      newSelectedItems.delete(itemId);
    } else {
      newSelectedItems.add(itemId);
    }
    
    setSelectedItems(newSelectedItems);
    
    if (newSelectedItems.size > 0) {
      setActionBarVisible(true);
    } else {
      setActionBarVisible(false);
    }
  };

  const handleActionBarClose = () => {
    setActionBarVisible(false);
    setSelectedItems(new Set());
  };

  const handleAddToQueue = () => {
    console.log('Add to Queue', Array.from(selectedItems));
    handleActionBarClose();
  };

  const handlePost = () => {
    console.log('Post', Array.from(selectedItems));
    handleActionBarClose();
  };

  const handleDelete = () => {
    console.log('Delete', Array.from(selectedItems));
    handleActionBarClose();
  };

  const renderHeroDots = () => (
    <View style={styles.heroDots}>
      {mockHeroData.map((_, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.heroDot,
            index === heroIndex && styles.heroDotActive,
          ]}
          onPress={() => {
            // TODO: Scroll to specific hero item
          }}
        />
      ))}
    </View>
  );

  return (
    <Screen style={styles.container} hasBottomTabs transparent>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Fixed Top Bar */}
      <View style={[styles.topBar, { height: topBarHeight, paddingTop: insets.top }]}>
        <View style={styles.searchContainer}>
          <View style={styles.searchField}>
            <Ionicons name="search" size={18} color="#111" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search styles, brands..."
              placeholderTextColor="#6B7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={handleSearchFocus}
              accessibilityLabel="Search styles and brands"
            />
          </View>
          <TouchableOpacity
            style={styles.micButton}
            accessibilityLabel="Voice search"
            accessibilityRole="button"
          >
            <Ionicons name="mic-outline" size={20} color="#111" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Scroll Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: topBarHeight + 12,
            paddingBottom: bottomReserve,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Carousel */}
        <View style={[styles.heroContainer, { height: heroHeight }]}>
          <FlatList
            data={mockHeroData}
            renderItem={({ item }) => <HeroItem item={item} />}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleHeroScroll}
            scrollEventThrottle={16}
          />
          {renderHeroDots()}
        </View>

        {/* Trending Looks */}
        <SectionHeader title="Trending Looks" />
        <FlatList
          data={mockTrendingLooks}
          renderItem={({ item }) => (
            <TrendingLookItem
              item={item}
              onPress={() => handleItemPress('trending', item)}
              onLongPress={() => handleItemLongPress('trending', item)}
            />
          )}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        />

        {/* Most Tried-On */}
        <SectionHeader title="Most Tried-On" />
        <FlatList
          data={mockMostTriedOn}
          renderItem={({ item }) => (
            <MostTriedOnItem
              item={item}
              onPress={() => handleItemPress('tried-on', item)}
              onLongPress={() => handleItemLongPress('tried-on', item)}
            />
          )}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        />

        {/* Curated Collections */}
        <SectionHeader title="Curated Collections" />
        <FlatList
          data={mockCollections}
          renderItem={({ item }) => (
            <CollectionItem
              item={item}
              onPress={() => handleItemPress('collection', item)}
            />
          )}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        />

        {/* Top Brands */}
        <SectionHeader title="Top Brands" />
        <FlatList
          data={mockBrands}
          renderItem={({ item }) => (
            <BrandItem
              item={item}
              onPress={() => handleItemPress('brand', item)}
            />
          )}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        />

        {/* Seasonal Drops */}
        <SectionHeader title="Seasonal Drops" />
        <FlatList
          data={mockSeasonalDrops}
          renderItem={({ item }) => (
            <SeasonalDropItem
              item={item}
              onPress={() => handleItemPress('seasonal', item)}
              onLongPress={() => handleItemLongPress('seasonal', item)}
            />
          )}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        />
      </ScrollView>

      <LongPressActionBar
        visible={actionBarVisible}
        onClose={handleActionBarClose}
        onAddToQueue={handleAddToQueue}
        onPost={handlePost}
        onDelete={handleDelete}
        selectedCount={selectedItems.size}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: Colors.background,
    ...Platform.select({
      android: {
        elevation: 4,
      },
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
    }),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    backgroundColor: '#F5F5F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: Typography.fontFamily,
    fontSize: 14,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  heroContainer: {
    marginHorizontal: -16,
    marginBottom: 12,
  },
  heroItem: {
    width: viewportWidth,
    height: '100%',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  heroTitle: {
    fontFamily: Typography.fontFamily,
    fontSize: 20,
    fontWeight: Typography.fontWeight.semibold,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontFamily: Typography.fontFamily,
    fontSize: 14,
    fontWeight: Typography.fontWeight.regular,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
  },
  heroDots: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  heroDotActive: {
    backgroundColor: '#FFFFFF',
  },
  sectionHeader: {
    fontFamily: Typography.fontFamily,
    fontSize: 18,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginTop: 20,
    marginBottom: 8,
  },
  horizontalList: {
    paddingHorizontal: 0,
  },
  trendingItem: {
    width: 160,
    height: 220,
    borderRadius: 10,
    overflow: 'hidden',
  },
  trendingImage: {
    width: '100%',
    height: '100%',
  },
  trendingGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'linear-gradient(transparent, rgba(0, 0, 0, 0.6))',
  },
  trendingCaption: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    fontFamily: Typography.fontFamily,
    fontSize: 13,
    fontWeight: Typography.fontWeight.regular,
    color: '#FFFFFF',
  },
  mostTriedItem: {
    width: 120,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
  },
  mostTriedImage: {
    width: '100%',
    height: '100%',
  },
  collectionItem: {
    width: 240,
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
  },
  collectionImage: {
    width: '100%',
    height: '100%',
  },
  collectionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  collectionTitle: {
    fontFamily: Typography.fontFamily,
    fontSize: 18,
    fontWeight: Typography.fontWeight.semibold,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  brandItem: {
    alignItems: 'center',
    width: 72,
  },
  brandImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  brandName: {
    fontFamily: Typography.fontFamily,
    fontSize: 12,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.primary,
    marginTop: 8,
    textAlign: 'center',
  },
  seasonalItem: {
    width: 160,
    height: 260,
    borderRadius: 12,
    overflow: 'hidden',
  },
  seasonalImage: {
    width: '100%',
    height: '100%',
  },
  seasonalTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  seasonalTagText: {
    fontFamily: Typography.fontFamily,
    fontSize: 11,
    fontWeight: Typography.fontWeight.regular,
    color: '#FFFFFF',
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
  actionButton: {
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