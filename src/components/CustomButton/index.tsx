import React from 'react';
import { Pressable, Text, ViewStyle, StyleSheet, ActivityIndicator, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAppTheme } from '../../themes/useTheme';

type Props = { 
  title: string; 
  onPress?: () => void; 
  style?: ViewStyle; 
  disabled?: boolean; 
  testID?: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
};

const CustomButton = ({ title, onPress, style, disabled, loading, variant = 'primary', testID }: Props) => {
  const { colors, fonts } = useAppTheme();

  const getGradientColors = () => {
    switch (variant) {
      case 'secondary':
        return [colors.secondary, colors.accent];
      case 'danger':
        return [colors.danger, '#F97316'];
      default:
        return [colors.primary, colors.primaryLight];
    }
  };

  const handlePress = () => {
    if (!disabled && !loading && onPress) {
      onPress();
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Pressable 
        disabled={disabled || loading} 
        testID={testID || 'custom-button'} 
        onPress={handlePress}
        style={({ pressed }) => [
          { 
            opacity: (pressed || disabled || loading) ? 0.8 : 1,
            transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }]
          }
        ]}
      >
        <LinearGradient 
          colors={disabled || loading ? ['#D1D5DB', '#9CA3AF'] : getGradientColors()} 
          start={{ x: 0, y: 0 }} 
          end={{ x: 1, y: 0 }} 
          style={[styles.btn, disabled && styles.disabled]}
        >
          {loading ? (
            <ActivityIndicator testID="loading-indicator" color="#ffffff" size="small" />
          ) : (
            <Text style={[
              styles.text, 
              { 
                fontWeight: fonts.weight.bold as any, 
                fontSize: fonts.sizes.large,
                opacity: disabled ? 0.6 : 1
              }
            ]}>
              {title}
            </Text>
          )}
        </LinearGradient>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({ 
  container: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    elevation: 6,
    borderRadius: 16,
  },
  btn: { 
    paddingVertical: 16, 
    paddingHorizontal: 32,
    borderRadius: 16, 
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  }, 
  text: { 
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default CustomButton;
