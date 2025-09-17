// import React, { useEffect, useState } from 'react';
// import {
//   NavigationContainer,
//   DarkTheme as NavDarkTheme,
//   DefaultTheme as NavLightTheme,
// } from '@react-navigation/native';
// import { Provider, useDispatch, useSelector } from 'react-redux';
// import { store, RootState, AppDispatch } from './src/redux/store';
// import RootNavigator from './src/navigation/RootNavigator';
// import './src/localization/i18n';
// import { bootstrapApp } from './src/redux/slices/appBootstrap';
// import { restoreTheme } from './src/redux/slices/themeSlice';
// import { getInitialTheme } from './src/utils/themeInitializer';
// import Toast from 'react-native-toast-message';
// import { initializeBadgeSystem } from './src/utils/badgeUtils';
// import QuickActions from 'react-native-quick-actions';
// import { DeviceEventEmitter } from 'react-native';
// import { openCamera, openGallery } from './src/utils/cameraUtils';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useNavigation } from '@react-navigation/native';

// // Component to handle quick actions within NavigationContainer
// const QuickActionHandler = ({ initialQuickAction }: { initialQuickAction: { type: string; userInfo?: any } | null }) => {
//   const navigation = useNavigation<any>();

//   // Function to handle quick actions with navigation
//   const handleQuickActionDirect = (actionType: string, userInfo?: any) => {
//     if (userInfo?.url) {
//       try {
//         const info = JSON.parse(userInfo.url);
//         console.log("Parsed userInfo:", info);
//         navigation.navigate("ChatRoom", {
//           friendId: info.friendId,
//           friendName: info.friendName,
//         });
//       } catch (e) {
//         console.error("Failed to parse userInfo", e);
//       }
//     }

//     if (actionType === 'camera') {
//       openCamera();
//       return;
//     }
//     if (actionType === 'gallery') {
//       openGallery();
//       return;
//     }

//     // Handle other user quick actions if needed
//     if (actionType.startsWith('user_')) {
//       const userId = actionType.replace('user_', '');
//       console.log('Navigate to chat with userId:', userId);
//       // Add navigation logic here if needed
//     }
//   };

//   // Handle quick actions when the app is already running
//   useEffect(() => {
//     const subscription = DeviceEventEmitter.addListener(
//       'quickActionShortcut',
//       (data: any) => {
//         console.log('Quick action received:', data);
//         if (data?.type) {
//           handleQuickActionDirect(data.type, data.userInfo);
//         }
//       },
//     );

//     return () => {
//       subscription.remove();
//     };
//   }, []);

//   // Handle cold-start initial quick action once navigation is ready
//   useEffect(() => {
//     if (initialQuickAction?.type) {
//       console.log('Handling initial quick action:', initialQuickAction.type);
//       handleQuickActionDirect(initialQuickAction.type, initialQuickAction.userInfo);
//     }
//   }, [initialQuickAction]);

//   return null; // This component doesn't render anything
// };

// const ThemedNavigation = ({ initialQuickAction }: { initialQuickAction: { type: string; userInfo?: any } | null }) => {
//   const themeMode = useSelector((state: RootState) => state.theme.mode);
//   const dispatch = useDispatch<AppDispatch>();

//   // Bootstrap the app on mount
//   useEffect(() => {
//     dispatch(bootstrapApp());
//   }, [dispatch]);

//   return (
//     <>
//       <NavigationContainer
//         theme={themeMode === 'dark' ? NavDarkTheme : NavLightTheme}
//       >
//         <RootNavigator />
//         <QuickActionHandler initialQuickAction={initialQuickAction} />
//       </NavigationContainer>
//       <Toast />
//     </>
//   );
// };

// const App = () => {
//   const [themeInitialized, setThemeInitialized] = useState(false);
//   const [initialQuickAction, setInitialQuickAction] = useState<{ type: string; userInfo?: any } | null>(null);

 
//   useEffect(() => {
//     const initializeTheme = async () => {
//       try {
//         const initialTheme = await getInitialTheme();
//         console.log("[Theme] Loaded initial theme:", initialTheme);
//         store.dispatch(restoreTheme(initialTheme));
//         setThemeInitialized(true);
//       } catch (error) {
//         console.warn('[Theme] Failed to initialize theme:', error);
//         const systemTheme = require('react-native').Appearance.getColorScheme();
//         console.log("[Theme] Falling back to system theme:", systemTheme);
//         store.dispatch(restoreTheme(systemTheme === 'dark' ? 'dark' : 'light'));
//         setThemeInitialized(true);
//       }
//     };

//     const setupQuickActions = async () => {
//       try {
//         // Load recent chats from AsyncStorage
//         const chats = await AsyncStorage.getItem('@recent_chats');
//         console.log("[AsyncStorage] Raw chats string:", chats);

//         let recentChats: any[] = [];
//         if (chats) {
//           try {
//             recentChats = JSON.parse(chats);
//             console.log("[AsyncStorage] Parsed chats:", recentChats);
//           } catch (parseError) {
//             console.error("[AsyncStorage] Error parsing chats:", parseError);
//           }
//         }

//         // Prepare default quick actions
//         const shortcuts = [
//           {
//             type: 'camera',
//             title: 'Open Camera',
//             subtitle: 'Quick launch camera',
//             icon: 'ic_notification',
//             userInfo: { url: 'testingproject://camera' },
//           },
//           {
//             type: 'gallery',
//             title: 'Open Gallery',
//             subtitle: 'Quick launch gallery',
//             icon: 'ic_notification',
//             userInfo: { url: 'testingproject://gallery' },
//           },
//         ];

//         // Add recent chats (max 2)
//         recentChats.slice(0, 2).forEach((chat: any, idx: number) => {
//           console.log(`[QuickActions] Adding recent chat shortcut #${idx + 1}:`, chat);
//           shortcuts.push({
//             type: `user_${chat.id}`,
//             title: chat.name,
//             subtitle: 'Chat shortcut',
//             icon: 'ic_notification',
//             userInfo: {
//               url: JSON.stringify({
//                 friendId: chat.id,
//                 friendName: chat.name,
//               }),
//             },
//           });
//         });

//         console.log("[QuickActions] Final shortcut items:", shortcuts);
//         QuickActions.setShortcutItems(shortcuts);

//         // Handle cold start quick action
//         const action = await QuickActions.popInitialAction();
//         console.log("[QuickActions] Cold start action:", action);
//         if (action?.type) {
//           setInitialQuickAction({ type: action.type, userInfo: action.userInfo });
//         }
//       } catch (error) {
//         console.error('[QuickActions] Error setting up quick actions:', error);
//       }
//     };

//     initializeTheme();
//     initializeBadgeSystem();
//     setupQuickActions();
//   }, []);

//   if (!themeInitialized) {
//     return null;
//   }

//   return (
//     <Provider store={store}>
//       <ThemedNavigation initialQuickAction={initialQuickAction} />
//     </Provider>
//   );
// };

// export default App;


import React, { useEffect, useState } from 'react';
import {
  NavigationContainer,
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavLightTheme,
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
import { DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⬇️ Your utils must return image object {uri, fileName, type, etc.}
import { openCamera, openGallery } from './src/utils/cameraUtils';

// ⬇️ Your bottom sheet component
import FriendSelectionBottomSheet from './src/components/FriendSelectionBottomSheet';

/**
 * Handles quick actions inside Navigation
 */
const QuickActionHandler = ({
  initialQuickAction,
  onImageSelected,
}: {
  initialQuickAction: { type: string; userInfo?: any } | null;
  onImageSelected: (image: any) => void;
}) => {
  const navigation = useNavigation<any>();

  const handleQuickActionDirect = (actionType: string, userInfo?: any) => {
    console.log('[QuickActionHandler] Received:', actionType, userInfo);
  
    try {
      let info: any = null;
  
      // Case 1: userInfo is JSON string
      if (typeof userInfo === 'string' && userInfo.trim().length > 0) {
        try {
          info = JSON.parse(userInfo);
        } catch {
          console.warn('Failed to parse userInfo string:', userInfo);
        }
      }
  
      // Case 2: userInfo is already an object
      else if (userInfo && typeof userInfo === 'object') {
        if (userInfo.friendId) {
          info = {
            friendId: userInfo.friendId,
            friendName: userInfo.friendName ?? '', // ensure fallback
          };
        } else if (typeof userInfo.url === 'string') {
          try {
            info = JSON.parse(userInfo.url);
          } catch {
            console.warn('Failed to parse userInfo.url:', userInfo.url);
          }
        }
      }
  
      // Case 3: Only actionType carries friendId
      if (!info && actionType.startsWith('user_')) {
        const friendId = actionType.replace('user_', '');
        info = {
          friendId,
          friendName: userInfo?.friendName ?? 'Unknown User', // fallback name
        };
      }
  
      // ✅ Navigate if we resolved a friendId
      if (info?.friendId) {
        navigation.navigate('ChatRoom', {
          friendId: info.friendId,
          friendName: info.friendName ?? 'Unknown User',
        });
        return;
      }
    } catch (e) {
      console.warn('QuickAction parse/navigate error:', e);
    }
  
    // Camera shortcut
    if (actionType === 'camera') {
      openCamera()
        .then((asset) => {
          if (asset) onImageSelected([asset]);
        })
        .catch(console.warn);
      return;
    }
  
    // Gallery shortcut
    if (actionType === 'gallery') {
      openGallery()
        .then((asset) => {
          if (asset) onImageSelected([asset]);
        })
        .catch(console.warn);
      return;
    }
  };

  // When app already running
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      'quickActionShortcut',
      (data: any) => {
        if (data?.type) {
          console.log("data, data", data)
          let userInfo = {
            friendName: data?.title,
            type: data?.type,
          };
          handleQuickActionDirect(data.type, userInfo);
        }
      },
    );

    return () => subscription.remove();
  }, []);

  // Handle cold-start
  useEffect(() => {
    if (initialQuickAction?.type) {
      handleQuickActionDirect(
        initialQuickAction.type,
        initialQuickAction.userInfo,
      );
    }
  }, [initialQuickAction]);

  return null;
};

/**
 * Themed navigation + quick actions
 */
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
      <NavigationContainer
        theme={themeMode === 'dark' ? NavDarkTheme : NavLightTheme}>
        <RootNavigator />
        <QuickActionHandler
          initialQuickAction={initialQuickAction}
          onImageSelected={onImageSelected}
        />
      </NavigationContainer>
      <Toast />
    </>
  );
};

/**
 * Root App
 */
const App = () => {
  const [themeInitialized, setThemeInitialized] = useState(false);
  const [initialQuickAction, setInitialQuickAction] = useState<{
    type: string;
    userInfo?: any;
  } | null>(null);

  // 👇 Bottom sheet states
  const [forwardBottomSheetVisible, setForwardBottomSheetVisible] =
    useState(false);
  const [messageToForward, setMessageToForward] = useState<any>(null);
  const [mediaToForward, setMediaToForward] = useState<Array<{ uri: string; type: string; fileName?: string }>>([]);

  useEffect(() => {
    const initializeTheme = async () => {
      try {
        const initialTheme = await getInitialTheme();
        store.dispatch(restoreTheme(initialTheme));
        setThemeInitialized(true);
      } catch (error) {
        const systemTheme = require('react-native').Appearance.getColorScheme();
        store.dispatch(restoreTheme(systemTheme === 'dark' ? 'dark' : 'light'));
        setThemeInitialized(true);
      }
    };

    const setupQuickActions = async () => {
      try {
        const chats = await AsyncStorage.getItem('@recent_chats');
        let recentChats: any[] = [];
        if (chats) {
          try {
            recentChats = JSON.parse(chats);
          } catch (e) {
            console.error('[AsyncStorage] Parse error:', e);
          }
        }

        // Default quick actions
        const shortcuts: any[] = [
          {
            type: 'camera',
            title: 'Open Camera',
            subtitle: 'Quick launch camera',
            icon: 'ic_notification',
            userInfo: {},
          },
          {
            type: 'gallery',
            title: 'Open Gallery',
            subtitle: 'Quick launch gallery',
            icon: 'ic_notification',
            userInfo: {},
          },
        ];

        // Add chat shortcuts
        recentChats.slice(0, 2).forEach((chat) => {
          shortcuts.push({
            type: `user_${chat.id}`,
            title: chat.name,
            subtitle: 'Chat shortcut',
            icon: 'ic_notification',
            userInfo: {
              friendId: chat.id,
              friendName: chat.name,
            },
          });
        });

        console.log('[QuickActions] Setting shortcuts:', shortcuts);
        QuickActions.setShortcutItems(shortcuts);

        // Handle cold-start
        const action = await QuickActions.popInitialAction();
        if (action?.type) {
          setInitialQuickAction({ type: action.type, userInfo: action.userInfo });
        }
      } catch (error) {
        console.error('[QuickActions] Setup error:', error);
      }
    };

    initializeTheme();
    initializeBadgeSystem();
    setupQuickActions();
  }, []);

  if (!themeInitialized) return null;

  return (
    <Provider store={store}>
      <ThemedNavigation
        initialQuickAction={initialQuickAction}
        onImageSelected={(image) => {
          setMediaToForward(image);
          setForwardBottomSheetVisible(true);
        }}
      />

      {/* 👇 Forward bottom sheet */}
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
