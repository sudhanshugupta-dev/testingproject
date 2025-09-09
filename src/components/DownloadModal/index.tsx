import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../../themes/useTheme';
import { useTranslation } from 'react-i18next';
import downloadService, { DownloadProgress } from '../../services/downloadService';

interface MediaItem {
  uri: string;
  type: string;
}

interface DownloadModalProps {
  visible: boolean;
  onClose: () => void;
  mediaItem: MediaItem | null;
}

const DownloadModal: React.FC<DownloadModalProps> = ({
  visible,
  onClose,
  mediaItem,
}) => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const handleDownload = async () => {
    if (!mediaItem) return;

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      const result = await downloadService.downloadFile(
        mediaItem.uri,
        undefined,
        mediaItem.type,
        (progress: DownloadProgress) => {
          setDownloadProgress(progress.progress * 100);
        }
      );

      if (result.success) {
        Alert.alert(
          'Download Complete',
          `File saved successfully to ${result.filePath}`,
          [{ text: 'OK', onPress: onClose }]
        );
      } else {
        Alert.alert('Download Failed', result.error || 'Unknown error occurred');
      }
    } catch (error: any) {
      Alert.alert('Download Failed', error.message || 'Unknown error occurred');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const getFileTypeIcon = (type: string) => {
    if (type.startsWith('image')) return 'image';
    if (type.startsWith('video')) return 'videocam';
    if (type.startsWith('audio')) return 'musical-notes';
    return 'document';
  };

  const getFileTypeName = (type: string) => {
    if (type.startsWith('image')) return 'Image';
    if (type.startsWith('video')) return 'Video';
    if (type.startsWith('audio')) return 'Audio';
    return 'File';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <Icon
              name={getFileTypeIcon(mediaItem?.type || '')}
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.title, { color: colors.text }]}>
              Download {getFileTypeName(mediaItem?.type || '')}
            </Text>
          </View>

          <Text style={[styles.description, { color: colors.text }]}>
            Save this {getFileTypeName(mediaItem?.type || '').toLowerCase()} to your device's local storage
          </Text>

          {isDownloading && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${downloadProgress}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: colors.text }]}>
                {Math.round(downloadProgress)}%
              </Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: colors.text }]}
              onPress={onClose}
              disabled={isDownloading}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.downloadButton,
                { backgroundColor: colors.primary },
                isDownloading && styles.disabledButton,
              ]}
              onPress={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Icon name="download" size={20} color="#fff" />
                  <Text style={[styles.buttonText, { color: '#fff', marginLeft: 8 }]}>
                    Download
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 350,
    borderRadius: 16,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
    opacity: 0.8,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  cancelButton: {
    borderWidth: 1,
  },
  downloadButton: {
    // backgroundColor will be set dynamically
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default DownloadModal;
