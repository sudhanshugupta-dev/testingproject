import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  Dimensions,
  StatusBar,
  Text,
} from 'react-native';
import FastImage from 'react-native-fast-image';
interface MediaItem {
  uri: string;
  type?: string;
}

interface MediaPreviewModalProps {
  visible: boolean;
  mediaItem: MediaItem | null;
  onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({
  visible,
  mediaItem,
  onClose,
}) => {
  if (!mediaItem) return null;

  const isGif = mediaItem.type?.includes('gif') || mediaItem.uri?.includes('.gif');
  const isVideo = mediaItem.type?.startsWith('video');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.9)" barStyle="light-content" />
      <View style={styles.container}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <View style={styles.mediaContainer}>
          {isGif ? (
            <FastImage
              source={{ uri: mediaItem.uri }}
              style={styles.fullScreenMedia}
              resizeMode={FastImage.resizeMode.contain}
            />
          ) : (
            <FastImage
              source={{ uri: mediaItem.uri }}
              style={styles.fullScreenMedia}
              resizeMode={FastImage.resizeMode.contain}
            />
          )}
          
          {isVideo && (
            <View style={styles.videoOverlay}>
              <Text style={styles.videoLabel}>Video</Text>
            </View>
          )}
        </View>

        <Pressable style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  mediaContainer: {
    width: screenWidth * 0.9,
    height: screenHeight * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenMedia: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  videoLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default MediaPreviewModal;
