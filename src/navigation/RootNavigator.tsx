import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/Splash';
import LoginScreen from '../screens/Login';
import SignupScreen from '../screens/Signup';
import ForgotPasswordScreen from '../screens/ForgotPassword';
import VerifyOTPScreen from '../screens/VerifyOTP';
import ResetPasswordScreen from '../screens/ResetPassword';
import MainTabs from './Tabs';
import ChatRoom from '../screens/ChatRoom';
import GroupDetails from '../screens/GroupDetails';
import ProfileScreen from '../screens/Profile'

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  VerifyOTP: { email?: string } | undefined;
  ResetPassword: { email?: string } | undefined;
  Main: undefined;
  UserProfile: undefined;
  ChatRoom: { friendId: string; friendName?: string };
  GroupDetails: { roomId: string; groupName?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

const RootNavigator = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const isBootstrapped = useSelector((state: RootState) => state.app.bootstrapped);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isBootstrapped ? (
        <Stack.Screen name="Splash" component={SplashScreen} />
      ) : token ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="ChatRoom" component={ChatRoom} />
          <Stack.Screen name="GroupDetails" component={GroupDetails} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          <Stack.Screen name="UserProfile" component= {ProfileScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
