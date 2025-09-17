// import React, { useEffect, useState, useCallback } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {
//   View,
//   FlatList,
//   Text,
//   Pressable,
//   StyleSheet,
//   TextInput,
// } from 'react-native';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigation } from '@react-navigation/native';
// import LottieView from 'lottie-react-native';
// import { useTranslation } from 'react-i18next';
// import Icon from 'react-native-vector-icons/Ionicons';

// import { AppDispatch, RootState } from '../../redux/store';
// import {
//   startChatListListener,
//   stopChatListListener,
//   markChatAsRead,
// } from '../../redux/slices/chatsSlice';

// import CustomAvatar from '../../components/CustomAvatar';
// import { useAppTheme } from '../../themes/useTheme';
// import { createStyles } from './styles';

// const RECENT_CHATS_KEY = '@recent_chats';
// const MAX_RECENT_CHATS = 2;

// interface RecentChat {
//   userId: string;
//   name: string;
//   avatar?: string;
//   lastMessageTime: number;
// }

// const ChatContainer = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const nav = useNavigation<any>();
//   const { t } = useTranslation();
//   const { colors, mode } = useAppTheme();
//   const styles = createStyles(mode);

//   const { list, loading } = useSelector((s: RootState) => s.chats);
//   const myId = useSelector((s: RootState) => s.auth.user?.uid);
  
//   // Store recent chat when a chat is opened
//   // Store recent chat when a chat is opened
// const handleChatPress = useCallback(async (chat: any) => {
//   try {
//     // Get existing recent chats
//     const existingChats = await AsyncStorage.getItem(RECENT_CHATS_KEY);
//     let recentChats: RecentChat[] = existingChats ? JSON.parse(existingChats) : [];

//     // Remove if already exists
//     recentChats = recentChats.filter(c => c.userId !== chat.userId);

//     // Add new chat to the beginning
//     recentChats.unshift({
//       userId: chat.userId,
//       name: chat.name || 'Unknown User',
//       avatar: chat.avatar,
//       lastMessageTime: Date.now(),
//     });

//     // Keep only the most recent MAX_RECENT_CHATS
//     recentChats = recentChats.slice(0, MAX_RECENT_CHATS);

//     console.log('Updated Recent Chats:', recentChats);

//     await AsyncStorage.setItem(RECENT_CHATS_KEY, JSON.stringify(recentChats));
//   } catch (error) {
//     console.error('Error updating recent chats:', error);
//   }
// }, []);


//   const [search, setSearch] = useState('');
//   const [initializing, setInitializing] = useState(true);

//   // ✅ Start/stop chat listener
//   useEffect(() => {
//     dispatch(startChatListListener());
//     setInitializing(false);
    

//     return () => {
//       dispatch(stopChatListListener());
//     };
//   }, [dispatch]);

//   // ✅ Check if current user has seen message
//   const hasUserSeen = (messageSeenBy: Record<string, boolean> | undefined): boolean => {
//     if (!messageSeenBy || !myId) return true; // treat as seen if missing
//     return messageSeenBy[myId] === true;
//   };

//   // ✅ Format last message based on message type
//   const formatLastMessage = (lastMessage: any): { text: string; icon?: string } => {
//     if (!lastMessage) return { text: t('chat.noMessages') };
    
//     const messageType = lastMessage.messageType || 'text';
//     console.log(lastMessage, "lastMessage ");
//     switch (messageType) {
//       case 'voice':
//         return { text: t('chat.voiceMessage'), icon: 'mic' };
//       case 'image':
//         return { text: t('chat.photo'), icon: 'image' };
//       case 'video':
//         return { text: t('chat.video'), icon: 'videocam' };
//       case 'gif':
//         return { text: t('chat.gif'), icon: 'happy' };
//       case 'sticker':
//         return { text: t('chat.sticker'), icon: 'happy-outline' };
//       case 'file':
//         return { text: t('chat.file'), icon: 'document' };
//       case 'text':
//       default:
//         if (lastMessage.text) {
//           return {
//             text: lastMessage.text.length > 50
//               ? lastMessage.text.substring(0, 15) + '...'
//               : lastMessage.text
//           };
//         }
//         return { text: t('chat.noMessages') };
//     }
//   };

//   // ✅ Filter chats by search
//   const filteredList = list.filter(
//     item =>
//       item.name?.toLowerCase().includes(search.toLowerCase()) ||
//       item.email?.toLowerCase().includes(search.toLowerCase())
//   );

//   // ✅ Render single chat row
//   const renderItem = useCallback(
//     ({ item }: { item: any }) => {
//       const seen = hasUserSeen(item.lastMessage?.seenBy);

//       return (
//         <Pressable
//           style={[
//             styles.row,
//             { borderBottomColor: colors.text + '22', backgroundColor: colors.background },
//           ]}
//           android_ripple={{ color: colors.primary + '20' }}
//           onPress={() => {
//             if (item.unseenCount > 0) {
//               dispatch(markChatAsRead(item.id));
//             }
//             nav.navigate('ChatRoom', { friendId: item.id, friendName: item.name });
//           }}
//         >
//           <CustomAvatar name={item.name} />

//           <View style={{ marginLeft: 12, flex: 1 }}>
//             {/* Chat Name */}
//             <Text
//               style={[
//                 styles.name,
//                 { color: colors.text },
//                 !seen && { fontWeight: 'bold', fontSize: 19 }, // bold if NOT seen
//               ]}
//             >
//               {item.name}
//             </Text>

//             {/* Last Message + Timestamp */}
//             <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
//               <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
//                 {formatLastMessage(item.lastMessage).icon && (
//                   <Icon
//                     name={formatLastMessage(item.lastMessage).icon!}
//                     size={16}
//                     color={colors.text}
//                     style={{ opacity: 0.6, marginRight: 6 }}
//                   />
//                 )}
//                 <Text
//                   numberOfLines={1}
//                   style={[
//                     styles.last,
//                     { color: colors.text, opacity: 0.6, flex: 1 },
//                     !seen && { fontWeight: 'bold', opacity: 0.9, fontSize: 16 },
//                   ]}
//                 >
//                   {formatLastMessage(item.lastMessage).text}
//                 </Text>
//               </View>

//               {item.lastMessage?.timestamp && (
//                 <Text style={[styles.timestamp, { color: colors.text, opacity: 0.5 }]}>
//                   {new Date(item.lastMessage.timestamp).toLocaleTimeString([], {
//                     hour: '2-digit',
//                     minute: '2-digit',
//                   })}
//                 </Text>
//               )}
//             </View>
//           </View>

//           {/* Unread Badge */}
//           {item.unseenCount > 0 && (
//             <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
//               <Text style={styles.unreadText}>
//                 {item.unseenCount > 99 ? '99+' : item.unseenCount}
//               </Text>
//             </View>
//           )}
//         </Pressable>
//       );
//     },
//     [nav, colors, dispatch, t, myId]
//   );

//   // ✅ Render state (priority order)
//   if (initializing || loading) {
//     return (
//       <View style={styles.emptyContainer}>
//         <LottieView
//           source={require('../../assets/Chatbot.json')}
//           autoPlay
//           loop
//           style={{ width: 200, height: 200 }}
//         />
//         <Text style={[styles.emptyText, { color: colors.text, opacity: 0.7 }]}>
//           {t('chat.loadingChats')}
//         </Text>
//       </View>
//     );
//   }

//   if (filteredList.length === 0) {
//     return (
//       <View style={styles.emptyContainer}>
//         <LottieView
//           source={require('../../assets/Chatbot.json')}
//           autoPlay
//           loop
//           style={{ width: 200, height: 200 }}
//         />
//         <Text style={[styles.emptyText, { color: colors.text, opacity: 0.7 }]}>
//           {t('chat.noChats')}
//         </Text>
//       </View>
//     );
//   }

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       {/* Search */}
//       <View
//         style={[
//           styles.searchBar,
//           { backgroundColor: colors.background, borderBottomColor: colors.text + '22' },
//         ]}
//       >
//         <TextInput  
//           placeholder={t('chat.searchChats')}
//           value={search}
//           onChangeText={setSearch}
//           style={[styles.searchInput, { backgroundColor: colors.card, color: colors.text }]}
//           placeholderTextColor={colors.text + '60'}
//         />
//       </View>


//       {/* Chat List */}
//       <FlatList
//         data={filteredList}
//         keyExtractor={i => i.id}
//         renderItem={renderItem}
//         showsVerticalScrollIndicator={false}
//       />
//     </View>
//   );
// };


// export default ChatContainer;


// src/screens/ChatContainer.tsx
import React, { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  FlatList,
  Text,
  Pressable,
  TextInput,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';

import { AppDispatch, RootState } from '../../redux/store';
import {
  startChatListListener,
  stopChatListListener,
  markChatAsRead,
} from '../../redux/slices/chatsSlice';

import CustomAvatar from '../../components/CustomAvatar';
import { useAppTheme } from '../../themes/useTheme';
import { createStyles } from './styles';

const RECENT_CHATS_KEY = '@recent_chats';
const MAX_RECENT_CHATS = 2;

interface RecentChat {
  id: string;
  name: string;
  avatar?: string;
  lastMessageTime: number;
}

const ChatContainer = () => {
  const dispatch = useDispatch<AppDispatch>();
  const nav = useNavigation<any>();
  const { t } = useTranslation();
  const { colors, mode } = useAppTheme();
  const styles = createStyles(mode);

  const { list, loading } = useSelector((s: RootState) => s.chats);
  const myId = useSelector((s: RootState) => s.auth.user?.uid);

  const [search, setSearch] = useState('');
  const [initializing, setInitializing] = useState(true);
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);

  // 🔹 Load stored recent chats on first mount
  useEffect(() => {
    const loadStoredChats = async () => {
      try {
        const stored = await AsyncStorage.getItem(RECENT_CHATS_KEY);
        if (stored) {
          setRecentChats(JSON.parse(stored));
        }
      } catch (err) {
        console.error('Failed to load recent chats:', err);
      }
    };
    loadStoredChats();
  }, []);

  // 🔹 Update AsyncStorage whenever chats list changes
  useEffect(() => {
    if (list && list.length > 0) {
      const updated = list
        .map((chat: any) => ({
          id: chat.id,
          name: chat.name || 'Unknown User',
          avatar: chat.avatar,
          lastMessageTime: chat.lastMessage?.timestamp || Date.now(),
        }))
        .sort((a, b) => b.lastMessageTime - a.lastMessageTime) // sort by latest
        .slice(0, MAX_RECENT_CHATS);

      setRecentChats(updated);
      AsyncStorage.setItem(RECENT_CHATS_KEY, JSON.stringify(updated)).catch(err =>
        console.error('Error saving recent chats:', err)
      );
    }
  }, [list]);

  // ✅ Start/stop chat listener
  useEffect(() => {
    dispatch(startChatListListener());
    setInitializing(false);

    return () => {
      dispatch(stopChatListListener());
    };
  }, [dispatch]);

  // ✅ Check if current user has seen message
  const hasUserSeen = (messageSeenBy: Record<string, boolean> | undefined): boolean => {
    if (!messageSeenBy || !myId) return true;
    return messageSeenBy[myId] === true;
  };

  // ✅ Format last message
  const formatLastMessage = (lastMessage: any): { text: string; icon?: string } => {
    if (!lastMessage) return { text: t('chat.noMessages') };
    const messageType = lastMessage.messageType || 'text';
    switch (messageType) {
      case 'voice': return { text: t('chat.voiceMessage'), icon: 'mic' };
      case 'image': return { text: t('chat.photo'), icon: 'image' };
      case 'video': return { text: t('chat.video'), icon: 'videocam' };
      case 'gif': return { text: t('chat.gif'), icon: 'happy' };
      case 'sticker': return { text: t('chat.sticker'), icon: 'happy-outline' };
      case 'file': return { text: t('chat.file'), icon: 'document' };
      case 'text':
      default:
        return lastMessage.text
          ? { text: lastMessage.text.length > 50 ? lastMessage.text.substring(0, 15) + '...' : lastMessage.text }
          : { text: t('chat.noMessages') };
    }
  };

  // ✅ Filter chats by search
  const filteredList = list.filter(
    item =>
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.email?.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Render single chat row
  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      const seen = hasUserSeen(item.lastMessage?.seenBy);

      return (
        <Pressable
          style={[
            styles.row,
            { borderBottomColor: colors.text + '22', backgroundColor: colors.background },
          ]}
          android_ripple={{ color: colors.primary + '20' }}
          onPress={() => {
            if (item.unseenCount > 0) {
              dispatch(markChatAsRead(item.id));
            }
            nav.navigate('ChatRoom', { friendId: item.id, friendName: item.name });
          }}
        >
          <CustomAvatar name={item.name} />

          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text
              style={[
                styles.name,
                { color: colors.text },
                !seen && { fontWeight: 'bold', fontSize: 19 },
              ]}
            >
              {item.name}
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                {formatLastMessage(item.lastMessage).icon && (
                  <Icon
                    name={formatLastMessage(item.lastMessage).icon!}
                    size={16}
                    color={colors.text}
                    style={{ opacity: 0.6, marginRight: 6 }}
                  />
                )}
                <Text
                  numberOfLines={1}
                  style={[
                    styles.last,
                    { color: colors.text, opacity: 0.6, flex: 1 },
                    !seen && { fontWeight: 'bold', opacity: 0.9, fontSize: 16 },
                  ]}
                >
                  {formatLastMessage(item.lastMessage).text}
                </Text>
              </View>

              {item.lastMessage?.timestamp && (
                <Text style={[styles.timestamp, { color: colors.text, opacity: 0.5 }]}>
                  {new Date(item.lastMessage.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              )}
            </View>
          </View>

          {item.unseenCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.unreadText}>
                {item.unseenCount > 99 ? '99+' : item.unseenCount}
              </Text>
            </View>
          )}
        </Pressable>
      );
    },
    [nav, colors, dispatch, t, myId]
  );

  // ✅ Render states
  if (initializing || loading) {
    return (
      <View style={styles.emptyContainer}>
        <LottieView
          source={require('../../assets/Chatbot.json')}
          autoPlay
          loop
          style={{ width: 200, height: 200 }}
        />
        <Text style={[styles.emptyText, { color: colors.text, opacity: 0.7 }]}>
          {t('chat.loadingChats')}
        </Text>
      </View>
    );
  }

  if (filteredList.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <LottieView
          source={require('../../assets/Chatbot.json')}
          autoPlay
          loop
          style={{ width: 200, height: 200 }}
        />
        <Text style={[styles.emptyText, { color: colors.text, opacity: 0.7 }]}>
          {t('chat.noChats')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.searchBar,
          { backgroundColor: colors.background, borderBottomColor: colors.text + '22' },
        ]}
      >
        <TextInput
          placeholder={t('chat.searchChats')}
          value={search}
          onChangeText={setSearch}
          style={[styles.searchInput, { backgroundColor: colors.card, color: colors.text }]}
          placeholderTextColor={colors.text + '60'}
        />
      </View>

      <FlatList
        data={filteredList}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default ChatContainer;
