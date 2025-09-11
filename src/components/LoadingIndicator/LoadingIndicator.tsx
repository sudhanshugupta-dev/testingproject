import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

interface LoadingIndicatorProps {
  type: 'image' | 'voice' | 'video' | 'file';
  progress?: number; // 0-100
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

const LoadingIndicator = ({ 
  type, 
  progress, 
  size = 'medium',
  showText = true 
}: LoadingIndicatorProps) => {
  const { colors } = useTheme();
  
  const getIconName = () => {
    switch (type) {
      case 'image': return 'image-outline';
      case 'voice': return 'mic-outline';
      case 'video': return 'videocam-outline';
      case 'file': return 'document-outline';
      default: return 'cloud-upload-outline';
    }
  };

  const getLoadingText = () => {
    switch (type) {
      case 'image': return 'Uploading image...';
      case 'voice': return 'Uploading voice...';
      case 'video': return 'Uploading video...';
      case 'file': return 'Uploading file...';
      default: return 'Uploading...';
    }
  };

  const getSizeConfig = () => {
    switch (size) {
      case 'small': return { iconSize: 20, spinnerSize: 'small' as const, containerSize: 60 };
      case 'large': return { iconSize: 40, spinnerSize: 'large' as const, containerSize: 120 };
      default: return { iconSize: 30, spinnerSize: 'small' as const, containerSize: 80 };
    }
  };

  const sizeConfig = getSizeConfig();

  return (
    <View style={[
      styles.container, 
      { 
        width: sizeConfig.containerSize, 
        height: sizeConfig.containerSize,
        backgroundColor: colors.card + '40',
        borderColor: colors.border + '60'
      }
    ]}>
      <View style={styles.iconContainer}>
        <Icon 
          name={getIconName()} 
          size={sizeConfig.iconSize} 
          color={colors.text + '60'} 
        />
        <View style={styles.spinnerOverlay}>
          <ActivityIndicator 
            size={sizeConfig.spinnerSize} 
            color={colors.primary} 
          />
        </View>
      </View>
      
      {showText && (
        <Text style={[styles.loadingText, { color: colors.text + '80' }]}>
          {getLoadingText()}
        </Text>
      )}
      
      {progress !== undefined && (
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View 
            style={[
              styles.progressFill, 
              { 
                backgroundColor: colors.primary,
                width: `${progress}%`
              }
            ]} 
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    margin: 4,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  progressBar: {
    width: '100%',
    height: 3,
    borderRadius: 1.5,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
});

export default LoadingIndicator;
