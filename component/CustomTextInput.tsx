import React from 'react';
import { TextInput, StyleSheet, View } from 'react-native';

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

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    height: 70,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
  },
});

export default CustomTextInput;
