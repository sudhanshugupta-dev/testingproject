import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  TextInput,
  Pressable,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import {
  listenToMessages,
  sendMessage,
  getOrCreateChatRoom,
} from '../../services/firebase/chat';
import ChatBubble from '../../components/ChatBubble';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { styles } from './styles';

const ChatRoomContainer = () => {
  const route = useRoute<any>();
  const { friendId } = route.params || {};
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const myId = useSelector((s: RootState) => s.auth.user?.uid);
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    if (!myId || !friendId) {
      setError('Invalid user or friend ID');
      return;
    }

    // Fetch or create chat room
    const fetchRoom = async () => {
      try {
        const chatRoomId = await getOrCreateChatRoom(myId, friendId);
        setRoomId(chatRoomId);
        setError(null);
      } catch (error: any) {
        console.error('Error fetching/creating chat room:', error);
        setError('Failed to load chat. Please try again.');
      }
    };

    fetchRoom();
  }, [myId, friendId]);

  useEffect(() => {
    if (!roomId) return;

    // Listen to messages (including old messages) for the room
    const unsubscribe = listenToMessages(roomId, msgs => {
      setMessages(msgs);
      setError(null);
    });
    return unsubscribe;
  }, [roomId]);

  const onSend = async () => {
    if (!text.trim() || !roomId || !myId) return;

    try {
      await sendMessage(roomId, {
        text: text.trim(),
        senderId: myId,
        createdAt: Date.now(),
      });
      setText('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <>
          <FlatList
            style={styles.messageList}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <ChatBubble
                text={item.text}
                isMine={item.senderId === myId}
                timestamp={item.createdAt}
              />
            )}
            contentContainerStyle={styles.messageListContent}
            inverted // Show newest messages at the bottom
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No messages yet. Start the conversation!
                </Text>
              </View>
            }
          />
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Type a message"
              placeholderTextColor="#999"
              multiline
              maxLength={1000}
            />
            <Pressable
              style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
              onPress={onSend}
              disabled={!text.trim()}
            >
              <Text style={styles.sendText}>Send</Text>
            </Pressable>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
};
export default ChatRoomContainer;
