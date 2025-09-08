import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import Video from 'react-native-video';

interface MediaItem {
  uri: string;
  type: string;
}

interface VideoRendererProps {
  media: MediaItem[];
  onPreview: (item: MediaItem) => void;
}

const VideoRenderer: React.FC<VideoRendererProps> = ({ media, onPreview }) => {
  return (
    <View style={styles.container}>
      {media.map((file, index) => (
        <Pressable 
          key={index} 
          onPress={() => onPreview(file)} 
          onLongPress={() => onPreview(file)}
          delayLongPress={500}
          style={styles.videoWrapper}
        >
          <View style={styles.mediaBackground}>
            <Image
              source={{ uri: file.uri }}
              style={styles.videoThumbnail}
              resizeMode="cover"
            />
            <View style={styles.playButton}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
            <Text style={styles.videoLabel}>Video</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    gap: 8,
  },
  videoWrapper: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    padding: 8,
    minHeight: 240,
    minWidth: 240,
  },
  mediaBackground: {
    backgroundColor: 'transparent',
    borderRadius: 15,
    padding: 6,
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
  videoThumbnail: {
    width: 220,
    height: 220,
    borderRadius: 12,
  },
  video: {
    width: 220,
    height: 220,
    borderRadius: 12,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 2,
  },
  videoLabel: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 12,
  },
  playLabel: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 12,
  },
});

export default VideoRenderer;
