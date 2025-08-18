import React, { useEffect } from 'react';
import { NavigationContainer, DarkTheme as NavDarkTheme, DefaultTheme as NavLightTheme } from '@react-navigation/native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, RootState, AppDispatch } from './src/redux/store';
import RootNavigator from './src/navigation/RootNavigator';
import './src/localization/i18n';
import { bootstrapApp } from './src/redux/slices/appBootstrap';
import Toast from 'react-native-toast-message';

const ThemedNavigation = () => {
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(bootstrapApp());
  }, [dispatch]);

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
