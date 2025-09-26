

// src/screens/ChatContainer.tsx
import React, { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  FlatList,
  Text,
  Pressable,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';

import { AppDispatch, RootState } from '../../redux/store';
import { createGroupChatRoom, generateRoomId } from '../../services/firebase/chat';
import { getFriends } from '../../services/firebase/requests';
import FriendSelectionBottomSheet from '../../components/FriendSelectionBottomSheet';
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
  const [createGroupBottomSheetVisible, setCreateGroupBottomSheetVisible] = useState(false);
  const [friendsList, setFriendsList] = useState<any[]>([]);

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

  // ✅ Start/stop chat listener and load friends
  useEffect(() => {
    dispatch(startChatListListener());
    loadFriends();
    setInitializing(false);

    return () => {
      dispatch(stopChatListListener());
    };
  }, [dispatch]);

  // ✅ Load friends list
  const loadFriends = async () => {
    try {
      const friendIds = await getFriends();
      const friendsData = await Promise.all(
        friendIds.map(async (friendId: string) => {
          const userDoc = await firestore().collection('users').doc(friendId).get();
          if (userDoc.exists()) {
            const userData = userDoc.data();
            return {
              id: friendId,
              name: userData?.name || 'Unknown',
              email: userData?.email || '',
              avatar: userData?.avatar || null,
              isFriend: true
            };
          }
          return null;
        })
      );
      setFriendsList(friendsData.filter(Boolean));
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  // ✅ Check if current user has seen the last message
  const hasUserSeen = (lastMessage: any): boolean => {
    if (!lastMessage || !myId) return true;
    
    // If the current user sent the message, they've "seen" it
    if (lastMessage.senderId === myId) return true;
    
    // Check seenBy field for the current user
    if (lastMessage.seenBy && typeof lastMessage.seenBy === 'object') {
      return lastMessage.seenBy[myId] === true;
    }
    
    // Fallback to isSeen field
    return lastMessage.isSeen === true;
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

  // ✅ Combine chats and friends, then filter by search
  const existingChatIds = new Set(list.map(chat => chat.id));
  const friendsNotInChats = friendsList.filter(friend => !existingChatIds.has(friend.id));
  
  const combinedList = [
    ...list, // Existing chats with messages
    ...friendsNotInChats.map(friend => ({
      ...friend,
      roomId: generateRoomId(myId!, friend.id),
      lastMessage: null,
      unseenCount: 0,
      isNewChat: true
    }))
  ];

  const filteredList = combinedList.filter(
    item =>
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.email?.toLowerCase().includes(search.toLowerCase())
  );

   console.log(filteredList, ":rfa")
  // ✅ Render single chat row
  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      const seen = hasUserSeen(item.lastMessage);
      const hasUnreadMessages = item.unseenCount > 0;

      return (
        <Pressable
          style={[
            styles.row,
            { borderBottomColor: colors.text + '22', backgroundColor: colors.background },
          ]}
          android_ripple={{ color: colors.primary + '20' }}
          onPress={() => {
            // Mark chat as read when opening
            if (hasUnreadMessages) {
              dispatch(markChatAsRead(item.isGroup ? item.roomId : item.id));
            }
            
            if (item.isGroup) {
              nav.navigate('ChatRoom', { 
                roomId: item.roomId, 
                friendName: item.name,
                isGroup: true,
                groupName: item.groupName 
              });
            } else {
              nav.navigate('ChatRoom', { 
                friendId: item.id, 
                friendName: item.name,
                roomId: item.roomId || generateRoomId(myId!, item.id)
              });
            }
          }}
        >
          <CustomAvatar name={item.name} />

          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text
              style={[
                styles.name,
                { color: colors.text },
                (!seen || hasUnreadMessages) && { fontWeight: 'bold', fontSize: 19 },
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
                    (!seen || hasUnreadMessages) && { fontWeight: 'bold', opacity: 0.9, fontSize: 16 },
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

          {hasUnreadMessages && (
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

  // Handle group creation
  const handleCreateGroup = useCallback(async (selectedFriends: any[]) => {
    if (!myId || selectedFriends.length === 0) return;
    
    try {
      const participantIds = [myId, ...selectedFriends.map(friend => friend.id)];
      const roomId = await createGroupChatRoom(participantIds, 'Group', myId);
      
      // Navigate to the new group chat
      nav.navigate('ChatRoom', {
        roomId,
        isGroup: true,
        groupName: 'Group'
      });
      
    } catch (error: any) {
      console.error('Error creating group:', error);
    }
  }, [myId, nav]);

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
      
      {/* Create Group FAB */}
      <TouchableOpacity
        style={[styles.createGroupFab, { backgroundColor: colors.primary }]}
        onPress={() => setCreateGroupBottomSheetVisible(true)}
        activeOpacity={0.8}
      >
        <Icon name="people" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Group Creation Bottom Sheet */}
      <FriendSelectionBottomSheet
        visible={createGroupBottomSheetVisible}
        onClose={() => setCreateGroupBottomSheetVisible(false)}
        messageToForward={null}
        forwarded={false}
        onForwardComplete={handleCreateGroup}
      />
    </View>
  );
};

export default ChatContainer;
