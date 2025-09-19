import React, { useState, useRef } from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, Animated, Pressable } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../../themes/useTheme';

type Props = { 
  label?: string; 
  value: string; 
  onChangeText: (t: string) => void; 
  placeholder?: string; 
  secureTextEntry?: boolean; 
  style?: ViewStyle;
  error?: string;
  testID?: string;
};

const CustomTextInput = ({ label, value, onChangeText, placeholder, secureTextEntry, style, error, testID = 'text-input' }: Props) => {
  const [secured, setSecured] = useState(!!secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);
  const { colors, fonts } = useAppTheme();
  const borderColorAnim = useRef(new Animated.Value(0)).current;
  const labelScaleAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  const animateFocus = (focused: boolean) => {
    Animated.parallel([
      Animated.timing(borderColorAnim, {
        toValue: focused ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(labelScaleAnim, {
        toValue: (focused || value) ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleFocus = () => {
    setIsFocused(true);
    animateFocus(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    animateFocus(false);
  };

  const borderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, error ? colors.danger : colors.primary],
  });

  const labelOpacity = labelScaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  const labelTranslateY = labelScaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  return (
    <View style={[styles.container, style]} testID="text-input-container">
      {label && (
        <Animated.Text 
          style={[
            styles.label, 
            { 
              color: error ? colors.danger : colors.text, 
              opacity: labelOpacity,
              transform: [{ translateY: labelTranslateY }]
            }
          ]}
        >
          {label}
        </Animated.Text>
      )}
      <Animated.View 
        style={[
          styles.inputRow, 
          { 
            backgroundColor: colors.card, 
            borderColor: borderColor,
            shadowColor: isFocused ? colors.primary : 'transparent',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isFocused ? 0.1 : 0,
            shadowRadius: 4,
            elevation: isFocused ? 2 : 0,
          }
        ]}
      >
        <TextInput 
          style={[
            styles.input, 
            { 
              color: colors.text, 
              fontSize: fonts.sizes.medium 
            }
          ]} 
          value={value} 
          onChangeText={onChangeText} 
          placeholder={placeholder} 
          secureTextEntry={secured} 
          placeholderTextColor={colors.placeholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          selectionColor={colors.primary}
          testID={testID}
        />
        {secureTextEntry && (
          <Pressable testID="eye-button" onPress={() => setSecured(!secured)} style={styles.eyeButton}>
            <Ionicons 
              name={secured ? 'eye-off-outline' : 'eye-outline'} 
              size={22} 
              color={colors.textSecondary} 
            />
          </Pressable>
        )}
      </Animated.View>
      {error && (
        <Text style={[styles.errorText, { color: colors.danger }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 12 },
  label: { 
    marginBottom: 8, 
    fontWeight: '600',
    fontSize: 14,
  },
  inputRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    borderWidth: 2,
    minHeight: 52,
  },
  input: { 
    flex: 1, 
    paddingVertical: 12,
    fontSize: 16,
  },
  eyeButton: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default CustomTextInput;
