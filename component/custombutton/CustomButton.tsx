import { PropsWithChildren } from 'react';
import { Pressable, Text, StyleSheet, TouchableOpacity } from 'react-native';
import styles from './Styles';

export const CustomButton = ({
  children,
  onPress,
}: PropsWithChildren<{ onPress: () => void }>) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{children}</Text>
    </TouchableOpacity>
  );
};

