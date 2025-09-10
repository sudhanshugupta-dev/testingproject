import React from 'react';
import { View, StyleSheet } from 'react-native';
import PausableGif from '../AnimatedGif/PausableGif';

interface MediaItem {
  uri: string;
  type: string;
}

interface GifRendererProps {
  media: MediaItem[];
  onPreview: (item: MediaItem) => void;
}

const GifRenderer: React.FC<GifRendererProps> = ({ media, onPreview }) => {
  return (
    <View style={styles.container}>
      {media.map((file, index) => (
        <View key={index} style={styles.mediaBackground}>
          <PausableGif
            uri={file.uri}
            width={200}
            height={200}
            borderRadius={12}
            onPress={() => onPreview(file)}
            showPlayPauseControls={true}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  mediaBackground: {
    backgroundColor: 'transparent',
    borderRadius: 15,
    padding: 8,
    minHeight: 220,
    minWidth: 220,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: 'rgba(200, 200, 200, 0.3)',
  },
});

export default GifRenderer;
