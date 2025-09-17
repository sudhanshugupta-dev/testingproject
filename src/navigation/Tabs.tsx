import React, { useRef, useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ChatScreen from '../screens/Chat';
import RequestsScreen from '../screens/Requests';
import ProfileScreen from '../screens/Profile';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { Animated, View, StyleSheet, Dimensions, Keyboard, Platform, Text } from 'react-native';
import { useAppTheme } from '../themes/useTheme';
import useUnreadMessages from '../hooks/useUnreadMessages';

export type MainTabsParamList = {
  Chat: undefined;
  Requests: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();
const { width } = Dimensions.get('window');

const AnimatedIcon = ({ name, color, focused, size = 24 }: { name: string; color: string; focused: boolean; size?: number }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (focused) {
      // Only animate when becoming active
      Animated.parallel([
        Animated.spring(scale, { 
          toValue: 1.2, 
          useNativeDriver: true, 
          tension: 100,
          friction: 8 
        }),
        Animated.spring(rotate, { 
          toValue: 1, 
          useNativeDriver: true, 
          tension: 80,
          friction: 6 
        })
      ]).start();
    } else {
      // Reset to normal state without animation for inactive tabs
      scale.setValue(1);
      rotate.setValue(0);
    }
  }, [focused, scale, rotate]);

  const rotateInterpolate = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <Animated.View style={{ 
      transform: focused ? [{ scale }, { rotate: rotateInterpolate }] : [{ scale: 1 }],
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <MaterialIcons name={name} color={color} size={size} />
    </Animated.View>
  );
};

const CustomTabBar = ({ state, descriptors, navigation, keyboardVisible, unreadCount }: any) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const tabBarOpacity = useRef(new Animated.Value(1)).current;
  const tabBarTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        Animated.parallel([
          Animated.timing(tabBarOpacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(tabBarTranslateY, {
            toValue: 100,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        Animated.parallel([
          Animated.timing(tabBarOpacity, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(tabBarTranslateY, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      }
    );

    return () => {
      keyboardDidHideListener?.remove();
      keyboardDidShowListener?.remove();
    };
  }, [tabBarOpacity, tabBarTranslateY]);
  
  return (
    <Animated.View 
      style={[
        styles.tabBarContainer,
        {
          opacity: tabBarOpacity,
          transform: [{ translateY: tabBarTranslateY }],
        }
      ]}
    >
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel || route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const getIconName = () => {
            switch (route.name) {
              case 'Chat':
                return 'chat';
              case 'Requests':
                return 'people';
              case 'Profile':
                return 'person';
              default:
                return 'circle';
            }
          };

          return (
            <View key={route.key} style={styles.tabItem}>
              <Animated.View 
                style={[
                  styles.tabButton,
                  isFocused && styles.activeTabButton
                ]}
                onTouchEnd={onPress}
              >
                <View>
                  <AnimatedIcon 
                    name={getIconName()} 
                    color={isFocused ? colors.primary : colors.textSecondary} 
                    focused={isFocused}
                    size={26}
                  />
                  {route.name === 'Chat' && unreadCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
                <Animated.Text 
                  style={[
                    styles.tabLabel,
                    { color: isFocused ? colors.primary : colors.textSecondary }
                  ]}
                >
                  {label}
                </Animated.Text>
              </Animated.View>
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
};

const MainTabs = () => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const { unreadCount } = useUnreadMessages();

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <Tab.Navigator
      tabBar={props => (
        <CustomTabBar 
          {...props} 
          keyboardVisible={keyboardVisible} 
          unreadCount={unreadCount} 
        />
      )}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: [
          styles.tabBar,
          keyboardVisible && styles.hiddenTabBar,
        ],
      }}
    >
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarLabel: t('tabs.chat'),
        }}
      />
      <Tab.Screen
        name="Requests"
        component={RequestsScreen}
        options={{
          tabBarLabel: t('tabs.requests'),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('tabs.profile'),
        }}
      />
    </Tab.Navigator>
  );
};

// Create styles function that accepts colors
const createStyles = (colors: any) => StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 50,
    paddingHorizontal: 8,
    paddingVertical: 12,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: -7,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 40,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hiddenTabBar: {
    position: 'absolute',
    bottom: -100, // Move off-screen when keyboard is visible
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    minWidth: 80,
    minHeight: 50,
  },
  activeTabButton: {
    backgroundColor: colors.primary + '20',
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    right: 8,
    top: 4,
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.card,
    zIndex: 10,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default MainTabs;


// import React, { useRef, useEffect } from 'react';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { Animated, View, StyleSheet, Platform, Pressable, Text } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import ChatScreen from '../screens/Chat';
// import RequestsScreen from '../screens/Requests';
// import ProfileScreen from '../screens/Profile';
// import { useTranslation } from 'react-i18next';
// import { useAppTheme } from '../../src/themes/useTheme';

// export type MainTabsParamList = {
//   Chat: undefined;
//   Requests: undefined;
//   Profile: undefined;
// };

// const Tab = createBottomTabNavigator<MainTabsParamList>();

// const AnimatedIcon = ({
//   name,
//   color,
//   focused,
//   size = 26, // Slightly larger for better visibility
// }: {
//   name: string;
//   color: string;
//   focused: boolean;
//   size?: number;
// }) => {
//   const scale = useRef(new Animated.Value(focused ? 1.2 : 1)).current;

//   useEffect(() => {
//     Animated.spring(scale, {
//       toValue: focused ? 1.2 : 1,
//       useNativeDriver: true,
//       tension: 100, // Slightly softer animation
//       friction: 8,
//     }).start();
//   }, [focused, scale]);

//   return (
//     <Animated.View
//       style={{
//         transform: [{ scale }],
//         alignItems: 'center',
//         justifyContent: 'center',
//       }}
//     >
//       <Icon name={name} color={color} size={size} />
//     </Animated.View>
//   );
// };

// const CustomTabBar = ({ state, descriptors, navigation }: any) => {
//   const { t } = useTranslation();
//   const { colors } = useAppTheme();

//   return (
//     <View style={[styles.tabBarContainer, { backgroundColor: colors.background }]}>
//       <View style={[styles.tabBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
//         {state.routes.map((route: any, index: number) => {
//           const { options } = descriptors[route.key];
//           const label = options.tabBarLabel || route.name;
//           const isFocused = state.index === index;

//           const onPress = () => {
//             const event = navigation.emit({
//               type: 'tabPress',
//               target: route.key,
//               canPreventDefault: true,
//             });

//             if (!isFocused && !event.defaultPrevented) {
//               navigation.navigate(route.name);
//             }
//           };

//           const getIconName = () => {
//             switch (route.name) {
//               case 'Chat':
//                 return 'chatbubble-ellipses-outline';
//               case 'Requests':
//                 return 'people-outline';
//               case 'Profile':
//                 return 'person-outline';
//               default:
//                 return 'ellipse-outline';
//             }
//           };

//           return (
//             <Pressable
//               key={route.key}
//               style={[styles.tabItem, isFocused && styles.activeTabItem]}
//               onPress={onPress}
//               accessibilityRole="button"
//               accessibilityState={{ selected: isFocused }}
//             >
//               <AnimatedIcon
//                 name={getIconName()}
//                 color={isFocused ? colors.primary : colors.textSecondary}
//                 focused={isFocused}
//                 size={26} // Match size
//               />
//               <Text
//                 style={[styles.tabLabel, { color: isFocused ? colors.primary : colors.textSecondary }]}
//               >
//                 {label}
//               </Text>
//             </Pressable>
//           );
//         })}
//       </View>
//     </View>
//   );
// };

// const MainTabs = () => {
//   const { t } = useTranslation();

//   return (
//     <Tab.Navigator
//       tabBar={(props) => <CustomTabBar {...props} />}
//       screenOptions={{
//         headerShown: false,
//         tabBarShowLabel: false,
//       }}
//     >
//       <Tab.Screen
//         name="Chat"
//         component={ChatScreen}
//         options={{ tabBarLabel: t('tabs.chat') }}
//       />
//       <Tab.Screen
//         name="Requests"
//         component={RequestsScreen}
//         options={{ tabBarLabel: t('tabs.requests') }}
//       />
//       <Tab.Screen
//         name="Profile"
//         component={ProfileScreen}
//         options={{ tabBarLabel: t('tabs.profile') }}
//       />
//     </Tab.Navigator>
//   );
// };

// const styles = StyleSheet.create({
//   tabBarContainer: {
//     paddingHorizontal: 16,
//     paddingBottom: Platform.OS === 'ios' ? 34 : 16, // Safe area padding
//     paddingTop: 12, // Increased for balance
//   },
//   tabBar: {
//     flexDirection: 'row',
//     borderRadius: 35,
//     paddingVertical: 8, // Slightly more padding
//     paddingHorizontal: 16,
//     borderTopWidth: 1,
//   },
//   tabItem: {
//     flex: 1,
//     alignItems: 'center',
//     paddingVertical: 10,
//     borderRadius: 30,
//   },
//   activeTabItem: {
//     backgroundColor: 'rgba(99, 102, 241, 0.15)', // Slightly stronger highlight
//   },
//   tabLabel: {
//     fontSize: 13, // Slightly larger for readability
//     fontWeight: '500',
//     marginTop: 6, // More space between icon and label
//     textAlign: 'center',
//   },
// });

// export default MainTabs;