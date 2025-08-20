import React, { useEffect, useState } from 'react';
import { View, FlatList, TextInput, Pressable, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { listenToMessages, sendMessage } from '../../services/firebase/chat';
import ChatBubble from '../../components/ChatBubble';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

const ChatRoomContainer = () => {
  const route = useRoute<any>();
  const { roomId } = route.params || {};
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const userId = useSelector((s: RootState) => s.auth.user?.uid);

  useEffect(() => {
    if (!roomId) return;
    const off = listenToMessages(roomId, setMessages);
    return off;
  }, [roomId]);

  const onSend = async () => {
    if (!text.trim() || !roomId || !userId) return;
    await sendMessage(roomId, { text: text.trim(), senderId: userId, createdAt: Date.now() });
    setText('');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList style={{ flex: 1, padding: 12 }} data={messages} keyExtractor={(i) => i.id} renderItem={({ item }) => <ChatBubble text={item.text} isMine={item.senderId === userId} />} />
      <View style={styles.inputRow}>
        <TextInput style={styles.input} value={text} onChangeText={setText} placeholder="Type a message" />
        <Pressable style={styles.sendBtn} onPress={onSend}><Text style={styles.sendText}>Send</Text></Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({ inputRow: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderTopColor: '#E5E7EB', backgroundColor: '#fff' }, input: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 12, height: 44 }, sendBtn: { marginLeft: 10, backgroundColor: '#4F46E5', paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', borderRadius: 10 }, sendText: { color: '#fff', fontWeight: '700' } });

export default ChatRoomContainer;
