import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { getChatList, markChatAsRead } from '../../redux/slices/chatsSlice';
import CustomAvatar from '../../components/CustomAvatar';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import { useAppTheme } from '../../themes/useTheme';
import { useTranslation } from 'react-i18next';

const ChatContainer = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { list, loading } = useSelector((s: RootState) => s.chats);
  const nav = useNavigation<any>();
  const [search, setSearch] = useState('');
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  // ✅ Fetch chat list
  useEffect(() => {
    dispatch(getChatList());
  }, [dispatch]);

  // ✅ Filter chats by search
  const filteredList = list.filter(
    item =>
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.email?.toLowerCase().includes(search.toLowerCase()),
  );

  // ✅ Render each chat row
  // const renderItem = useCallback(
  //   ({ item }: { item: any }) => (
  //     <Pressable
  //       style={[styles.row, { borderBottomColor: colors.text + '22', backgroundColor: colors.background }]}
  //       android_ripple={{ color: colors.primary + '20' }}
  //       onPress={() => {
  //         // Mark as read when opening chat
  //         if (item.unreadCount > 0) {
  //           dispatch(markChatAsRead(item.id));
  //         }
  //         nav.navigate('ChatRoom', { friendId: item.id, friendName: item.name })
  //       }}
  //     >
  //       <CustomAvatar name={item.name} />
  //       <View style={{ marginLeft: 12, flex: 1 }}>
  //         <Text style={[
  //           styles.name, 
  //           { color: colors.text },
  //           item.unreadCount > 0 && { fontWeight: 'bold' }
  //         ]}>
  //           {item.name}
  //         </Text>
  //         <Text numberOfLines={1} style={[
  //           styles.last, 
  //           { color: colors.text, opacity: 0.6 },
  //           item.unreadCount > 0 && { fontWeight: '600', opacity: 0.8 }
  //         ]}>
  //           {item.lastMessage || t('chat.noMessages')}
  //         </Text>
  //       </View>
  //       {item.unreadCount > 0 && (
  //         <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
  //           <Text style={styles.unreadText}>
  //             {item.unreadCount > 99 ? '99+' : item.unreadCount}
  //           </Text>
  //         </View>
  //       )}
  //     </Pressable>
  //   ),
  //   [nav, colors, dispatch, t],
  // );

  const renderItem = useCallback(
  ({ item }: { item: any }) => (
    <Pressable
      style={[styles.row, { borderBottomColor: colors.text + '22', backgroundColor: colors.background }]}
      android_ripple={{ color: colors.primary + '20' }}
      onPress={() => {
        if (item.unreadCount > 0) {
          dispatch(markChatAsRead(item.id));
        }
        nav.navigate('ChatRoom', { friendId: item.id, friendName: item.name }); // item.id is roomId
      }}
    >
      <CustomAvatar name={item.name} />
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text
          style={[
            styles.name,
            { color: colors.text },
            item.unreadCount > 0 && { fontWeight: 'bold' },
          ]}
        >
          {item.name}
        </Text>
        <Text
          numberOfLines={1}
          style={[
            styles.last,
            { color: colors.text, opacity: 0.6 },
            item.unreadCount > 0 && { fontWeight: '600', opacity: 0.8 },
          ]}
        >
          {item.lastMessage
            ? item.lastMessage.length > 50
              ? item.lastMessage.substring(0, 47) + '...'
              : item.lastMessage
            : t('chat.noMessages')}
        </Text>
        {item.timestamp && (
          <Text style={[styles.timestamp, { color: colors.text, opacity: 0.5 }]}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}
      </View>
      {item.unreadCount > 0 && (
        <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.unreadText}>
            {item.unreadCount > 99 ? '99+' : item.unreadCount}
          </Text>
        </View>
      )}
    </Pressable>
  ),
  [nav, colors, dispatch, t],
);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>      
      <View style={[styles.searchBar, { backgroundColor: colors.background, borderBottomColor: colors.text + '22' }]}>
        <TextInput
          placeholder={t('chat.searchChats')}
          value={search}
          onChangeText={setSearch}
          style={[styles.searchInput, { backgroundColor: colors.card, color: colors.text }]}
          placeholderTextColor={colors.text + '60'}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />
      ) : filteredList.length === 0 ? (
        // 🟢 Empty State with Lottie
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
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={i => i.id}
          refreshing={loading}
          onRefresh={() => dispatch(getChatList())}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
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
