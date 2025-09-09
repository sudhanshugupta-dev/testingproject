import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../../themes/useTheme';
import { useTranslation } from 'react-i18next';
import AnimatedGif from '../AnimatedGif/AnimatedGif';

const { width } = Dimensions.get('window');
const GIPHY_API_KEY = '0UPjlQnipNtHjqmiOQAvfh9TxFQWovKH'; // Replace with actual API key
const GIPHY_BASE_URL = 'https://api.giphy.com/v1/gifs';

interface GifItem {
  id: string;
  title: string;
  images: {
    fixed_width: {
      url: string;
      width: string;
      height: string;
    };
    original: {
      url: string;
      width: string;
      height: string;
    };
  };
}

interface GifPickerProps {
  onGifSelect: (gifUrl: string, gifTitle: string) => void;
  onClose: () => void;
}

const GifPicker: React.FC<GifPickerProps> = ({ onGifSelect, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [gifs, setGifs] = useState<GifItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  // Fetch trending GIFs on component mount
  useEffect(() => {
    fetchTrendingGifs();
  }, []);

  const fetchTrendingGifs = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${GIPHY_BASE_URL}/trending?api_key=${GIPHY_API_KEY}&limit=25&offset=0&rating=g&bundle=messaging_non_clips`
      );
      const data = await response.json();
      
      if (data.data) {
        setGifs(data.data);
        setOffset(25);
        setHasMore(data.pagination?.total_count > 25);
      }
    } catch (error) {
      console.error('Error fetching trending GIFs:', error);
      Alert.alert('Error', 'Failed to load GIFs. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const searchGifs = async (query: string, isLoadMore = false) => {
    if (!query.trim()) {
      fetchTrendingGifs();
      return;
    }

    setLoading(true);
    const currentOffset = isLoadMore ? offset : 0;
    
    try {
      const response = await fetch(
        `${GIPHY_BASE_URL}/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=25&offset=${currentOffset}&rating=g&lang=en&bundle=messaging_non_clips`
      );
      const data = await response.json();
      
      if (data.data) {
        if (isLoadMore) {
          setGifs(prev => [...prev, ...data.data]);
        } else {
          setGifs(data.data);
        }
        setOffset(currentOffset + 25);
        setHasMore(data.pagination?.total_count > currentOffset + 25);
      }
    } catch (error) {
      console.error('Error searching GIFs:', error);
      Alert.alert('Error', 'Failed to search GIFs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setOffset(0);
    setHasMore(true);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchGifs(query);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, []);

  const loadMoreGifs = () => {
    if (!loading && hasMore) {
      if (searchQuery.trim()) {
        searchGifs(searchQuery, true);
      } else {
        loadMoreTrending();
      }
    }
  };

  const loadMoreTrending = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${GIPHY_BASE_URL}/trending?api_key=${GIPHY_API_KEY}&limit=25&offset=${offset}&rating=g&bundle=messaging_non_clips`
      );
      const data = await response.json();
      
      if (data.data) {
        setGifs(prev => [...prev, ...data.data]);
        setOffset(prev => prev + 25);
        setHasMore(data.pagination?.total_count > offset + 25);
      }
    } catch (error) {
      console.error('Error loading more trending GIFs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGifPress = (gif: GifItem) => {
    onGifSelect(gif.images.original.url, gif.title);
  };

  const renderGifItem = ({ item }: { item: GifItem }) => {
    const aspectRatio = parseInt(item.images.fixed_width.width) / parseInt(item.images.fixed_width.height);
    const itemWidth = (width - 48) / 2; // 2 columns with padding
    const itemHeight = itemWidth / aspectRatio;

    return (
      <View style={[styles.gifItem, { width: itemWidth, height: itemHeight }]}>
        <AnimatedGif
          uri={item.images.fixed_width.url}
          width={itemWidth}
          height={itemHeight}
          borderRadius={8}
          onPress={() => handleGifPress(item)}
        />
      </View>
    );
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}

      {/* Search Input */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <Icon name="search" size={20} color={colors.text + '80'} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={t('chat.searchGifs') || 'Search GIFs...'}
          placeholderTextColor={colors.text + '60'}
          value={searchQuery}
          onChangeText={handleSearch}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              fetchTrendingGifs();
            }}
          >
            <Icon name="close-circle" size={20} color={colors.text + '80'} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Header */}
      <View style={styles.categoryHeader}>
        <Text style={[styles.categoryText, { color: colors.text + '80' }]}>
          {searchQuery ? `Results for "${searchQuery}"` : 'Trending'}
        </Text>
      </View>

      {/* GIF Grid */}
      <FlatList
        data={gifs}
        renderItem={renderGifItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.gifGrid}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMoreGifs}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Icon name="images-outline" size={48} color={colors.text + '40'} />
              <Text style={[styles.emptyText, { color: colors.text + '60' }]}>
                {searchQuery ? 'No GIFs found' : 'No trending GIFs available'}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    paddingVertical: 4,
  },
  categoryHeader: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  gifGrid: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  gifItem: {
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  gifImage: {
    width: '100%',
    height: '100%',
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
});

export default GifPicker;
