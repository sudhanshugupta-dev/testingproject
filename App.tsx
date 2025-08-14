import React, { useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { CustomButton } from './component/CustomButton';
import CustomTextInput from './component/CustomTextInput';
import { handleButtonPress, dummyApiCall } from './servies/apiFunction';

const App = () => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (text: string) => {
    setInputValue(text);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <CustomTextInput
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Enter something..."
        />
      </View>
      <View style={styles.buttonContainer}>
        <CustomButton
          children="Press me"
          onPress={() => handleButtonPress(inputValue)}
        />
      </View>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    height: '20%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    height: '20%',
    justifyContent: 'center',
  },
});
