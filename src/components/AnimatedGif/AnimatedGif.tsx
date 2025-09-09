import React from 'react';
import { TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';

interface AnimatedGifProps {
  uri: string;
  width?: number;
  height?: number;
  borderRadius?: number;
  onPress?: () => void;
}

const AnimatedGif: React.FC<AnimatedGifProps> = ({
  uri,
  width = 180,
  height = 180,
  borderRadius = 12,
  onPress,
}) => {
  const gifComponent = (
    <FastImage
      source={{
        uri,
        priority: FastImage.priority.normal,
      }}
      style={{
        width,
        height,
        borderRadius,
      }}
      resizeMode={FastImage.resizeMode.contain}
    />
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress}>
        {gifComponent}
      </TouchableOpacity>
    );
  }

  return gifComponent;
};

export default AnimatedGif;
