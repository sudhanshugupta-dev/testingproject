// src/navigation/navigation.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import HomeIndex from '../screens/homeScreen/HomeIndex';
import ContentIndex from '../screens/contentScreen/ContentIndex';

const Stack = createStackNavigator();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeIndex} />
        <Stack.Screen name="Content" component={ContentIndex} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
