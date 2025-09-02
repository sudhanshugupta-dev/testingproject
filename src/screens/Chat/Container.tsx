import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import { useTranslation } from 'react-i18next';

import { AppDispatch, RootState } from '../../redux/store';
import {
  startChatListListener,
  stopChatListListener,
  markChatAsRead,
} from '../../redux/slices/chatsSlice';

import CustomAvatar from '../../components/CustomAvatar';
import { useAppTheme } from '../../themes/useTheme';

const ChatContainer = () => {
  const dispatch = useDispatch<AppDispatch>();
  const nav = useNavigation<any>();
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const { list, loading } = useSelector((s: RootState) => s.chats);
  const myId = useSelector((s: RootState) => s.auth.user?.uid);

  const [search, setSearch] = useState('');
  const [initializing, setInitializing] = useState(true);

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
    if (!messageSeenBy || !myId) return true; // treat as seen if missing
    return messageSeenBy[myId] === true;
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
            if (item.unreadCount > 0) {
              dispatch(markChatAsRead(item.id));
            }
            nav.navigate('ChatRoom', { friendId: item.id, friendName: item.name });
          }}
        >
          <CustomAvatar name={item.name} />

          <View style={{ marginLeft: 12, flex: 1 }}>
            {/* Chat Name */}
            <Text
              style={[
                styles.name,
                { color: colors.text },
                !seen && { fontWeight: 'bold', fontSize: 19 }, // bold if NOT seen
              ]}
            >
              {item.name}
            </Text>

            {/* Last Message + Timestamp */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text
                numberOfLines={1}
                style={[
                  styles.last,
                  { color: colors.text, opacity: 0.6 },
                  !seen && { fontWeight: 'bold', opacity: 0.9, fontSize: 16 },
                ]}
              >
                {item.lastMessage?.text
                  ? item.lastMessage.text.length > 50
                    ? item.lastMessage.text.substring(0, 15) + '...'
                    : item.lastMessage.text
                  : t('chat.noMessages')}
              </Text>

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

          {/* Unread Badge */}
          {item.unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.unreadText}>
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </Text>
            </View>
          )}
        </Pressable>
      );
    },
    [nav, colors, dispatch, t, myId]
  );

  // ✅ Render state (priority order)
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
      {/* Search */}
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


      {/* Chat List */}
      <FlatList
        data={filteredList}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  searchBar: {
    padding: 10,
    borderBottomWidth: 1,
  },
  searchInput: {
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 16,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
  },
  name: { fontWeight: '600', fontSize: 16 },
  last: { marginTop: 4, fontSize: 14 },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ChatContainer;
