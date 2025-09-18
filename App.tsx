// App.tsx
import React, { useEffect, useState } from 'react';
import {
  NavigationContainer,
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavLightTheme,
  CommonActions,
  useNavigation,
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
import { DeviceEventEmitter, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { openCamera, openGallery } from './src/utils/cameraUtils';
import FriendSelectionBottomSheet from './src/components/FriendSelectionBottomSheet';
import LottieView from 'lottie-react-native';
/* ------------------------------------------------
 * Quick Action Handler
 * ------------------------------------------------ */
const QuickActionHandler = ({
  initialQuickAction,
  onImageSelected,
}: {
  initialQuickAction: { type: string; userInfo?: any } | null;
  onImageSelected: (image: any) => void;
}) => {
  const navigation = useNavigation<any>();
  const isBootstrapped = useSelector((state: RootState) => state.app.bootstrapped);
  const authToken = useSelector((state: RootState) => state.auth.token);

  const [pendingChat, setPendingChat] = useState<null | { friendId: string; friendName: string }>(null);

  const handleQuickActionDirect = async (actionType: string, userInfo?: any) => {
    console.log('[QuickActionHandler] Received:', actionType, userInfo);

    try {
      let info: any = null;



       // Camera
    if (actionType === 'camera') {
      openCamera()
        .then((asset) => asset && onImageSelected([asset]))
        .catch(console.warn);
      return;
    }

    // Gallery
    if (actionType === 'gallery') {
      openGallery()
        .then((asset) => asset && onImageSelected([asset]))
        .catch(console.warn);
      return;
    }
      // userInfo as string
      if (typeof userInfo === 'string' && userInfo.trim().length > 0) {
        try {
          info = JSON.parse(userInfo);
        } catch {
          console.warn('Failed to parse userInfo string:', userInfo);
        }
      }

      // userInfo as object
      else if (userInfo && typeof userInfo === 'object') {
        if (userInfo.friendId) {
          info = { friendId: userInfo.friendId, friendName: userInfo.friendName ?? '' };
        } else if (typeof userInfo.url === 'string') {
          try {
            info = JSON.parse(userInfo.url);
          } catch {
            console.warn('Failed to parse userInfo.url:', userInfo.url);
          }
        }
      }

      // fallback: extract from type
      if (!info && actionType) {
        info = { friendId: actionType, friendName: userInfo?.friendName ?? '' };
      }

      if (info?.friendId) {
        setPendingChat(info);
        return;
      }
    } catch (e) {
      console.warn('QuickAction parse error:', e);
    }

   
  };

  // Navigate when ready
  useEffect(() => {
    if (pendingChat && isBootstrapped && authToken) {
      try {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'ChatRoom', params: pendingChat }],
          })
        );
      } catch (err) {
        console.warn('Navigate to ChatRoom failed:', err);
      } finally {
        setPendingChat(null);
      }
    }
  }, [pendingChat, isBootstrapped, authToken, navigation]);

  // Foreground quick actions
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('quickActionShortcut', (data: any) => {
      if (data?.type) {
        const cleanedType = data.type.startsWith('user_') ? data.type.replace('user_', '') : data.type;
        handleQuickActionDirect(cleanedType, { friendName: data?.title });
      }
    });
    return () => sub.remove();
  }, []);

  // Cold start
  useEffect(() => {
    if (initialQuickAction?.type) {
      handleQuickActionDirect(initialQuickAction.type, initialQuickAction.userInfo);
    }
  }, [initialQuickAction]);

  return null;
};

/* ------------------------------------------------
 * Themed Navigation Wrapper
 * ------------------------------------------------ */
const ThemedNavigation = ({
  initialQuickAction,
  onImageSelected,
}: {
  initialQuickAction: { type: string; userInfo?: any } | null;
  onImageSelected: (image: any) => void;
}) => {
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(bootstrapApp());
  }, [dispatch]);

  return (
    <>
      <NavigationContainer theme={themeMode === 'dark' ? NavDarkTheme : NavLightTheme}>
        <RootNavigator />
        <QuickActionHandler initialQuickAction={initialQuickAction} onImageSelected={onImageSelected} />
      </NavigationContainer>
      <Toast />
    </>
  );
};

/* ------------------------------------------------
 * Root App
 * ------------------------------------------------ */
const App = () => {
  const [themeInitialized, setThemeInitialized] = useState(false);
  const [initialQuickAction, setInitialQuickAction] = useState<{ type: string; userInfo?: any } | null>(null);

  const [forwardBottomSheetVisible, setForwardBottomSheetVisible] = useState(false);
  const [messageToForward, setMessageToForward] = useState<any>(null);
  const [mediaToForward, setMediaToForward] = useState<Array<{ uri: string; type: string; fileName?: string }>>([]);

  useEffect(() => {
    const init = async () => {
      try {
        // Theme
        const initialTheme = await getInitialTheme();
        store.dispatch(restoreTheme(initialTheme));
      } catch {
        const systemTheme = require('react-native').Appearance.getColorScheme();
        store.dispatch(restoreTheme(systemTheme === 'dark' ? 'dark' : 'light'));
      } finally {
        setThemeInitialized(true);
      }

      // Badges
      initializeBadgeSystem();

      // Quick actions
      try {
        const chats = await AsyncStorage.getItem('@recent_chats');
        let recentChats: any[] = chats ? JSON.parse(chats) : [];

        const shortcuts: any[] = [
          { type: 'camera', title: 'Open Camera', subtitle: 'Quick launch camera', icon: 'ic_notification', userInfo: {} },
          { type: 'gallery', title: 'Open Gallery', subtitle: 'Quick launch gallery', icon: 'ic_notification', userInfo: {} },
        ];

        recentChats.slice(0, 2).forEach((chat) => {
          shortcuts.push({
            type: `user_${chat.id}`,
            title: chat.name,
            subtitle: 'Chat shortcut',
            icon: 'ic_notification',
            userInfo: { friendId: chat.id, friendName: chat.name },
          });
        });

        console.log('[QuickActions] Setting shortcuts:', shortcuts);
        QuickActions.setShortcutItems(shortcuts);

        // Cold start
        const action = await QuickActions.popInitialAction();
        if (action?.type) {
          const cleanedType = action.type.startsWith('user_') ? action.type.replace('user_', '') : action.type;
          setInitialQuickAction({
            type: cleanedType,
            userInfo: { friendId: cleanedType, friendName: action.title },
          });
        }
      } catch (err) {
        console.error('[QuickActions] Setup error:', err);
      }
    };

    init();
  }, []);

  if (!themeInitialized) {
    return  <LottieView source={require('./src/assets/Chatbot.json')} autoPlay loop style={{ flex: 1,width: 160, height: 160 }} />
  }

  return (
    <Provider store={store}>
      <ThemedNavigation
        initialQuickAction={initialQuickAction}
        onImageSelected={(image) => {
          setMediaToForward(image);
          setForwardBottomSheetVisible(true);
        }}
      />

      {/* Forward Bottom Sheet */}
      <FriendSelectionBottomSheet
        visible={forwardBottomSheetVisible}
        onClose={() => {
          setForwardBottomSheetVisible(false);
          setMessageToForward(null);
          setMediaToForward([]);
        }}
        messageToForward={messageToForward}
        forwarded={false}
        mediaToForward={mediaToForward}
        onForwardComplete={(selectedFriends) => {
          console.log('Forwarding media/message to', selectedFriends);
          setForwardBottomSheetVisible(false);
          setMessageToForward(null);
          setMediaToForward([]);
        }}
      />

      <Toast />
    </Provider>
  );
};

export default App;
