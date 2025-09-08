import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../../themes/useTheme';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

interface StickerCategory {
  id: string;
  name: string;
  icon: string;
  stickers: string[];
}

interface StickerPickerProps {
  onStickerSelect: (sticker: string) => void;
  onClose: () => void;
}

const stickerCategories: StickerCategory[] = [
  {
    id: 'emotions',
    name: 'Emotions',
    icon: 'happy-outline',
    stickers: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
      '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
      '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
      '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
      '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧',
      '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐'
    ]
  },
  {
    id: 'gestures',
    name: 'Gestures',
    icon: 'hand-left-outline',
    stickers: [
      '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟',
      '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎',
      '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏',
      '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻'
    ]
  },
  {
    id: 'animals',
    name: 'Animals',
    icon: 'paw-outline',
    stickers: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
      '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒',
      '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇',
      '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜',
      '🦟', '🦗', '🕷️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙'
    ]
  },
  {
    id: 'food',
    name: 'Food',
    icon: 'fast-food-outline',
    stickers: [
      '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈',
      '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦',
      '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔',
      '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈',
      '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟'
    ]
  },
  {
    id: 'activities',
    name: 'Activities',
    icon: 'football-outline',
    stickers: [
      '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱',
      '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳',
      '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️',
      '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🤺',
      '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚵', '🚴'
    ]
  },
  {
    id: 'objects',
    name: 'Objects',
    icon: 'gift-outline',
    stickers: [
      '⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️',
      '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥',
      '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️',
      '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋',
      '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴'
    ]
  }
];

const StickerPicker: React.FC<StickerPickerProps> = ({ onStickerSelect, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState(stickerCategories[0]);
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  const renderStickerItem = ({ item }: { item: string }) => {
    return (
      <TouchableOpacity
        style={styles.stickerItem}
        onPress={() => onStickerSelect(item)}
      >
        <Text style={styles.stickerEmoji}>{item}</Text>
      </TouchableOpacity>
    );
  };

  const renderCategoryTab = ({ item }: { item: StickerCategory }) => {
    const isSelected = selectedCategory.id === item.id;
    return (
      <TouchableOpacity
        style={[
          styles.categoryTab,
          {
            backgroundColor: isSelected ? colors.primary : 'transparent',
            borderColor: colors.primary + '30',
          }
        ]}
        onPress={() => setSelectedCategory(item)}
      >
        <Icon
          name={item.icon}
          size={20}
          color={isSelected ? '#fff' : colors.text + '80'}
        />
        <Text
          style={[
            styles.categoryTabText,
            {
              color: isSelected ? '#fff' : colors.text + '80',
              fontSize: 10,
            }
          ]}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}

      {/* Category Tabs */}
      <View style={[styles.categoryContainer, { borderBottomColor: colors.text + '22' }]}>
        <FlatList
          data={stickerCategories}
          renderItem={renderCategoryTab}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {/* Selected Category Name */}
      <View style={styles.categoryHeader}>
        <Text style={[styles.categoryHeaderText, { color: colors.text }]}>
          {selectedCategory.name}
        </Text>
      </View>

      {/* Stickers Grid */}
      <FlatList
        data={selectedCategory.stickers}
        renderItem={renderStickerItem}
        keyExtractor={(item, index) => `${selectedCategory.id}-${index}`}
        numColumns={8}
        contentContainerStyle={styles.stickerGrid}
        showsVerticalScrollIndicator={false}
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
  categoryContainer: {
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  categoryList: {
    paddingHorizontal: 8,
  },
  categoryTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 60,
  },
  categoryTabText: {
    marginTop: 2,
    fontWeight: '500',
  },
  categoryHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryHeaderText: {
    fontSize: 16,
    fontWeight: '600',
  },
  stickerGrid: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  stickerItem: {
    width: (width - 64) / 8, // 8 columns with padding
    height: (width - 64) / 8,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
    borderRadius: 8,
  },
  stickerEmoji: {
    fontSize: 24,
  },
});

export default StickerPicker;
