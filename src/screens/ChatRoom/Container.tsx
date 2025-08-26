// import React, { useEffect, useState, useCallback, useRef } from 'react';
// import {
//   View,
//   FlatList,
//   TextInput,
//   Pressable,
//   Text,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
//   ActivityIndicator,
// } from 'react-native';
// import { useRoute } from '@react-navigation/native';
// import {
//   listenToMessages,
//   sendMessage,
//   sendReplyMessage,
//   getOrCreateChatRoom,
//   createMockMessages,
//   markMessagesAsRead,
//   Message,
// } from '../../services/firebase/chat';
// import ChatBubble from '../../components/ChatBubble';
// import CustomAvatar from '../../components/CustomAvatar';
// import ReplyMessageBar from '../../components/ReplyMessageBar';
// import { useSelector } from 'react-redux';
// import { RootState } from '../../redux/store';
// import { useAppTheme } from '../../themes/useTheme';
// import { useTranslation } from 'react-i18next';

// // Message interface already includes replyTo from Firebase service

// const ChatRoomContainer = () => {
//   const route = useRoute<any>();
//   const { friendId, friendName } = route.params || {};
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [text, setText] = useState('');
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [sending, setSending] = useState(false);
//   const [replyingTo, setReplyingTo] = useState<Message | null>(null);
//   const myId = useSelector((s: RootState) => s.auth.user?.uid);
//   const myName = useSelector((s: RootState) => s.auth.user?.displayName || 'Me');
//   const [roomId, setRoomId] = useState<string | null>(null);
//   const { colors } = useAppTheme();
//   const { t } = useTranslation();
//   const flatListRef = useRef<FlatList>(null);

//   useEffect(() => {
//     if (!myId || !friendId) {
//       setError('Invalid user or friend ID');
//       return;
//     }

//     // Fetch or create chat room
//     const fetchRoom = async () => {
//       try {
//         const chatRoomId = await getOrCreateChatRoom(myId, friendId);
//         setRoomId(chatRoomId);
//         setError(null);
//       } catch (error: any) {
//         console.error('Error fetching/creating chat room:', error);
//         setError('Failed to load chat. Please try again.');
//       }
//     };

//     fetchRoom();
//   }, [myId, friendId]);

//   useEffect(() => {
//     if (!roomId) return;

//     setLoading(true);
//     // Listen to messages (including old messages) for the room
//     const unsubscribe = listenToMessages(roomId, (msgs) => {
//       // Process messages and ensure proper timestamp handling
//       const processedMessages = msgs.map((msg) => ({
//         ...msg,
//         createdAt: msg.createdAt?.toMillis ? msg.createdAt.toMillis() : (msg.createdAt || Date.now()),
//       }));
//       setMessages(processedMessages);
//       setError(null);
//       setLoading(false);

//       // Auto scroll to bottom when new messages arrive
//       setTimeout(() => {
//         flatListRef.current?.scrollToEnd({ animated: true });
//       }, 100);
//     });
//     return unsubscribe;
//   }, [roomId]);

//   const onSend = useCallback(async () => {
//     if (!text.trim() || !roomId || !myId || sending) return;

//     setSending(true);
//     const messageText = text.trim();
//     setText(''); // Clear input immediately for better UX
//     setReplyingTo(null); // Clear reply state

//     try {
//       if (replyingTo) {
//         // Send reply message
//         await sendReplyMessage(roomId, {
//           text: messageText,
//           senderId: myId,
//           createdAt: Date.now(),
//           replyTo: {
//             messageId: replyingTo.id || '',
//             text: replyingTo.text,
//             senderId: replyingTo.senderId,
//             senderName: replyingTo.senderId === myId ? myName : friendName || 'Friend'
//           }
//         });
//       } else {
//         // Send regular message
//         await sendMessage(roomId, {
//           text: messageText,
//           senderId: myId,
//           createdAt: Date.now(),
//         });
//       }
//     } catch (error: any) {
//       console.error('Error sending message:', error);
//       setError('Failed to send message. Please try again.');
//       setText(messageText); // Restore message on error
//     } finally {
//       setSending(false);
//     }
//   }, [text, roomId, myId, myName, sending, replyingTo, friendName]);

//   const renderMessage = useCallback(
//     ({ item }: { item: Message }) => {
//       const handleLongPress = () => {
//         setReplyingTo(item);
//       };

//       return (
//         <ChatBubble
//           text={item.text}
//           isMine={item.senderId === myId}
//           timestamp={item.createdAt}
//           replyTo={item.replyTo}
//           onLongPress={handleLongPress}
//           currentUserId={myId}
//         />
//       );
//     },
//     [myId],
//   );

//   const scrollToEnd = useCallback(() => {
//     flatListRef.current?.scrollToEnd({ animated: true });
//   }, []);

//   // Function to create mock messages for testing
//   const createTestMessages = useCallback(async () => {
//     if (!roomId || !myId || !friendId) return;

//     try {
//       await createMockMessages(roomId, myId, friendId);
//       console.log('Test messages created successfully');
//     } catch (error: any) {
//       console.error('Error creating test messages:', error);
//     }
//   }, [roomId, myId, friendId]);

//   // Mark messages as read when user enters the chat
//   useEffect(() => {
//     if (roomId && myId) {
//       markMessagesAsRead(roomId, myId);
//     }
//   }, [roomId, myId]);

//   return (
//     <KeyboardAvoidingView
//       style={[styles.container, { backgroundColor: colors.background }]}
//       behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//       keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
//     >
//       {/* Chat Header */}
//       <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.text + '22' }]}>
//         <View style={styles.headerContent}>
//           <CustomAvatar name={friendName || 'Unknown'} size={40} />
//           <View style={styles.headerTextContainer}>
//             <Text style={[styles.friendName, { color: colors.text }]}>
//               {friendName || t('chat.friend')}
//             </Text>
//             <Text style={[styles.statusText, { color: colors.text, opacity: 0.6 }]}>
//               {t('chat.tapToViewProfile')}
//             </Text>
//           </View>
//         </View>
//       </View>

//       {error ? (
//         <View style={styles.errorContainer}>
//           <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
//         </View>
//       ) : (
//         <>
//           {loading ? (
//             <View style={styles.loadingContainer}>
//               <ActivityIndicator size="large" color={colors.primary} />
//               <Text style={[styles.loadingText, { color: colors.text, opacity: 0.7 }]}>
//                 {t('chat.loadingMessages')}
//               </Text>
//             </View>
//           ) : (
//             <>
//               <FlatList
//                 ref={flatListRef}
//                 style={styles.messageList}
//                 data={messages}
//                 keyExtractor={(item) => item.id || Math.random().toString()}
//                 renderItem={renderMessage}
//                 contentContainerStyle={styles.messageListContent}
//                 showsVerticalScrollIndicator={false}
//                 maintainVisibleContentPosition={{
//                   minIndexForVisible: 0,
//                   autoscrollToTopThreshold: 10,
//                 }}
//                 onContentSizeChange={scrollToEnd}
//                 onLayout={scrollToEnd}
//                 ListEmptyComponent={
//                   <View style={styles.emptyContainer}>
//                     <Text style={[styles.emptyText, { color: colors.text, opacity: 0.7 }]}>
//                       {t('chat.noMessages')}
//                     </Text>
//                   </View>
//                 }
//               />
//               {replyingTo && (
//                 <ReplyMessageBar
//                   replyMessage={{
//                     id: replyingTo.id || '',
//                     text: replyingTo.text,
//                     senderId: replyingTo.senderId,
//                     senderName: replyingTo.senderId === myId ? myName : friendName || 'Friend'
//                   }}
//                   onCancel={() => setReplyingTo(null)}
//                   currentUserId={myId}
//                 />
//               )}
//               <View style={[styles.inputRow, { borderTopColor: colors.text + '22' }]}>
//                 <TextInput
//                   style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
//                   value={text}
//                   onChangeText={setText}
//                   placeholder={t('chat.typeMessage')}
//                   placeholderTextColor="#999"
//                   multiline
//                   maxLength={1000}
//                 />
//                 <Pressable
//                   style={[
//                     styles.sendBtn,
//                     { backgroundColor: text.trim() && !sending ? colors.primary : colors.text + '33' },
//                   ]}
//                   onPress={onSend}
//                   disabled={!text.trim() || sending}
//                 >
//                   {sending ? (
//                     <ActivityIndicator size="small" color="#fff" />
//                   ) : (
//                     <Text style={styles.sendText}>{t('chat.send')}</Text>
//                   )}
//                 </Pressable>
//               </View>
//             </>
//           )}
//         </>
//       )}
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   header: {
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   headerContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   headerTextContainer: {
//     marginLeft: 12,
//     flex: 1,
//   },
//   friendName: {
//     fontSize: 18,
//     fontWeight: '700',
//   },
//   statusText: {
//     fontSize: 12,
//     marginTop: 2,
//   },
//   errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   errorText: { fontWeight: '600' },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   messageList: { flex: 1 },
//   messageListContent: { padding: 12, flexGrow: 1 },
//   emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
//   emptyText: { fontSize: 16, fontWeight: '500' },
//   inputRow: { flexDirection: 'row', alignItems: 'center', padding: 8, borderTopWidth: 1 },
//   input: { flex: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8 },
//   sendBtn: { borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16 },
//   sendText: { color: '#fff', fontWeight: '700' },
//   bubbleWrapper: { marginVertical: 4 },
//   replyingContainer: {
//     flexDirection: 'row',
//     padding: 10,
//     borderTopWidth: 1,
//     borderTopColor: '#00000022',
//   },
//   replyingText: { flex: 1, fontSize: 14, opacity: 0.8 },
//   cancelReply: { fontSize: 14, fontWeight: '600' },
// });

// export default ChatRoomContainer;



import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  TextInput,
  Pressable,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import {
  listenToMessages,
  sendMessage,
  sendReplyMessage,
  getOrCreateChatRoom,
  createMockMessages,
  markMessagesAsRead,
  Message,
} from '../../services/firebase/chat';
import ChatBubble from '../../components/ChatBubble';
import CustomAvatar from '../../components/CustomAvatar';
import ReplyMessageBar from '../../components/ReplyMessageBar';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useAppTheme } from '../../themes/useTheme';
import { useTranslation } from 'react-i18next';
import { updateChatMessage } from '../../redux/slices/chatsSlice'; // Import updateChatMessage

const ChatRoomContainer = () => {
  const route = useRoute<any>();
  const { friendId, friendName } = route.params || {}; // friendId is actually roomId
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const myId = useSelector((s: RootState) => s.auth.user?.uid);
  const myName = useSelector((s: RootState) => s.auth.user?.displayName || 'Me');
  const [roomId, setRoomId] = useState<string | null>(friendId || null); // Use friendId as roomId
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const flatListRef = useRef<FlatList>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!myId || !friendId) {
      setError('Invalid user or chat room ID');
      return;
    }

    // If roomId isn't set, fetch or create it (optional, depending on your setup)
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

    // Only fetch room if friendId isn't the roomId
    if (!roomId) {
      fetchRoom();
    }
  }, [myId, friendId, roomId]);

  useEffect(() => {
    if (!roomId) return;

    setLoading(true);
    const unsubscribe = listenToMessages(roomId, (msgs) => {
      const processedMessages = msgs.map((msg) => ({
        ...msg,
        createdAt: msg.createdAt?.toMillis ? msg.createdAt.toMillis() : (msg.createdAt || Date.now()),
      }));
      setMessages(processedMessages);
      setError(null);
      setLoading(false);

      // Update last message in Redux store
      const lastMessage = processedMessages[processedMessages.length - 1];
      if (lastMessage) {
        dispatch(updateChatMessage({
          chatId: roomId,
          message: lastMessage.text,
          isFromCurrentUser: lastMessage.senderId === myId,
          replyTo: lastMessage.replyTo ? { text: lastMessage.replyTo.text } : undefined,
        }));
      }

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });
    return unsubscribe;
  }, [roomId, myId, dispatch]);

  const onSend = useCallback(async () => {
    if (!text.trim() || !roomId || !myId || sending) return;

    setSending(true);
    const messageText = text.trim();
    setText('');
    const currentReplyingTo = replyingTo;
    setReplyingTo(null);

    try {
      if (currentReplyingTo) {
        await sendReplyMessage(roomId, {
          text: messageText,
          senderId: myId,
          createdAt: Date.now(),
          replyTo: {
            messageId: currentReplyingTo.id || '',
            text: currentReplyingTo.text,
            senderId: currentReplyingTo.senderId,
            senderName: currentReplyingTo.senderId === myId ? myName : friendName || 'Friend',
          },
        });
        // Dispatch updateChatMessage for reply
        dispatch(updateChatMessage({
          chatId: roomId,
          message: messageText,
          isFromCurrentUser: true,
          replyTo: { text: currentReplyingTo.text },
        }));
      } else {
        await sendMessage(roomId, {
          text: messageText,
          senderId: myId,
          createdAt: Date.now(),
        });
        // Dispatch updateChatMessage for regular message
        dispatch(updateChatMessage({
          chatId: roomId,
          message: messageText,
          isFromCurrentUser: true,
        }));
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
      setText(messageText);
      setReplyingTo(currentReplyingTo);
    } finally {
      setSending(false);
    }
  }, [text, roomId, myId, myName, sending, replyingTo, friendName, dispatch]);

  const renderMessage = useCallback(
    ({ item }: { item: Message }) => {
      const handleLongPress = () => {
        setReplyingTo(item);
      };

      return (
        <ChatBubble
          text={item.text}
          isMine={item.senderId === myId}
          timestamp={item.createdAt}
          replyTo={item.replyTo}
          onLongPress={handleLongPress}
          currentUserId={myId}
        />
      );
    },
    [myId],
  );

  const scrollToEnd = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, []);

  const createTestMessages = useCallback(async () => {
    if (!roomId || !myId || !friendId) return;

    try {
      await createMockMessages(roomId, myId, friendId);
      console.log('Test messages created successfully');
    } catch (error: any) {
      console.error('Error creating test messages:', error);
    }
  }, [roomId, myId, friendId]);

  useEffect(() => {
    if (roomId && myId) {
      markMessagesAsRead(roomId, myId);
      dispatch(markChatAsRead(roomId)); // Mark chat as read in Redux
    }
  }, [roomId, myId, dispatch]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.text + '22' }]}>
        <View style={styles.headerContent}>
          <CustomAvatar name={friendName || 'Unknown'} size={40} />
          <View style={styles.headerTextContainer}>
            <Text style={[styles.friendName, { color: colors.text }]}>
              {friendName || t('chat.friend')}
            </Text>
            <Text style={[styles.statusText, { color: colors.text, opacity: 0.6 }]}>
              {t('chat.tapToViewProfile')}
            </Text>
          </View>
        </View>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
        </View>
      ) : (
        <>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.text, opacity: 0.7 }]}>
                {t('chat.loadingMessages')}
              </Text>
            </View>
          ) : (
            <>
              <FlatList
                ref={flatListRef}
                style={styles.messageList}
                data={messages}
                keyExtractor={(item) => item.id || Math.random().toString()}
                renderItem={renderMessage}
                contentContainerStyle={styles.messageListContent}
                showsVerticalScrollIndicator={false}
                maintainVisibleContentPosition={{
                  minIndexForVisible: 0,
                  autoscrollToTopThreshold: 10,
                }}
                onContentSizeChange={scrollToEnd}
                onLayout={scrollToEnd}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: colors.text, opacity: 0.7 }]}>
                      {t('chat.noMessages')}
                    </Text>
                  </View>
                }
              />
              {replyingTo && (
                <ReplyMessageBar
                  replyMessage={{
                    id: replyingTo.id || '',
                    text: replyingTo.text,
                    senderId: replyingTo.senderId,
                    senderName: replyingTo.senderId === myId ? myName : friendName || 'Friend',
                  }}
                  onCancel={() => setReplyingTo(null)}
                  currentUserId={myId}
                />
              )}
              <View style={[styles.inputRow, { borderTopColor: colors.text + '22' }]}>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                  value={text}
                  onChangeText={setText}
                  placeholder={t('chat.typeMessage')}
                  placeholderTextColor="#999"
                  multiline
                  maxLength={1000}
                />
                <Pressable
                  style={[
                    styles.sendBtn,
                    { backgroundColor: text.trim() && !sending ? colors.primary : colors.text + '33' },
                  ]}
                  onPress={onSend}
                  disabled={!text.trim() || sending}
                >
                  {sending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.sendText}>{t('chat.send')}</Text>
                  )}
                </Pressable>
              </View>
            </>
          )}
        </>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  friendName: {
    fontSize: 18,
    fontWeight: '700',
  },
  statusText: {
    fontSize: 12,
    marginTop: 2,
  },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontWeight: '600' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  messageList: { flex: 1 },
  messageListContent: { padding: 12, flexGrow: 1 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16, fontWeight: '500' },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 8, borderTopWidth: 1 },
  input: { flex: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8 },
  sendBtn: { borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16 },
  sendText: { color: '#fff', fontWeight: '700' },
  bubbleWrapper: { marginVertical: 4 },
  replyingContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#00000022',
  },
  replyingText: { flex: 1, fontSize: 14, opacity: 0.8 },
  cancelReply: { fontSize: 14, fontWeight: '600' },
});

export default ChatRoomContainer;