import React, { useEffect } from 'react';
import { View, FlatList, Text, Pressable, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { getChatList } from '../../redux/slices/chatsSlice';
import CustomAvatar from '../../components/CustomAvatar';
import { useNavigation } from '@react-navigation/native';

const ChatContainer = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { list, loading } = useSelector((s: RootState) => s.chats);
  const nav = useNavigation<any>();

  useEffect(() => {
    dispatch(getChatList());
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <FlatList
        data={list}
        keyExtractor={(i) => i.id}
        refreshing={loading}
        onRefresh={() => dispatch(getChatList())}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => nav.navigate('ChatRoom', { roomId: item.id, name: item.name })}>
            <CustomAvatar name={item.name} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text numberOfLines={1} style={styles.last}>{item.lastMessage || ''}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#fff' }, row: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }, name: { fontWeight: '700', color: '#111827' }, last: { color: '#6B7280', marginTop: 4 } });

export default ChatContainer;
