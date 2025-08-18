import React from 'react';
import { TextInput, StyleSheet, View } from 'react-native';
import styles from './Styles';

const CustomTextInput = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
}) => {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
      />
    </View>
  );
};

export default CustomTextInput;
