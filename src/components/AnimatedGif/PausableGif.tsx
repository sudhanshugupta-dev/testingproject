import React, { useState, useRef, useEffect } from 'react';
import { TouchableOpacity, View, StyleSheet, Animated, Image } from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';

interface PausableGifProps {
  uri: string;
  width?: number;
  height?: number;
  borderRadius?: number;
  onPress?: () => void;
  showPlayPauseControls?: boolean;
}

const PausableGif: React.FC<PausableGifProps> = ({
  uri,
  width = 200,
  height = 200,
  borderRadius = 12,
  onPress,
  showPlayPauseControls = true,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [showButton, setShowButton] = useState(false);
  const [staticImageUri, setStaticImageUri] = useState<string | null>(null);
  const [gifKey, setGifKey] = useState(0);
  const [pausedImageData, setPausedImageData] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Generate static image URI by removing the GIF from DOM when paused
  useEffect(() => {
    // Create a static version by trying different patterns
    // Most common pattern is replacing .gif with .jpg or adding _static
    const staticUri = uri.replace(/\.(gif|GIF)$/, '_static.jpg');
    setStaticImageUri(staticUri);
  }, [uri]);

  const togglePlayPause = () => {
    const newPlayState = !isPlaying;
    setIsPlaying(newPlayState);
    
    if (newPlayState) {
      // Resume: force re-render of GIF by changing key to restart animation
      setGifKey(prev => prev + 1);
    } else {
      // Pause: The GIF will be completely unmounted from the component tree
      console.warn('🎬 Pausing GIF animation');
    }
  };

  const showControlButton = () => {
    setShowButton(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Auto-hide after 3 seconds
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setShowButton(false));
    }, 3000);
  };


  const gifComponent = (
    <View style={[styles.container, { width, height }]}>
      {isPlaying ? (
        // Render the animated GIF
        <FastImage
          key={`gif-${gifKey}`}
          source={{
            uri: uri,
            priority: FastImage.priority.normal,
          }}
          style={[styles.gifImage, { width, height, borderRadius }]}
          resizeMode={FastImage.resizeMode.contain}
        />
      ) : (
        // When paused, completely remove GIF and show static placeholder
        // This ensures the GIF animation actually stops
        <View style={[styles.pausedContainer, { width, height, borderRadius }]}>
          <Image
            source={{
              uri: staticImageUri || uri,
            }}
            style={[styles.gifImage, { width, height, borderRadius }]}
            resizeMode="contain"
            onError={() => {
              console.log('🖼️ Static image not available, showing placeholder');
            }}
          />
          {/* Large play button overlay */}
          <View style={styles.pausedStateOverlay}>
            <View style={styles.pausedIndicatorLarge}>
              <Icon name="play" size={32} color="#fff" />
            </View>
          </View>
        </View>
      )}
      
      {/* Pause overlay */}
      {!isPlaying && (
        <View style={styles.pauseOverlay}>
          <View style={styles.pauseIndicator}>
            <Icon name="pause" size={20} color="#fff" />
          </View>
        </View>
      )}
      
      {/* Control overlay */}
      {showPlayPauseControls && (
        <TouchableOpacity
          style={styles.controlOverlay}
          onPress={showControlButton}
          activeOpacity={1}
        >
          {showButton && (
            <Animated.View style={[styles.controlButton, { opacity: fadeAnim }]}>
              <TouchableOpacity
                style={styles.playPauseButton}
                onPress={togglePlayPause}
                activeOpacity={0.7}
              >
                <Icon
                  name={isPlaying ? 'pause' : 'play'}
                  size={24}
                  color="#fff"
                />
              </TouchableOpacity>
            </Animated.View>
          )}
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
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  gifImage: {
    backgroundColor: 'transparent',
  },
  pausedContainer: {
    position: 'relative',
    backgroundColor: '#f5f5f5',
  },
  pausedStateOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pausedIndicatorLarge: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 30,
    width: 60,
    height: 60,
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
  pauseOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 5,
  },
  pauseIndicator: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    position: 'absolute',
  },
  playPauseButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 25,
    width: 50,
    height: 50,
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

export default PausableGif;
