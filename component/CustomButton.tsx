import { PropsWithChildren } from 'react';
import { Pressable, Text, StyleSheet, TouchableOpacity } from 'react-native';

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

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 10,
    height: '60%',
    width: '60%',
    borderRadius: 15,
  },
  text: {
    color: 'white',
    textAlign: 'center',
  },
});
