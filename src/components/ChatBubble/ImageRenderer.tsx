import React from 'react';
import { View, Image, Pressable, StyleSheet } from 'react-native';

interface MediaItem {
  uri: string;
  type: string;
}

interface ImageRendererProps {
  media: MediaItem[];
  onPreview: (item: MediaItem) => void;
}

const ImageRenderer: React.FC<ImageRendererProps> = ({ media, onPreview }) => {
  return (
    <View style={styles.container}>
      {media.map((file, index) => (
        <Pressable 
          key={index} 
          onPress={() => onPreview(file)} 
          onLongPress={() => onPreview(file)}
          delayLongPress={500}
          style={styles.imageWrapper}
        >
          <View style={styles.mediaBackground}>
            <Image
              source={{ uri: file.uri }}
              style={styles.image}
              resizeMode="cover"
            />
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
  imageWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    padding: 8,
    minHeight: 230,
    minWidth: 230,
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
  image: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
});

export default ImageRenderer;
