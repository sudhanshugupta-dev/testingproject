import React, { useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import styles from './Styles';
import HomeView from './HomeView';

const HomeScreen = ({ navigation }) => {
  const [inputValue, setInputValue] = useState('');
  return (
   
      <HomeView  inputValue={inputValue} setInputValue={setInputValue} navigation={navigation}/>
  );
};

export default HomeScreen;
