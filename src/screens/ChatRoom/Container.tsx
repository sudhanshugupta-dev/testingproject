// import React, { useEffect, useState, useCallback, useRef } from "react";
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
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import {
//   listenToMessages,
//   sendMessage,
//   sendReplyMessage,
//   getOrCreateChatRoom,
//   markMessagesAsRead,
//   Message,
// } from "../../services/firebase/chat";
// import ChatBubble from "../../components/ChatBubble";
// import CustomAvatar from "../../components/CustomAvatar";
// import ReplyMessageBar from "../../components/ReplyMessageBar";
// import { useSelector } from "react-redux";
// import { RootState } from "../../redux/store";
// import { useAppTheme } from "../../themes/useTheme";
// import { useTranslation } from "react-i18next";
// import Icon from "react-native-vector-icons/Ionicons";
// import PickerBottomSheet from "../../components/PickerBottomSheet";
// import { uploadMultipleToCloudinary } from "../../services/firebase/cloudinaryService";


// const getCacheKey = (roomId: string) => `chat_messages_${roomId}`;

// const ChatRoomContainer = () => {
//   const route = useRoute<any>();
//   const { friendId, friendName } = route.params || {};
//   const nav = useNavigation<any>();
//   const myId = useSelector((s: RootState) => s.auth.user?.uid);
//   const myName = useSelector(
//     (s: RootState) => s.auth.user?.displayName || "Me"
//   );

//   const [roomId, setRoomId] = useState<string | null>(null);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [text, setText] = useState("");
//   const [replyingTo, setReplyingTo] = useState<Message | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [sending, setSending] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [visible, setVisible] = useState(false);
//   const [selectedFiles, setSelectedFiles] = useState<any[]>([]);

//   const { colors } = useAppTheme();
//   const { t } = useTranslation();
//   const flatListRef = useRef<FlatList>(null);

//   // ✅ Format date for separator
//   const formatDateSeparator = (timestamp: number) => {
//     const msgDate = new Date(timestamp);
//     const today = new Date();
//     const yesterday = new Date();
//     yesterday.setDate(today.getDate() - 1);

//     const isToday = msgDate.toDateString() === today.toDateString();
//     const isYesterday = msgDate.toDateString() === yesterday.toDateString();

//     if (isToday) return "Today";
//     if (isYesterday) return "Yesterday";
//     return msgDate.toLocaleDateString();
//   };

//   // ✅ Add separators to messages
//   const getMessagesWithSeparators = (msgs: Message[]) => {
//     const result: any[] = [];
//     let lastDate: string | null = null;

//     msgs.forEach((msg) => {
//       const dateLabel = formatDateSeparator(msg.createdAt);

//       if (dateLabel !== lastDate) {
//         result.push({ id: `sep-${dateLabel}`, type: "separator", label: dateLabel });
//         lastDate = dateLabel;
//       }
//       result.push({ ...msg, type: "message" });
//     });

//     return result;
//   };

//   // ✅ Load cached messages
//   const loadCachedMessages = useCallback(async (roomId: string) => {
//     try {
//       const cacheKey = getCacheKey(roomId);
//       const cached = await AsyncStorage.getItem(cacheKey);
//       if (cached) {
//         const parsed = JSON.parse(cached) as Message[];
//         setMessages(parsed);
//         setTimeout(
//           () => flatListRef.current?.scrollToEnd({ animated: true }),
//           100
//         );
//         return true;
//       }
//       return false;
//     } catch {
//       return false;
//     }
//   }, []);

//   // ✅ Save messages to cache
//   const saveMessagesToCache = useCallback(
//     async (roomId: string, msgs: Message[]) => {
//       try {
//         const cacheKey = getCacheKey(roomId);
//         await AsyncStorage.setItem(cacheKey, JSON.stringify(msgs));
//       } catch {}
//     },
//     []
//   );

//   // ✅ Fetch or create room
//   useEffect(() => {
//     if (!myId || !friendId) {
//       setError("Invalid user or friend ID");
//       return;
//     }
//     const fetchRoom = async () => {
//       try {
//         const chatRoomId = await getOrCreateChatRoom(myId, friendId);
//         setRoomId(chatRoomId);
//         setError(null);
//         const cacheFound = await loadCachedMessages(chatRoomId);
//         if (!cacheFound) setLoading(true);
//       } catch {
//         setError("Failed to load chat.");
//       }
//     };
//     fetchRoom();
//   }, [myId, friendId, loadCachedMessages]);

//   // ✅ Subscribe to messages
//   useEffect(() => {
//     if (!roomId) return;
//     const unsubscribe = listenToMessages(
//       roomId,
//       (msgs) => {
//         const processed = msgs.map((m) => ({
//           ...m,
//           createdAt: m.createdAt?.toMillis
//             ? m.createdAt.toMillis()
//             : m.createdAt || Date.now(),
//         }));
//         setMessages(processed);
//         saveMessagesToCache(roomId, processed);
//         setError(null);
//         setLoading(false);
//         setTimeout(
//           () => flatListRef.current?.scrollToEnd({ animated: true }),
//           100
//         );
//       },
//       () => {
//         setError("Network error. Showing cached messages.");
//         setLoading(false);
//       }
//     );
//     return unsubscribe;
//   }, [roomId, saveMessagesToCache]);

//   // ✅ Send message
//   const onSend = useCallback(async () => {
//     if (!text.trim() && selectedFiles.length === 0) return;

//     const tempId = `temp-${Date.now()}`;
//     const pendingMessage: Message = {
//       id: tempId,
//       text,
//       senderId: myId,
//       receiverId: friendId,
//       createdAt: Date.now(),
//       media: selectedFiles.map((f, i) => ({
//         uri: f.uri,
//         type: f.type,
//         name: f.name || `file_${i}`,
//       })),
//       status: "sending",
//       replyTo: replyingTo
//         ? {
//             messageId: replyingTo.id || "",
//             text: replyingTo.text,
//             senderId: replyingTo.senderId,
//             senderName:
//               replyingTo.senderId === myId ? myName : friendName || "Friend",
//           }
//         : undefined,
//     };

//     setMessages((prev) => [pendingMessage, ...prev]);
//     setText("");
//     setSelectedFiles([]);
//     setSending(true);

//     try {
//       let uploadedUrls: string[] = [];

//       if (selectedFiles.length > 0) {
//         const files = selectedFiles.map((file) => ({
//           uri: file.uri,
//           type: file.type,
//           fileName: file.fileName || `file_${Date.now()}`,
//         }));

//         uploadedUrls = await uploadMultipleToCloudinary(files);

//         await sendMessage(roomId!, {
//           text: text.trim(),
//           media: uploadedUrls.map((url, i) => ({
//             uri: url,
//             type: files[i].type,
//           })),
//           senderId: myId!,
//           receiverId: friendId,
//           createdAt: Date.now(),
//           ...(replyingTo && {
//             replyTo: {
//               messageId: replyingTo.id || "",
//               text: replyingTo.text,
//               senderId: replyingTo.senderId,
//               senderName:
//                 replyingTo.senderId === myId ? myName : friendName || "Friend",
//             },
//           }),
//         });
//       } else if (text.trim()) {
//         if (replyingTo) {
//           await sendReplyMessage(roomId!, {
//             text: text.trim(),
//             senderId: myId!,
//             receiverId: friendId,
//             createdAt: Date.now(),
//             replyTo: {
//               messageId: replyingTo.id || "",
//               text: replyingTo.text,
//               senderId: replyingTo.senderId,
//               senderName:
//                 replyingTo.senderId === myId ? myName : friendName || "Friend",
//             },
//           });
//         } else {
//           await sendMessage(roomId!, {
//             text: text.trim(),
//             senderId: myId!,
//             receiverId: friendId,
//             createdAt: Date.now(),
//           });
//         }
//       }
//     } catch {
//       setError("Failed to send message.");
//     } finally {
//       setSending(false);
//       setReplyingTo(null);
//     }
//   }, [text, selectedFiles, roomId, myId, myName, replyingTo, friendId, friendName]);

//   // ✅ Render item (message or separator)
//   const renderMessage = useCallback(
//     ({ item }: { item: any }) => {
//       if (item.type === "separator") {
//         return (
//           <View style={styles.separatorContainer}>
//             <Text style={styles.separatorText}>{item.label}</Text>
//           </View>
//         );
//       }
//       return (
//         <ChatBubble
//           text={item.text}
//           media={item.media}
//           isMine={item.senderId === myId}
//           timestamp={item.createdAt}
//           replyTo={item.replyTo}
//           onLongPress={() => setReplyingTo(item)}
//           currentUserId={myId}
//         />
//       );
//     },
//     [myId]
//   );

//   // ✅ Mark all as read
//   useEffect(() => {
//     if (roomId && myId) markMessagesAsRead(roomId, myId);
//   }, [roomId, myId]);

//   const showSend = text.trim().length > 0 || selectedFiles.length > 0;

//   return (
//     <KeyboardAvoidingView
//       style={[styles.container, { backgroundColor: colors.background }]}
//       behavior={Platform.OS === "ios" ? "padding" : undefined}
//       keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
//     >
//       {/* Header */}
//       <TouchableOpacity
//         style={[
//           styles.header,
//           {
//             backgroundColor: colors.card,
//             borderBottomColor: colors.text + "22",
//           },
//         ]}
//         //  onPress={() =>
//         //   nav.navigate('UserProfile', { name: friendName, hideLabels: true})
//         // }
//       >
//         <View style={styles.headerContent}>
//           <TouchableOpacity onPress={() => nav.goBack()}>
//             <Icon
//               name="arrow-back"
//               size={30}
//               color={colors.primary}
//               style={{ marginRight: 7 }}
//             />
//           </TouchableOpacity>
//           <CustomAvatar name={friendName || "Unknown"} size={40} />
//           <View style={styles.headerTextContainer}>
//             <Text style={[styles.friendName, { color: colors.text }]}>
//               {friendName || t("chat.friend")}
//             </Text>
//             <Text
//               style={[
//                 styles.statusText,
//                 { color: colors.text, opacity: 0.6 },
//               ]}
//             >
//               {t("chat.tapToViewProfile")}
//             </Text>
//           </View>
//         </View>
//       </TouchableOpacity>

//       {/* Body */}
//       {error ? (
//         <View style={styles.errorContainer}>
//           <Text style={[styles.errorText, { color: colors.text }]}>
//             {error}
//           </Text>
//         </View>
//       ) : loading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color={colors.primary} />
//           <Text
//             style={[
//               styles.loadingText,
//               { color: colors.text, opacity: 0.7 },
//             ]}
//           >
//             {t("chat.loadingMessages")}
//           </Text>
//         </View>
//       ) : (
//         <>
//           <FlatList
//             ref={flatListRef}
//             data={getMessagesWithSeparators(messages)}
//             keyExtractor={(item) => item.id || Math.random().toString()}
//             renderItem={renderMessage}
//             contentContainerStyle={styles.messageListContent}
//             showsVerticalScrollIndicator={false}
//             onContentSizeChange={() =>
//               flatListRef.current?.scrollToEnd({ animated: true })
//             }
//             onLayout={() =>
//               flatListRef.current?.scrollToEnd({ animated: true })
//             }
//             ListEmptyComponent={
//               <View style={styles.emptyContainer}>
//                 <Text
//                   style={[
//                     styles.emptyText,
//                     { color: colors.text, opacity: 0.7 },
//                   ]}
//                 >
//                   {t("chat.noMessages")}
//                 </Text>
//               </View>
//             }
//           />

//           {/* Reply bar */}
//           {replyingTo && (
//             <ReplyMessageBar
//               replyMessage={{
//                 id: replyingTo.id || "",
//                 text: replyingTo.text,
//                 senderId: replyingTo.senderId,
//                 senderName:
//                   replyingTo.senderId === myId
//                     ? myName
//                     : friendName || "Friend",
//               }}
//               onCancel={() => setReplyingTo(null)}
//               currentUserId={myId}
//             />
//           )}

//           {/* Input area */}
//           <View
//             style={[
//               styles.inputRow,
//               { borderTopColor: colors.text + "22" },
//             ]}
//           >
//             <TouchableOpacity onPress={() => setVisible(true)}>
//               <Icon
//                 name="add-circle-outline"
//                 size={30}
//                 color={colors.primary}
//                 style={{ marginRight: 5 }}
//               />
//             </TouchableOpacity>

//             {selectedFiles.length > 0 ? (
//               <View style={styles.previewRow}>
//                 {selectedFiles.slice(0, 4).map((file, idx) => (
//                   <View key={idx} style={styles.previewWrapper}>
//                     <Image
//                       source={{ uri: file.uri }}
//                       style={styles.previewImg}
//                     />
//                     <TouchableOpacity
//                       style={styles.removeIcon}
//                       onPress={() =>
//                         setSelectedFiles(
//                           selectedFiles.filter((_, i) => i !== idx)
//                         )
//                       }
//                     >
//                       <Icon name="close-circle" size={20} color="#f00" />
//                     </TouchableOpacity>
//                   </View>
//                 ))}

//                 {selectedFiles.length > 4 && (
//                   <View
//                     style={[styles.previewWrapper, styles.moreWrapper]}
//                   >
//                     <Text style={styles.moreText}>
//                       +{selectedFiles.length - 4}
//                     </Text>
//                   </View>
//                 )}
//               </View>
//             ) : (
//               <TextInput
//                 style={[
//                   styles.input,
//                   { backgroundColor: colors.card, color: colors.text },
//                 ]}
//                 value={text}
//                 onChangeText={setText}
//                 placeholder={t("chat.typeMessage")}
//                 placeholderTextColor="#999"
//                 multiline
//                 maxLength={1000}
//               />
//             )}

//             {showSend ? (
//               <TouchableOpacity
//                 style={[
//                   styles.sendBtn,
//                   {
//                     backgroundColor: colors.primary,
//                   },
//                 ]}
//                 onPress={onSend}
//                 disabled={sending}
//               >
//                 <Icon name="send" size={25} color="#fff" />
//               </TouchableOpacity>
//             ) : (
//               <TouchableOpacity
//                 style={[
//                   styles.sendBtn,
//                   { backgroundColor: colors.text + "33" },
//                 ]}
//               >
//                 <Icon name="mic" size={25} color={colors.primary} />
//               </TouchableOpacity>
//             )}
//           </View>

//           <PickerBottomSheet
//             visible={visible}
//             onClose={() => setVisible(false)}
//             onResult={(res) =>
//               setSelectedFiles([...selectedFiles, ...res])
//             }
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
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   headerContent: { flexDirection: "row", alignItems: "center" },
//   headerTextContainer: { marginLeft: 12, flex: 1 },
//   friendName: { fontSize: 18, fontWeight: "700" },
//   statusText: { fontSize: 12, marginTop: 2 },
//   errorContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
//   errorText: { fontWeight: "600" },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   loadingText: { marginTop: 12, fontSize: 16, fontWeight: "500" },
//   messageListContent: { padding: 12, flexGrow: 1 },
//   emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
//   emptyText: { fontSize: 16, fontWeight: "500" },

//   separatorContainer: {
//     alignItems: "center",
//     marginVertical: 10,
//   },
//   separatorText: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: "#888",
//     backgroundColor: '#fff',
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },

//   inputRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 8,
//     borderTopWidth: 1,
//     minHeight: 75,
//   },
//   input: {
//     flex: 1,
//     borderRadius: 12,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     marginRight: 8,
//     height: "100%",
//   },
//   sendBtn: { borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16 },

//   previewRow: { flexDirection: "row", flexWrap: "wrap", flex: 1 },
//   previewWrapper: { position: "relative", marginRight: 8, marginBottom: 8 },
//   previewImg: { width: 60, height: 60, borderRadius: 8 },
//   removeIcon: {
//     position: "absolute",
//     top: -6,
//     right: -6,
//     backgroundColor: "#fff",
//     borderRadius: 10,
//   },

//   moreWrapper: {
//     width: 60,
//     height: 60,
//     borderRadius: 8,
//     backgroundColor: "#666",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   moreText: {
//     color: "#fff",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
// });

// export default ChatRoomContainer;


// ChatRoomContainer.tsx
import React, { useEffect, useState, useCallback, useRef, memo } from "react";
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
  Modal,
  Animated,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  listenToMessages,
  sendMessage,
  sendReplyMessage,
  getOrCreateChatRoom,
  markMessagesAsRead,
  Message,
} from "../../services/firebase/chat";
import ChatBubble from "../../components/ChatBubble";
import CustomAvatar from "../../components/CustomAvatar";
import ReplyMessageBar from "../../components/ReplyMessageBar";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useAppTheme } from "../../themes/useTheme";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/Ionicons";
import PickerBottomSheet from "../../components/PickerBottomSheet";
import { uploadMultipleToCloudinary } from "../../services/firebase/cloudinaryService";
import {
  GestureHandlerRootView,
  Swipeable,
} from "react-native-gesture-handler";

const ACTION_WIDTH = 96;
const getCacheKey = (roomId: string) => `chat_messages_${roomId}`;

// Animated left action for swipe-to-reply
const LeftAction = memo(function LeftAction({
  progress,
}: {
  progress: Animated.AnimatedInterpolation<number>;
}) {
  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
    extrapolate: "clamp",
  });
  const opacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
    extrapolate: "clamp",
  });

  return (
    <View style={[styles.leftAction, { width: ACTION_WIDTH }]}>
      <Animated.View
        style={{ alignItems: "center", transform: [{ scale }], opacity }}
      >
        <Icon name="return-up-back" size={22} color="#fff" />
        <Text style={styles.leftActionLabel}>Reply</Text>
      </Animated.View>
    </View>
  );
});

const ChatRoomContainer = () => {
  const route = useRoute<any>();
  const { friendId, friendName } = route.params || {};
  const nav = useNavigation<any>();
  const myId = useSelector((s: RootState) => s.auth.user?.uid);
  const myName = useSelector(
    (s: RootState) => s.auth.user?.displayName || "Me"
  );

  const [roomId, setRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const flatListRef = useRef<FlatList>(null);

  // Track the currently open Swipeable
  const openRowRef = useRef<Swipeable | null>(null);

  /** Format date for separators */
  const formatDateSeparator = (timestamp: number) => {
    const msgDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (msgDate.toDateString() === today.toDateString()) return "Today";
    if (msgDate.toDateString() === yesterday.toDateString()) return "Yesterday";
    return msgDate.toLocaleDateString();
  };

  const getMessagesWithSeparators = (msgs: Message[]) => {
    const result: any[] = [];
    let lastDate: string | null = null;
    msgs.forEach((msg) => {
      const dateLabel = formatDateSeparator(
        msg.createdAt?.toString ? Number(msg.createdAt) : (msg.createdAt as number)
      );
      if (dateLabel !== lastDate) {
        result.push({ id: `sep-${dateLabel}`, type: "separator", label: dateLabel });
        lastDate = dateLabel;
      }
      result.push({ ...msg, type: "message" });
    });
    return result;
  };

  /** Cache load + save */
  const loadCachedMessages = useCallback(async (rid: string) => {
    try {
      const cached = await AsyncStorage.getItem(getCacheKey(rid));
      if (cached) {
        const parsed = JSON.parse(cached) as Message[];
        setMessages(parsed);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);
  const saveMessagesToCache = useCallback(async (rid: string, msgs: Message[]) => {
    try {
      await AsyncStorage.setItem(getCacheKey(rid), JSON.stringify(msgs));
    } catch {}
  }, []);

  /** Create / fetch room */
  useEffect(() => {
    if (!myId || !friendId) {
      setError("Invalid user or friend ID");
      return;
    }
    (async () => {
      try {
        const chatRoomId = await getOrCreateChatRoom(myId, friendId);
        setRoomId(chatRoomId);
        const cacheFound = await loadCachedMessages(chatRoomId);
        if (!cacheFound) setLoading(true);
      } catch {
        setError("Failed to load chat.");
      }
    })();
  }, [myId, friendId, loadCachedMessages]);

  /** Subscribe to messages */
  useEffect(() => {
    if (!roomId) return;
    const unsubscribe = listenToMessages(
      roomId,
      (msgs) => {
        const processed = msgs.map((m) => ({
          ...m,
          createdAt: m.createdAt?.toMillis ? m.createdAt.toMillis() : m.createdAt || Date.now(),
        }));
        setMessages(processed);
        saveMessagesToCache(roomId, processed);
        setError(null);
        setLoading(false);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      },
      () => {
        setError("Network error. Showing cached messages.");
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [roomId, saveMessagesToCache]);

  /** Send message / reply */
  const onSend = useCallback(async () => {
    if (!text.trim() && selectedFiles.length === 0) return;

    setSending(true);
    try {
      let uploadedUrls: string[] = [];

      if (selectedFiles.length > 0) {
        const files = selectedFiles.map((file) => ({
          uri: file.uri,
          type: file.type,
          fileName: file.fileName || `file_${Date.now()}`,
        }));
        uploadedUrls = await uploadMultipleToCloudinary(files);
      }

      const payload: any = {
        text: text.trim(),
        senderId: myId!,
        receiverId: friendId,
        createdAt: Date.now(),
        ...(uploadedUrls.length > 0 && {
          media: uploadedUrls.map((url, i) => ({ uri: url, type: selectedFiles[i].type })),
        }),
        ...(replyingTo && {
          replyTo: {
            messageId: replyingTo.id || "",
            text: replyingTo.text,
            senderId: replyingTo.senderId,
            senderName: replyingTo.senderId === myId ? myName : friendName || "Friend",
          },
        }),
      };

      if (replyingTo) {
        await sendReplyMessage(roomId!, payload);
      } else {
        await sendMessage(roomId!, payload);
      }
    } catch {
      setError("Failed to send message.");
    } finally {
      setText("");
      setSelectedFiles([]);
      setReplyingTo(null);
      setSending(false);
    }
  }, [text, selectedFiles, replyingTo, myId, myName, friendId, friendName, roomId]);

  /** Long press modal */
  const handleLongPress = (msg: Message) => {
    setSelectedMessage(msg);
    setModalVisible(true);
  };

  /** Render each message row */
  const renderMessage = useCallback(
    ({ item }: { item: any }) => {
      if (item.type === "separator") {
        return (
          <View style={styles.separatorContainer}>
            <Text style={styles.separatorText}>{item.label}</Text>
          </View>
        );
      }

      let rowRef: Swipeable | null = null;

      return (
        <Swipeable
          ref={(ref) => (rowRef = ref)}
          friction={2}
          leftThreshold={ACTION_WIDTH * 0.6}
          overshootLeft={false}
          renderLeftActions={(progress) => <LeftAction progress={progress} />}
          onSwipeableWillOpen={() => {
            if (openRowRef.current && openRowRef.current !== rowRef) {
              openRowRef.current.close();
            }
            openRowRef.current = rowRef;
            setReplyingTo(item);
            // auto-close swipe row
            setTimeout(() => rowRef?.close(), 300);
          }}
          onSwipeableClose={() => {
            if (openRowRef.current === rowRef) openRowRef.current = null;
          }}
        >
          <ChatBubble
            text={item.text}
            media={item.media}
            isMine={item.senderId === myId}
            timestamp={item.createdAt}
            replyTo={item.replyTo}
            onLongPress={() => handleLongPress(item)}
            currentUserId={myId}
          />
        </Swipeable>
      );
    },
    [myId]
  );

  /** Mark all as read */
  useEffect(() => {
    if (roomId && myId) markMessagesAsRead(roomId, myId);
  }, [roomId, myId]);

  const showSend = text.trim().length > 0 || selectedFiles.length > 0;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            { backgroundColor: colors.card, borderBottomColor: colors.text + "22" },
          ]}
        >
          <TouchableOpacity onPress={() => nav.goBack()}>
            <Icon name="arrow-back" size={30} color={colors.primary} />
          </TouchableOpacity>
          <CustomAvatar name={friendName || "Unknown"} size={40} />
          <View style={styles.headerTextContainer}>
            <Text style={[styles.friendName, { color: colors.text }]}>
              {friendName || t("chat.friend")}
            </Text>
            <Text style={[styles.statusText, { color: colors.text, opacity: 0.6 }]}>
              {t("chat.tapToViewProfile")}
            </Text>
          </View>
        </View>

        {/* Messages */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
          </View>
        ) : loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            <FlatList
              ref={flatListRef}
              data={getMessagesWithSeparators(messages)}
              keyExtractor={(item) => item.id || `${item.senderId}-${item.createdAt}`}
              renderItem={renderMessage}
              contentContainerStyle={styles.messageListContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            {/* Reply bar */}
            {replyingTo && (
              <ReplyMessageBar
                replyMessage={{
                  id: replyingTo.id || "",
                  text: replyingTo.text,
                  senderId: replyingTo.senderId,
                  senderName: replyingTo.senderId === myId ? myName : friendName || "Friend",
                }}
                onCancel={() => setReplyingTo(null)}
                currentUserId={myId}
              />
            )}

            {/* Input */}
            <View style={[styles.inputRow, { borderTopColor: colors.text + "22" }]}>
              <TouchableOpacity onPress={() => setVisible(true)}>
                <Icon name="add-circle-outline" size={30} color={colors.primary} />
              </TouchableOpacity>

              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                value={text}
                onChangeText={setText}
                placeholder={t("chat.typeMessage")}
                placeholderTextColor="#999"
                multiline
              />

              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  { backgroundColor: showSend ? colors.primary : colors.text + "33" },
                ]}
                onPress={onSend}
                disabled={!showSend || sending}
              >
                <Icon name={showSend ? "send" : "mic"} size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <PickerBottomSheet
              visible={visible}
              onClose={() => setVisible(false)}
              onResult={(res) => setSelectedFiles([...selectedFiles, ...res])}
            />
          </>
        )}

        {/* Modal for long press */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
              <TouchableOpacity style={styles.modalItem}>
                <Icon name="arrow-redo" size={22} color={colors.primary} />
                <Text style={[styles.modalText, { color: colors.text }]}>Forward</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalItem}>
                <Icon name="trash" size={22} color="red" />
                <Text style={[styles.modalText, { color: "red" }]}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalItem}>
                <Icon name="pin" size={22} color={colors.primary} />
                <Text style={[styles.modalText, { color: colors.text }]}>Pin</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
  },
  headerTextContainer: { marginLeft: 12, flex: 1 },
  friendName: { fontSize: 18, fontWeight: "700" },
  statusText: { fontSize: 12 },

  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontWeight: "600" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  messageListContent: { padding: 12, flexGrow: 1 },
  separatorContainer: { alignItems: "center", marginVertical: 10 },
  separatorText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#888",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  inputRow: { flexDirection: "row", alignItems: "center", padding: 8, borderTopWidth: 1 },
  input: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 8,
  },
  sendBtn: { borderRadius: 12, padding: 10 },

  // Swipe
  leftAction: {
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    marginVertical: 2,
  },
  leftActionLabel: { color: "#fff", fontWeight: "600", marginTop: 2 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  modalBox: { width: "70%", borderRadius: 12, padding: 20 },
  modalItem: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  modalText: { marginLeft: 10, fontSize: 16, fontWeight: "500" },
});

export default ChatRoomContainer;
