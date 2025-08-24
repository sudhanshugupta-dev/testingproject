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
import { useAppTheme } from '../../themes/useTheme';
import { useTranslation } from 'react-i18next';

const ChatRoomContainer = () => {
  const route = useRoute<any>();
  const { friendId } = route.params || {};
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const myId = useSelector((s: RootState) => s.auth.user?.uid);
  const [roomId, setRoomId] = useState<string | null>(null);
  const { colors } = useAppTheme();
  const { t } = useTranslation();

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
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
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
                <Text style={[styles.emptyText, { color: colors.text, opacity: 0.7 }]}>
                  No messages yet. Start the conversation!
                </Text>
              </View>
            }
          />
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
              style={[styles.sendBtn, { backgroundColor: colors.primary }, !text.trim() && styles.sendBtnDisabled]}
              onPress={onSend}
              disabled={!text.trim()}
            >
              <Text style={styles.sendText}>{t('chat.send')}</Text>
            </Pressable>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontWeight: '600' },
  messageList: { flex: 1 },
  messageListContent: { padding: 12 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16, fontWeight: '500' },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 8, borderTopWidth: 1 },
  input: { flex: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8 },
  sendBtn: { borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16 },
  sendBtnDisabled: { opacity: 0.6 },
  sendText: { color: '#fff', fontWeight: '700' },
});

export default ChatRoomContainer;


// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   FlatList,
//   TextInput,
//   Pressable,
//   Text,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
// } from 'react-native';
// import { useRoute } from '@react-navigation/native';
// import {
//   listenToMessages,
//   sendMessage,
//   getOrCreateChatRoom,
// } from '../../services/firebase/chat';
// import { listenToUserPresence, setupUserPresence } from '../../services/firebase/chat';
// import ChatBubble from '../../components/ChatBubble';
// import { useSelector } from 'react-redux';
// import { RootState } from '../../redux/store';
// import { useAppTheme } from '../../themes/useTheme';
// import { useTranslation } from 'react-i18next';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import auth from '@react-native-firebase/auth';
// import CustomAvatar from '../../components/CustomAvatar';


// const ChatRoomContainer = () => {
//   const route = useRoute<any>();
//   const { friendId, friendName } = route.params || {};
//   const [messages, setMessages] = useState<any[]>([]);
//   const [text, setText] = useState('');
//   const [error, setError] = useState<string | null>(null);
//   const myId = useSelector((s: RootState) => s.auth.user?.uid);
//   const myName = useSelector((s: RootState) => s.auth.user?.displayName);
//   const [roomId, setRoomId] = useState<string | null>(null);
//   const { colors } = useAppTheme();
//   const { t } = useTranslation();
//   const [isFriendOnline, setIsFriendOnline] = useState(false);
//   const flatListRef = React.useRef<FlatList>(null);

//   useEffect(() => {
//     // Set up presence for the current user
//     if (myId) {
//       setupUserPresence(myId);
//     }

//     // Set up presence for the current user
//     if (myId) {
//       setupUserPresence(myId);
//     }

//     if (!myId || !friendId) {
//       setError(t('chat.error.invalidUserOrFriend'));
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
//         setError(t('chat.error.failedToLoadChat'));
//       }
//     };

//     fetchRoom();
//   }, [myId, friendIduseEffect(() => {
//     if (!roomId) return;

//     // Listen to messages
//     const unsubscribe = listenToMessages(roomId, (msgs) => {
//     // Listen to messages
//     const unsubscribe = listenToMessages(roomId, (msgs) => {
//       setMessages(msgs);
//       setError(null);
//       // Scroll to the latest message
//       setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
//       // Scroll to the latest message
//       setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
//     });
//     return unsubscribe;
//   }, [roomId]);

//   useEffect(() => {
//     if (!friendId) return;

//     // Listen to friend's presence
//     const unsubscribePresence = listenToUserPresence(friendId, (online) => {
//       setIsFriendOnline(online);
//     });
//     return unsubscribePresence;
//   }, [friendId]);

//   useEffect(() => {
//     if (!friendId) return;

//     // Listen to friend's presence
//     const unsubscribePresence = listenToUserPresence(friendId, (online) => {
//       setIsFriendOnline(online);
//     });
//     return unsubscribePresence;
//   }, [friendId]);

//   const onSend = async () => {
//     if (!text.trim() || !roomId || !myId) return;

//     try {
//       await sendMessage(roomId, {
//         text: text.trim(),
//         senderId: myId,
//         createdAt: Date.now(),
//       });
//       setText('');
//       // Scroll to the latest message after sending
//       setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
//       // Scroll to the latest message after sending
//       setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
//     } catch (error: any) {
//       console.error('Error sending message:', error);
//       setError(t('chat.error.failedToSendMessage'));
//     }
//   };
  

//   return (
//     <KeyboardAvoidingView
//       style={[styles.container, { backgroundColor: colors.background }]}
//       style={[styles.container, { backgroundColor: colors.background }]}
//       behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//       keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
//       keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
//     >
//       {/* Header */}
//       <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.text + '22' }]}>
//         <View style={styles.headerLeft}>
//           <View style={styles.avatarContainer}>
//             <CustomAvatar name={friendName} size={40} />
//             <View style={[styles.statusDot, { backgroundColor: isFriendOnline ? '#4CAF50' : '#EF4444' }]} />
//           </View>
//         </View>
//         <View style={styles.headerCenter}>
//           <Text style={[styles.friendName, { color: colors.text }]}>{friendName || t('chat.friend')}</Text>
//           <Text style={[styles.statusText, { color: isFriendOnline ? '#4CAF50' : '#EF4444' }]}>
//             {isFriendOnline ? t('chat.online') : t('chat.offline')}
//           </Text>
//         </View>
//       </View>

//       {error ? (
//         <View style={styles.errorContainer}>
//           <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
//           <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
//         </View>
//       ) : (
//         <>
//           <FlatList
//             ref={flatListRef}
//             style={styles.messageList}
//             data={messages}
//             keyExtractor={(item) => item.id}
//             keyExtractor={(item) => item.id}
//             renderItem={({ item }) => (
//               <ChatBubble
//                 text={item.text}
//                 isMine={item.senderId === myId}
//                 timestamp={item.createdAt}
//               />
//             )}
//             contentContainerStyle={styles.messageListContent}
//             // Removed inverted to fix rendering order
//             onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
//             onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
//             // Removed inverted to fix rendering order
//             onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
//             onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
//           />
//           <View style={[styles.inputRow, { backgroundColor: colors.card, borderTopColor: colors.text + '22' }]}>
//           <View style={[styles.inputRow, { backgroundColor: colors.card, borderTopColor: colors.text + '22' }]}>
//             <TextInput
//               style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
//               style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
//               value={text}
//               onChangeText={setText}
//               placeholder={t('chat.typeMessage')}
//               placeholderTextColor={colors.text + '66'}
//               multiline
//               maxLength={1000}
//             />
//             <Pressable
//               style={[styles.sendBtn, { backgroundColor: text.trim() ? colors.primary : colors.text + '33' }]}
//               style={[styles.sendBtn, { backgroundColor: text.trim() ? colors.primary : colors.text + '33' }]}
//               onPress={onSend}
//               disabled={!text.trim()}
//             >
//               <Ionicons name="send" size={24} color="#fff" />
//             </Pressable>
//           </View>
//         </>
//       )}
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   header: {
//     flexDirection: 'row',
//     //alignItems: 'center',
//    // justifyContent: 'space-around',
//     padding: 16,
//     borderBottomWidth: 1,
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.15,
//     shadowRadius: 4,
//   },
//   headerLeft: { flexDirection: 'row',},
//   headerCenter: {marginLeft:15},
//   headerRight: { flexDirection: 'row', alignItems: 'center',  justifyContent: 'flex-end' },
//   avatarContainer: { position: 'relative' },
//   myName: { fontSize: 16, fontWeight: '600', marginLeft: 8 },
//   friendName: { fontSize: 20, fontWeight: '700' },
//   statusText: { fontSize: 12, marginTop: 4 },
//   statusDot: {
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     position: 'absolute',
//     bottom: 0,
//     right: 0,
//     borderWidth: 2,
//     borderColor: '#fff',
//   },
//   errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   errorText: { fontSize: 16, fontWeight: '600' },
//   messageList: { flex: 1 },
//   messageListContent: { padding: 16, paddingBottom: 20, flexGrow: 1 },
//   emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
//   emptyText: { fontSize: 16, fontWeight: '500', textAlign: 'center' },
//   inputRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 12,
//     borderTopWidth: 1,
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: -2 },
//     shadowOpacity: 0.15,
//     shadowRadius: 4,
//   },
//   input: {
//     flex: 1,
//     borderRadius: 24,
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     fontSize: 16,
//     marginRight: 12,
//     borderWidth: 1,
//     borderColor: '#eee',
//   },
//   sendBtn: {
//     borderRadius: 24,
//     padding: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: 48,
//     height: 48,
//   },
// });

// export default ChatRoomContainer;