import React, { useState } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';

interface AnimatedGifProps {
  uri: string;
  width?: number;
  height?: number;
  borderRadius?: number;
  onPress?: () => void;
  showPlayPauseButton?: boolean;
}

const AnimatedGif: React.FC<AnimatedGifProps> = ({
  uri,
  width = 180,
  height = 180,
  borderRadius = 12,
  onPress,
  showPlayPauseButton = true,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [staticImageUri, setStaticImageUri] = useState<string | null>(null);

  // Convert GIF to static image when paused
  const getStaticImageUri = (gifUri: string) => {
    // For pause functionality, we'll show the first frame
    // This is a workaround since FastImage doesn't support native pause
    return gifUri.replace('.gif', '_static.jpg') || gifUri;
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      // Pause: try to show static version
      setStaticImageUri(getStaticImageUri(uri));
    } else {
      // Resume: show original GIF
      setStaticImageUri(null);
    }
    setIsPlaying(!isPlaying);
  };

  const gifComponent = (
    <View style={{ position: 'relative' }}>
      <FastImage
        source={{
          uri: staticImageUri || uri,
          priority: FastImage.priority.normal,
        }}
        style={{
          width,
          height,
          borderRadius,
        }}
        resizeMode={FastImage.resizeMode.contain}
      />
      
      {/* Play/Pause Button Overlay */}
      {showPlayPauseButton && (
        <TouchableOpacity
          style={[
            styles.playPauseButton,
            {
              top: height / 2 - 20,
              left: width / 2 - 20,
            }
          ]}
          onPress={togglePlayPause}
          activeOpacity={0.7}
        >
          <View style={styles.buttonBackground}>
            <Icon
              name={isPlaying ? 'pause' : 'play'}
              size={24}
              color="#fff"
            />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        {gifComponent}
      </TouchableOpacity>
    );
  }

  return gifComponent;
};

const styles = StyleSheet.create({
  playPauseButton: {
    position: 'absolute',
    zIndex: 10,
  },
  buttonBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default AnimatedGif;
