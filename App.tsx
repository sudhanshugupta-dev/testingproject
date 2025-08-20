import React, { useEffect } from 'react';
import { NavigationContainer, DarkTheme as NavDarkTheme, DefaultTheme as NavLightTheme } from '@react-navigation/native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, RootState, AppDispatch } from './src/redux/store';
import RootNavigator from './src/navigation/RootNavigator';
import './src/localization/i18n';
import { bootstrapApp } from './src/redux/slices/appBootstrap';
import Toast from 'react-native-toast-message';
import { getApp } from '@react-native-firebase/app';
// import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Initialize Firebase app (ensure getFirebaseApp returns a valid FirebaseApp instance)


const ThemedNavigation = () => {
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(bootstrapApp());
  }, [dispatch]);

  // useEffect(()=>{
  //   // try {
  //   //   const app = getApp();
  //   //   console.log('Firebase initialized:', app.name);
  //   // } catch (error) {
  //   //   console.error('Firebase initialization error:', error);
  //   // }
  //   GoogleSignin.configure({
  //     webClientId: '795608926313-e4mrkvn248a7fjpi077j1ilq0f80mak4.apps.googleusercontent.com', // Replace with Web client ID
  //     offlineAccess: true,
  //   });
    
  // }, [])

  return (
    <>
      <NavigationContainer theme={themeMode === 'dark' ? NavDarkTheme : NavLightTheme}>
        <RootNavigator />
      </NavigationContainer>
      <Toast />
    </>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <ThemedNavigation />
    </Provider>
  );
};

export default App;
