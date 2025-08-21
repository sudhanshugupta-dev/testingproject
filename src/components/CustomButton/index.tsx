import React from 'react';
import { Pressable, Text, ViewStyle, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAppTheme } from '../../themes/useTheme';

type Props = { title: string; onPress?: () => void; style?: ViewStyle; disabled?: boolean; testID?:String };

const CustomButton = ({ title, onPress, style, disabled }: Props) => {
  const { fonts } = useAppTheme();
  return (
    <Pressable disabled={disabled} testID={'custom-button'} onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }, style]}>
      <LinearGradient colors={['#6366F1', '#22C55E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
        <Text style={[styles.text, { fontWeight: fonts.weight.bold as any, fontSize: fonts.sizes.large }]}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({ btn: { paddingVertical: 12, borderRadius: 12, alignItems: 'center' }, text: { color: '#fff' } });

export default CustomButton;
