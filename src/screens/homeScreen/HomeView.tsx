import React, { useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { CustomButton } from '../../../component/custombutton/CustomButton';
import CustomTextInput from '../../../component/customeTextInput/CustomTextInput';
import { handleButtonPress, dummyApiCall } from '../../../servies/apiFunction';
import styles from './Styles';

const HomeView = ({ inputValue, setInputValue, navigation }) => {
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
          onPress={() => handleButtonPress(inputValue, navigation)}
        />
      </View>
    </View>
  );
};

export default HomeView;
