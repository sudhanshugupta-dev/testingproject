import React, { useEffect, useState } from 'react';
import {
  NavigationContainer,
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavLightTheme,
} from '@react-navigation/native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, RootState, AppDispatch } from './src/redux/store';
import RootNavigator from './src/navigation/RootNavigator';
import './src/localization/i18n';
import { bootstrapApp } from './src/redux/slices/appBootstrap';
import { restoreTheme } from './src/redux/slices/themeSlice';
import { getInitialTheme } from './src/utils/themeInitializer';
import Toast from 'react-native-toast-message';
import { initializeBadgeSystem } from './src/utils/badgeUtils';
import QuickActions from 'react-native-quick-actions';
import { DeviceEventEmitter } from 'react-native';
import { openCamera, openGallery } from './src/utils/cameraUtils';

const ThemedNavigation = () => {
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(bootstrapApp());
  }, [dispatch]);

  return (
    <>
      <NavigationContainer
        theme={themeMode === 'dark' ? NavDarkTheme : NavLightTheme}>
        <RootNavigator />
      </NavigationContainer>
      <Toast />
    </>
  );
};

const App = () => {
  const [themeInitialized, setThemeInitialized] = useState(false);

  const handleQuickActionDirect = (actionType: string) => {
    if (actionType === 'camera') {
      openCamera();
      return;
    }
    if (actionType === 'gallery') {
      openGallery();
    }
  };

  // Theme initialization
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        const initialTheme = await getInitialTheme();
        store.dispatch(restoreTheme(initialTheme));
        setThemeInitialized(true);
      } catch (error) {
        console.warn('Failed to initialize theme:', error);
        const systemTheme = require('react-native').Appearance.getColorScheme();
        store.dispatch(restoreTheme(systemTheme === 'dark' ? 'dark' : 'light'));
        setThemeInitialized(true);
      }
    };

    const setupQuickActions = async () => {
      try {
        // Register quick actions
        QuickActions.setShortcutItems([
          {
            type: 'camera',
            title: 'Open Camera',
            subtitle: 'Quick launch camera',
            icon: 'ic_notification',
            userInfo: { url: 'testingproject://camera' },
          },
          {
            type: 'gallery',
            title: 'Open Gallery',
            subtitle: 'Quick launch gallery',
            icon: 'ic_notification',
            userInfo: { url: 'testingproject://gallery' },
          },
        ]);

        // Handle cold start (app launched directly by quick action)
        const initialAction = await QuickActions.popInitialAction();
        if (initialAction?.type) {
          console.log('Initial quick action:', initialAction.type);
          handleQuickActionDirect(initialAction.type);
        }
      } catch (error) {
        console.error('Error setting up quick actions:', error);
      }
    };

    initializeTheme();
    // Initialize notifications and request runtime permission if needed
    initializeBadgeSystem();
    setupQuickActions();

    // Handle when app is already running
    const handleQuickAction = (data: any) => {
      console.log('Quick action received:', data);
      if (data?.type) {
        handleQuickActionDirect(data.type);
      }
    };

    const subscription = DeviceEventEmitter.addListener('quickActionShortcut', handleQuickAction);

    return () => {
      subscription.remove();
    };
  }, []);

  // Don’t render until theme is ready
  if (!themeInitialized) {
    return null;
  }

  return (
    <Provider store={store}>
      <ThemedNavigation />
    </Provider>
  );
};

export default App;
