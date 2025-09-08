import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../../themes/useTheme';
import { useTranslation } from 'react-i18next';
import GifPicker from '../GifPicker/GifPicker';
import StickerPicker from '../StickerPicker/StickerPicker';

const { height } = Dimensions.get('window');

interface MediaPickerProps {
  visible: boolean;
  onClose: () => void;
  onGifSelect: (gifUrl: string, gifTitle: string) => void;
  onStickerSelect: (sticker: string) => void;
}

type PickerType = 'gif' | 'sticker';

const MediaPicker: React.FC<MediaPickerProps> = ({
  visible,
  onClose,
  onGifSelect,
  onStickerSelect,
}) => {
  const [activeTab, setActiveTab] = useState<PickerType>('gif');
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  const handleGifSelect = (gifUrl: string, gifTitle: string) => {
    onGifSelect(gifUrl, gifTitle);
    onClose();
  };

  const handleStickerSelect = (sticker: string) => {
    onStickerSelect(sticker);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Tab Header */}
        <View style={[styles.tabHeader, { borderBottomColor: colors.text + '22' }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              {
                backgroundColor: activeTab === 'gif' ? colors.primary : 'transparent',
                borderColor: colors.primary + '30',
              }
            ]}
            onPress={() => setActiveTab('gif')}
          >
            <Icon
              name="images-outline"
              size={20}
              color={activeTab === 'gif' ? '#fff' : colors.text}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'gif' ? '#fff' : colors.text }
              ]}
            >
              GIF
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              {
                backgroundColor: activeTab === 'sticker' ? colors.primary : 'transparent',
                borderColor: colors.primary + '30',
              }
            ]}
            onPress={() => setActiveTab('sticker')}
          >
            <Icon
              name="happy-outline"
              size={20}
              color={activeTab === 'sticker' ? '#fff' : colors.text}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'sticker' ? '#fff' : colors.text }
              ]}
            >
              Sticker
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Icon name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {activeTab === 'gif' ? (
            <GifPicker
              onGifSelect={handleGifSelect}
              onClose={onClose}
            />
          ) : (
            <StickerPicker
              onStickerSelect={handleStickerSelect}
              onClose={onClose}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    marginLeft: 'auto',
    padding: 4,
  },
  content: {
    flex: 1,
  },
});

export default MediaPicker;
