// import React, { useEffect, useState, useCallback, useRef } from 'react';
// import {
//   View,
//   FlatList,
//   TextInput,
//   TouchableOpacity,
//   Text,
//   Image,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
//   ActivityIndicator,
// } from 'react-native';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {
//   listenToMessages,
//   sendMessage,
//   sendReplyMessage,
//   getOrCreateChatRoom,
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
// import Icon from 'react-native-vector-icons/Ionicons';
// import PickerBottomSheet from '../../components/PickerBottomSheet';

// const getCacheKey = (roomId: string) => `chat_messages_${roomId}`;

// const ChatRoomContainer = () => {
//   const route = useRoute<any>();
//   const { friendId, friendName } = route.params || {};
//   const nav = useNavigation<any>();
//   const myId = useSelector((s: RootState) => s.auth.user?.uid);
//   const myName = useSelector((s: RootState) => s.auth.user?.displayName || 'Me');

//   const [roomId, setRoomId] = useState<string | null>(null);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [text, setText] = useState('');
//   const [replyingTo, setReplyingTo] = useState<Message | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [sending, setSending] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [visible, setVisible] = useState(false);
//   const [selectedFiles, setSelectedFiles] = useState<any[]>([]);

//   const { colors } = useAppTheme();
//   const { t } = useTranslation();
//   const flatListRef = useRef<FlatList>(null);

//   // ✅ Load cached messages
//   const loadCachedMessages = useCallback(async (roomId: string) => {
//     try {
//       const cacheKey = getCacheKey(roomId);
//       const cached = await AsyncStorage.getItem(cacheKey);
//       if (cached) {
//         const parsed = JSON.parse(cached) as Message[];
//         setMessages(parsed);
//         setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
//         return true;
//       }
//       return false;
//     } catch (err) {
//       console.error('Error loading cache:', err);
//       return false;
//     }
//   }, []);

//   // ✅ Save messages to cache
//   const saveMessagesToCache = useCallback(async (roomId: string, msgs: Message[]) => {
//     try {
//       const cacheKey = getCacheKey(roomId);
//       await AsyncStorage.setItem(cacheKey, JSON.stringify(msgs));
//     } catch (err) {
//       console.error('Error saving cache:', err);
//     }
//   }, []);

//   // ✅ Fetch or create room
//   useEffect(() => {
//     if (!myId || !friendId) {
//       setError('Invalid user or friend ID');
//       return;
//     }
//     const fetchRoom = async () => {
//       try {
//         const chatRoomId = await getOrCreateChatRoom(myId, friendId);
//         setRoomId(chatRoomId);
//         setError(null);
//         const cacheFound = await loadCachedMessages(chatRoomId);
//         if (!cacheFound) setLoading(true);
//       } catch (err) {
//         console.error('Error creating chat room:', err);
//         setError('Failed to load chat.');
//         setLoading(false);
//       }
//     };
//     fetchRoom();
//   }, [myId, friendId, loadCachedMessages]);

//   // ✅ Subscribe to messages
//   useEffect(() => {
//     if (!roomId) return;
//     const unsubscribe = listenToMessages(
//       roomId,
//       msgs => {
//         const processed = msgs.map(m => ({
//           ...m,
//           createdAt: m.createdAt?.toMillis ? m.createdAt.toMillis() : m.createdAt || Date.now(),
//         }));
//         setMessages(processed);
//         saveMessagesToCache(roomId, processed);
//         setError(null);
//         setLoading(false);
//         setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
//       },
//       err => {
//         console.error('Error listening to messages:', err);
//         setError('Network error. Showing cached messages.');
//         setLoading(false);
//       }
//     );
//     return unsubscribe;
//   }, [roomId, saveMessagesToCache]);

//   // ✅ Send message
//   const onSend = useCallback(async () => {
//     if (!text.trim() && selectedFiles.length === 0) return;
//     setSending(true);

//     try {
//       if (selectedFiles.length > 0) {
//         console.log("Sending images:", selectedFiles);
//         // TODO: upload and send image messages via Firebase
//         setSelectedFiles([]);
//       }

//       if (text.trim()) {
//         const messageText = text.trim();
//         setText('');
//         if (replyingTo) {
//           await sendReplyMessage(roomId!, {
//             text: messageText,
//             senderId: myId!,
//             receiverId: friendId,
//             createdAt: Date.now(),
//             replyTo: {
//               messageId: replyingTo.id || '',
//               text: replyingTo.text,
//               senderId: replyingTo.senderId,
//               senderName: replyingTo.senderId === myId ? myName : friendName || 'Friend',
//             },
//           });
//         } else {
//           await sendMessage(roomId!, {
//             text: messageText,
//             senderId: myId!,
//             receiverId: friendId,
//             createdAt: Date.now(),
//           });
//         }
//       }
//     } catch (err) {
//       console.error('Send error:', err);
//       setError('Failed to send message.');
//     } finally {
//       setSending(false);
//       setReplyingTo(null);
//     }
//   }, [text, roomId, myId, myName, replyingTo, friendId, friendName, selectedFiles]);

//   // ✅ Render message bubble
//   const renderMessage = useCallback(
//     ({ item }: { item: Message }) => (
//       <ChatBubble
//         text={item.text}
//         isMine={item.senderId === myId}
//         timestamp={item.createdAt}
//         replyTo={item.replyTo}
//         onLongPress={() => setReplyingTo(item)}
//         currentUserId={myId}
//       />
//     ),
//     [myId]
//   );

//   // ✅ Mark all as read
//   useEffect(() => {
//     if (roomId && myId) markMessagesAsRead(roomId, myId);
//   }, [roomId, myId]);

//   return (
//     <KeyboardAvoidingView
//       style={[styles.container, { backgroundColor: colors.background }]}
//       behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//       keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
//     >
//       {/* Header */}
//       <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.text + '22' }]}>
//         <View style={styles.headerContent}>
//           <TouchableOpacity onPress={() => nav.goBack()}>
//             <Icon name="arrow-back" size={30} color={colors.primary} style={{ marginRight: 7 }} />
//           </TouchableOpacity>
//           <CustomAvatar name={friendName || 'Unknown'} size={40} />
//           <View style={styles.headerTextContainer}>
//             <Text style={[styles.friendName, { color: colors.text }]}>{friendName || t('chat.friend')}</Text>
//             <Text style={[styles.statusText, { color: colors.text, opacity: 0.6 }]}>
//               {t('chat.tapToViewProfile')}
//             </Text>
//           </View>
//         </View>
//       </View>

//       {/* Body */}
//       {error ? (
//         <View style={styles.errorContainer}>
//           <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
//         </View>
//       ) : loading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color={colors.primary} />
//           <Text style={[styles.loadingText, { color: colors.text, opacity: 0.7 }]}>
//             {t('chat.loadingMessages')}
//           </Text>
//         </View>
//       ) : (
//         <>
//           <FlatList
//             ref={flatListRef}
//             data={messages}
//             keyExtractor={item => item.id || Math.random().toString()}
//             renderItem={renderMessage}
//             contentContainerStyle={styles.messageListContent}
//             showsVerticalScrollIndicator={false}
//             onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
//             onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
//             ListEmptyComponent={
//               <View style={styles.emptyContainer}>
//                 <Text style={[styles.emptyText, { color: colors.text, opacity: 0.7 }]}>
//                   {t('chat.noMessages')}
//                 </Text>
//               </View>
//             }
//           />

//           {/* Reply bar */}
//           {replyingTo && (
//             <ReplyMessageBar
//               replyMessage={{
//                 id: replyingTo.id || '',
//                 text: replyingTo.text,
//                 senderId: replyingTo.senderId,
//                 senderName: replyingTo.senderId === myId ? myName : friendName || 'Friend',
//               }}
//               onCancel={() => setReplyingTo(null)}
//               currentUserId={myId}
//             />
//           )}

//           {/* Input area */}
//           <View style={[styles.inputRow, { borderTopColor: colors.text + '22' }]}>
//             <TouchableOpacity onPress={() => setVisible(true)}>
//               <Icon name="add-circle-outline" size={30} color={colors.primary} style={{ marginRight: 5 }} />
//             </TouchableOpacity>

//          {selectedFiles.length > 0 ? (
//   <View style={styles.previewRow}>
//     {selectedFiles.slice(0, 4).map((file, idx) => (
//       <View key={idx} style={styles.previewWrapper}>
//         <Image source={{ uri: file.uri }} style={styles.previewImg} />
//         <TouchableOpacity
//           style={styles.removeIcon}
//           onPress={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))}
//         >
//           <Icon name="close-circle" size={20} color="#f00" />
//         </TouchableOpacity>
//       </View>
//     ))}

//     {selectedFiles.length > 4 && (
//       <View style={[styles.previewWrapper, styles.moreWrapper]}>
//         <Text style={styles.moreText}>+{selectedFiles.length - 4}</Text>
//       </View>
//     )}
//   </View>
//             ) : (
//               <TextInput
//                 style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
//                 value={text}
//                 onChangeText={setText}
//                 placeholder={t('chat.typeMessage')}
//                 placeholderTextColor="#999"
//                 multiline
//                 maxLength={1000}
//               />
//             )}

//             <TouchableOpacity
//               style={[
//                 styles.sendBtn,
//                 { backgroundColor: (text.trim() || selectedFiles.length > 0) ? colors.primary : colors.text + '33' },
//               ]}
//               onPress={onSend}
//               disabled={(!text.trim() && selectedFiles.length === 0) || sending}
//             >
//               {sending ? (
//                 <ActivityIndicator size="small" color="#fff" />
//               ) : (
//                 <Icon name="send" size={20} color="#fff" />
//               )}
//             </TouchableOpacity>
//           </View>

//           <PickerBottomSheet
//             visible={visible}
//             onClose={() => setVisible(false)}
//             onResult={(res) => setSelectedFiles([...selectedFiles, res])}
//           />
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
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   moreWrapper: {
//   width: 60,
//   height: 60,
//   borderRadius: 8,
//   backgroundColor: "#666",
//   justifyContent: "center",
//   alignItems: "center",
// },
// moreText: {
//   color: "#fff",
//   fontWeight: "bold",
//   fontSize: 16,
// },

//   headerContent: { flexDirection: 'row', alignItems: 'center' },
//   headerTextContainer: { marginLeft: 12, flex: 1 },
//   friendName: { fontSize: 18, fontWeight: '700' },
//   statusText: { fontSize: 12, marginTop: 2 },
//   errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   errorText: { fontWeight: '600' },
//   loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
//   loadingText: { marginTop: 12, fontSize: 16, fontWeight: '500' },
//   messageListContent: { padding: 12, flexGrow: 1 },
//   emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   emptyText: { fontSize: 16, fontWeight: '500' },

//   inputRow: { flexDirection: 'row', alignItems: 'center', padding: 8, borderTopWidth: 1, minHeight: 75 },
//   input: { flex: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8 , height:'100%'},
//   sendBtn: { borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16 },

//   previewRow: { flexDirection: 'row', flexWrap: 'wrap', flex: 1 },
//   previewWrapper: { position: 'relative', marginRight: 8, marginBottom: 8 },
//   previewImg: { width: 60, height: 60, borderRadius: 8 },
//   removeIcon: { position: 'absolute', top: -6, right: -6, backgroundColor: '#fff', borderRadius: 10 },
// });

// export default ChatRoomContainer;




import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  listenToMessages,
  sendMessage,
  sendReplyMessage,
  getOrCreateChatRoom,
  markMessagesAsRead,
  Message,
} from '../../services/firebase/chat';
import ChatBubble from '../../components/ChatBubble';
import CustomAvatar from '../../components/CustomAvatar';
import ReplyMessageBar from '../../components/ReplyMessageBar';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useAppTheme } from '../../themes/useTheme';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import PickerBottomSheet from '../../components/PickerBottomSheet';

const getCacheKey = (roomId: string) => `chat_messages_${roomId}`;

const ChatRoomContainer = () => {
  const route = useRoute<any>();
  const { friendId, friendName } = route.params || {};
  const nav = useNavigation<any>();
  const myId = useSelector((s: RootState) => s.auth.user?.uid);
  const myName = useSelector((s: RootState) => s.auth.user?.displayName || 'Me');

  const [roomId, setRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [micOff, setMicOff] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);

  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const flatListRef = useRef<FlatList>(null);

  // ✅ Load cached messages
  const loadCachedMessages = useCallback(async (roomId: string) => {
    try {
      const cacheKey = getCacheKey(roomId);
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as Message[];
        setMessages(parsed);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error loading cache:', err);
      return false;
    }
  }, []);

  // ✅ Save messages to cache
  const saveMessagesToCache = useCallback(async (roomId: string, msgs: Message[]) => {
    try {
      const cacheKey = getCacheKey(roomId);
      await AsyncStorage.setItem(cacheKey, JSON.stringify(msgs));
    } catch (err) {
      console.error('Error saving cache:', err);
    }
  }, []);

  // ✅ Fetch or create room
  useEffect(() => {
    if (!myId || !friendId) {
      setError('Invalid user or friend ID');
      return;
    }
    const fetchRoom = async () => {
      try {
        const chatRoomId = await getOrCreateChatRoom(myId, friendId);
        setRoomId(chatRoomId);
        setError(null);
        const cacheFound = await loadCachedMessages(chatRoomId);
        if (!cacheFound) setLoading(true);
      } catch (err) {
        console.error('Error creating chat room:', err);
        setError('Failed to load chat.');

      }
    };
    fetchRoom();
  }, [myId, friendId, loadCachedMessages]);

  // ✅ Subscribe to messages
  useEffect(() => {
    if (!roomId) return;
    const unsubscribe = listenToMessages(
      roomId,
      msgs => {
        const processed = msgs.map(m => ({
          ...m,
          createdAt: m.createdAt?.toMillis ? m.createdAt.toMillis() : m.createdAt || Date.now(),
        }));
        setMessages(processed);
        saveMessagesToCache(roomId, processed);
        setError(null);
        setLoading(false);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      },
      err => {
        console.error('Error listening to messages:', err);
        setError('Network error. Showing cached messages.');
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [roomId, saveMessagesToCache]);

  // ✅ Send message or media
  const onSend = useCallback(async () => {
    if (!text.trim() && selectedFiles.length === 0) return;
     setSending(true);
    try {
      // Send media files
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          await sendMessage(roomId!, {
            text: '',
            media: [{ uri: file.uri, type: file.type || 'image' }],
            senderId: myId!,
            receiverId: friendId,
            createdAt: Date.now(),
          });
        }
        setSelectedFiles([]);
      }

      // Send text
      if (text.trim()) {
        const messageText = text.trim();
        setText('');
        if (replyingTo) {
          await sendReplyMessage(roomId!, {
            text: messageText,
            senderId: myId!,
            receiverId: friendId,
            createdAt: Date.now(),
            replyTo: {
              messageId: replyingTo.id || '',
              text: replyingTo.text,
              senderId: replyingTo.senderId,
              senderName: replyingTo.senderId === myId ? myName : friendName || 'Friend',
            },
          });
        } else {
          await sendMessage(roomId!, {
            text: messageText,
            senderId: myId!,
            receiverId: friendId,
            createdAt: Date.now(),
          });
        }
      }
    } catch (err) {
      console.error('Send error:', err);
      setError('Failed to send message.');
    } finally {
      setSending(false);
      setReplyingTo(null);
    }
  }, [text, roomId, myId, myName, replyingTo, friendId, friendName, selectedFiles]);

  // ✅ Render message bubble
  const renderMessage = useCallback(
    ({ item }: { item: Message }) => (
      <ChatBubble
        text={item.text}
        media={item.media}
        isMine={item.senderId === myId}
        timestamp={item.createdAt}
        replyTo={item.replyTo}
        onLongPress={() => setReplyingTo(item)}
        currentUserId={myId}
      />
    ),
    [myId]
  );

  // ✅ Mark all as read
  useEffect(() => {
    if (roomId && myId) markMessagesAsRead(roomId, myId);
  }, [roomId, myId]);


  useEffect(()=>{
    setMicOff(true)
  }, [text])

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.text + '22' }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => nav.goBack()}>
            <Icon name="arrow-back" size={30} color={colors.primary} style={{ marginRight: 7 }} />
          </TouchableOpacity>
          <CustomAvatar name={friendName || 'Unknown'} size={40} />
          <View style={styles.headerTextContainer}>
            <Text style={[styles.friendName, { color: colors.text }]}>{friendName || t('chat.friend')}</Text>
            <Text style={[styles.statusText, { color: colors.text, opacity: 0.6 }]}>
              {t('chat.tapToViewProfile')}
            </Text>
          </View>
        </View>
      </View>

      {/* Body */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
        </View>
      ) : loading ? (
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
            data={messages}
            keyExtractor={item => item.id || Math.random().toString()}
            renderItem={renderMessage}
            contentContainerStyle={styles.messageListContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.text, opacity: 0.7 }]}>
                  {t('chat.noMessages')}
                </Text>
              </View>
            }
          />

          {/* Reply bar */}
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

          {/* Input area */}
          <View style={[styles.inputRow, { borderTopColor: colors.text + '22' }]}>
            <TouchableOpacity onPress={() => setVisible(true)}>
              <Icon name="add-circle-outline" size={30} color={colors.primary} style={{ marginRight: 5 }} />
            </TouchableOpacity>

            {selectedFiles.length > 0 ? (
              <View style={styles.previewRow}>
                {selectedFiles.slice(0, 4).map((file, idx) => (
                  <View key={idx} style={styles.previewWrapper}>
                    <Image source={{ uri: file.uri }} style={styles.previewImg} />
                    <TouchableOpacity
                      style={styles.removeIcon}
                      onPress={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))}
                    >
                      <Icon name="close-circle" size={20} color="#f00" />
                    </TouchableOpacity>
                  </View>
                ))}

                {selectedFiles.length > 4 && (
                  <View style={[styles.previewWrapper, styles.moreWrapper]}>
                    <Text style={styles.moreText}>+{selectedFiles.length - 4}</Text>
                  </View>
                )}
              </View>
            ) : (
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                value={text}
                onChangeText={setText}
                placeholder={t('chat.typeMessage')}
                placeholderTextColor="#999"
                multiline
                maxLength={1000}
              />
            )}

            <TouchableOpacity
              style={[
                styles.sendBtn,
                { backgroundColor: (text.trim() || selectedFiles.length > 0) ? colors.primary : colors.text + '33' },
              ]}
              onPress={onSend}
              disabled={(!text.trim() && selectedFiles.length === 0) || sending}
            >
              {micOff == true ? (
                <Icon name="send" size={25} color={colors.primary} />
              ) : (
                <Icon name="send" size={25} color={colors.primary} />
              )}
            </TouchableOpacity>
          </View>

          <PickerBottomSheet
            visible={visible}
            onClose={() => setVisible(false)}
            onResult={(res) => setSelectedFiles([...selectedFiles, ...res])} 
          />
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  headerTextContainer: { marginLeft: 12, flex: 1 },
  friendName: { fontSize: 18, fontWeight: '700' },
  statusText: { fontSize: 12, marginTop: 2 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 12, fontSize: 16, fontWeight: '500' },
  messageListContent: { padding: 12, flexGrow: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, fontWeight: '500' },

  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 8, borderTopWidth: 1, minHeight: 75 },
  input: { flex: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, height: '100%' },
  sendBtn: { borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16 },

  previewRow: { flexDirection: 'row', flexWrap: 'wrap', flex: 1 },
  previewWrapper: { position: 'relative', marginRight: 8, marginBottom: 8 },
  previewImg: { width: 60, height: 60, borderRadius: 8 },
  removeIcon: { position: 'absolute', top: -6, right: -6, backgroundColor: '#fff', borderRadius: 10 },

  moreWrapper: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#666",
    justifyContent: "center",
    alignItems: "center",
  },
  moreText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ChatRoomContainer;
