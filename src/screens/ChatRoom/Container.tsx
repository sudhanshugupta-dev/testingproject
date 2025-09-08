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
  Alert,
  ScrollView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  listenToMessages,
  sendMessage,
  sendReplyMessage,
  getOrCreateChatRoom,
  markMessagesAsRead,
  deleteMessage,
  pinMessage,
  Message,
} from "../../services/firebase/chat";
import downloadService from "../../services/downloadService";
import ChatBubble from "../../components/ChatBubble";
import CustomAvatar from "../../components/CustomAvatar";
import ReplyMessageBar from "../../components/ReplyMessageBar";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useAppTheme } from "../../themes/useTheme";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/Ionicons";
import PickerBottomSheet from "../../components/PickerBottomSheet";
import FriendSelectionBottomSheet from "../../components/FriendSelectionBottomSheet";
import { uploadMultipleToCloudinary } from "../../services/firebase/cloudinaryService";
import {
  GestureHandlerRootView,
  Swipeable,
} from "react-native-gesture-handler";
import VoiceMessage from "../../components/VoiceMessage";



const ACTION_WIDTH = 80;
const getCacheKey = (roomId: string) => `chat_messages_${roomId}`;
const getRoomCacheKey = (myId: string, friendId: string) => `chat_room_${myId}_${friendId}`;

// Reply swipe action
const LeftAction = memo(function LeftAction({
  progress,
}: {
  progress: Animated.AnimatedInterpolation<number>;
}) {
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-ACTION_WIDTH, 0],
    extrapolate: "clamp",
  });
  const opacity = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.7, 1],
    extrapolate: "clamp",
  });

  return (
    <Animated.View
      style={[
        styles.leftAction,
        { width: ACTION_WIDTH, transform: [{ translateX }], opacity },
      ]}
    >
      <Icon name="return-up-back" size={24} color="#fff" />
      <Text style={styles.leftActionLabel}>Reply</Text>
    </Animated.View>
  );
});

const ChatRoomContainer = () => {
  const route = useRoute<any>();
  const { friendId, friendName } = route.params || {};
  const nav = useNavigation<any>();

  const myId = useSelector((s: RootState) => s.auth.user?.uid);
  const myName = useSelector((s: RootState) => s.auth.user?.email || "Me");

  const [roomId, setRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isInitialFetch, setIsInitialFetch] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [forwardBottomSheetVisible, setForwardBottomSheetVisible] = useState(false);
  const [messageToForward, setMessageToForward] = useState<Message | null>(null);

  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const flatListRef = useRef<FlatList>(null);
  const openRowRef = useRef<Swipeable | null>(null);

  // Group messages with date separators
  const getMessagesWithSeparators = useCallback((msgs: Message[]) => {
    const result: any[] = [];
    let lastDate: string | null = null;

    msgs.forEach((msg) => {
      const msgDate = new Date(
        msg.createdAt?.toString ? Number(msg.createdAt) : (msg.createdAt as number)
      );
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      let label = msgDate.toLocaleDateString();
      if (msgDate.toDateString() === today.toDateString()) label = "Today";
      if (msgDate.toDateString() === yesterday.toDateString()) label = "Yesterday";

      if (label !== lastDate) {
        result.push({ id: `sep-${label}`, type: "separator", label });
        lastDate = label;
      }
      result.push({ ...msg, type: "message" });
    });
     console.log("check resilt", result)
    return result;
   
  }, []);

  // Cache handling for messages
  const loadCachedMessages = useCallback(async (rid: string) => {
    try {
      const cached = await AsyncStorage.getItem(getCacheKey(rid));
      if (cached) {
        const parsed = JSON.parse(cached) as Message[];
        setMessages(parsed);
        return true;
      }
    } catch {}
    return false;
  }, []);

  const saveMessagesToCache = useCallback(async (rid: string, msgs: Message[]) => {
    try {
      await AsyncStorage.setItem(getCacheKey(rid), JSON.stringify(msgs));
    } catch {}
  }, []);

  // Cache handling for room ID
  const loadCachedRoomId = useCallback(async () => {
    try {
      const cached = await AsyncStorage.getItem(getRoomCacheKey(myId!, friendId));
      if (cached) {
        setRoomId(cached);
        await loadCachedMessages(cached);
        return cached;
      }
    } catch {}
    return null;
  }, [myId, friendId, loadCachedMessages]);

  const saveRoomIdToCache = useCallback(async (rid: string) => {
    try {
      await AsyncStorage.setItem(getRoomCacheKey(myId!, friendId), rid);
    } catch {}
  }, [myId, friendId]);

  // Init chat room
  useEffect(() => {
    if (!myId || !friendId) {
      setError("Invalid user or friend ID");
      return;
    }

    if (myId === friendId) {
      setError("Cannot chat with yourself");
      return;
    }

    const initializeChat = async () => {
      // Load cached room ID and messages first
      const cachedRoomId = await loadCachedRoomId();
      setIsInitialFetch(false);

      try {
        const chatRoomId = cachedRoomId || (await getOrCreateChatRoom(myId, friendId));
        if (!cachedRoomId) {
          setRoomId(chatRoomId);
          await saveRoomIdToCache(chatRoomId);
          if (!(await loadCachedMessages(chatRoomId))) {
            // Only show loading state if no cached messages
            setIsInitialFetch(true);
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load chat. Please try again.");
        setIsInitialFetch(false);
      }
    };

    initializeChat();
  }, [myId, friendId, loadCachedRoomId, loadCachedMessages, saveRoomIdToCache]);

  // Listen for new messages
  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = listenToMessages(roomId, (msgs) => {
      const processed = msgs.map((m) => ({
        ...m,
        createdAt: m.createdAt?.toMillis ? m.createdAt.toMillis() : m.createdAt || Date.now(),
        id: m.id || `${m.senderId}-${m.createdAt}`,
      }));
      setMessages(processed);
      saveMessagesToCache(roomId, processed);
      setError(null);
      setIsInitialFetch(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });

    return unsubscribe;
  }, [roomId, saveMessagesToCache]);

  // Handle voice send
  const handleVoiceSend = async (uri: string) => {
    if (!roomId || !myId) {
      Alert.alert("Error", "Chat room not ready or user not authenticated.");
      setIsVoiceMode(false);
      return;
    }

    try {
      const fileName = uri.split('/').pop() || `voice_${Date.now()}.${Platform.OS === 'ios' ? 'm4a' : 'mp4'}`;
      const type = Platform.OS === 'ios' ? 'audio/x-m4a' : 'audio/mp4';
      const files = [{ uri, type, fileName }];
      console.log("Uploading voice message from path:", uri)
      const uploadedUrls = await uploadMultipleToCloudinary(files);

      const payload: any = {
        text: '',
        senderId: myId,
        receiverId: friendId,
        createdAt: Date.now(),
        messageType: 'voice',
        media: uploadedUrls.map((url) => ({ uri: url, type: 'audio' })),
      };

      if (replyingTo) {
        payload.replyTo = {
          messageId: replyingTo.id || "",
          text: replyingTo.text,
          senderId: replyingTo.senderId,
          senderName: replyingTo.senderId === myId ? myName : friendName || "Friend",
        };
        await sendReplyMessage(roomId, payload);
        setReplyingTo(null);
      } else {
        await sendMessage(roomId, payload);
      }
    } catch (err: any) {
      Alert.alert("Error", `Failed to send voice message: ${err.message}`);
    } finally {
      setIsVoiceMode(false);
    }
  };

  // Send message
  const onSend = useCallback(async () => {
    if (!roomId || !myId) {
      Alert.alert("Error", "Chat room not ready or user not authenticated.");
      return;
    }

    const hasTextOrFiles = text.trim() || selectedFiles.length > 0;
    if (!hasTextOrFiles && !isVoiceMode) {
      setIsVoiceMode(true);
      return;
    }

    if (!hasTextOrFiles) return;

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
        senderId: myId,
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
        await sendReplyMessage(roomId, payload);
      } else {
        console.log(roomId , "correct", payload)
        await sendMessage(roomId, payload);
      }
    } catch (err: any) {
      Alert.alert("Error", `Failed to send message: ${err.message}`);
    } finally {
      setText("");
      setSelectedFiles([]);
      setReplyingTo(null);
    }
  }, [text, selectedFiles, replyingTo, myId, myName, friendId, friendName, roomId, isVoiceMode]);

  // Long press modal
  const handleLongPress = useCallback((msg: Message) => {
    setSelectedMessage(msg);
    setModalVisible(true);
  }, []);

  // Handle forward message
  const handleForward = useCallback((message: Message) => {
    setMessageToForward(message);
    setModalVisible(false);
    setForwardBottomSheetVisible(true);
  }, []);

  // Handle pin message
  const handlePin = useCallback(async (message: Message) => {
    if (!roomId || !myId) return;
    
    try {
      await pinMessage(roomId, message.id!, myId);
      Alert.alert('Success', 'Message pinned successfully');
    } catch (error: any) {
      Alert.alert('Error', `Failed to pin message: ${error.message}`);
    } finally {
      setModalVisible(false);
    }
  }, [roomId, myId]);

  // Handle delete message
  const handleDelete = useCallback(async (message: Message) => {
    if (!roomId || !myId) return;
    
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMessage(roomId, message.id!, myId);
              Alert.alert('Success', 'Message deleted successfully');
            } catch (error: any) {
              Alert.alert('Error', `Failed to delete message: ${error.message}`);
            } finally {
              setModalVisible(false);
            }
          }
        }
      ]
    );
  }, [roomId, myId]);

  // Handle download media
  const handleDownload = useCallback(async (message: Message) => {
    if (!message.media || message.media.length === 0) {
      Alert.alert('Error', 'No media to download');
      return;
    }

    setModalVisible(false);

    try {
      const mediaItem = message.media[0]; // Download first media item
      
      // Show loading alert
      Alert.alert('Downloading...', 'Please wait while we download your file');
      
      const result = await downloadService.downloadFile(
        mediaItem.uri,
        undefined,
        mediaItem.type
      );
      console.log("check result,", result)

      if (result.success && result.filePath) {
        // Extract just the filename from the full path for display
        const fileName = result.filePath.split('/').pop() || 'file';
        const folderPath = Platform.OS === 'android' ? 'Downloads' : 'Documents';
        
        Alert.alert(
          'Download Complete ✅',
          `File saved successfully!\n\nFile: ${fileName}\nLocation: ${folderPath} folder\n\nFull path: ${result.filePath}`,
          [{ text: 'OK' }]
        );
        
        console.log('File downloaded to:', result.filePath);
      } else {
        Alert.alert('Download Fail ❌', result.error || 'Unknown error occurred');
      }
    } catch (error: any) {
      console.error('Download error:', error);
      Alert.alert('Download Failed ❌', error.message || 'Unknown error occurred');
    }
  }, []);

  // Render messages
  const renderMessage = useCallback(
    ({ item }: { item: any }) => {

        console.log("corrected", item)
      if (item.type === "separator") {
        return (
          <View style={styles.separatorContainer}>
            <Text style={[styles.separatorText, { color: colors.text + "80" }]}>
              {item.label}
            </Text>
          </View>
        );
      }

      if (item.deleted) return null;

      let rowRef: Swipeable | null = null;

      return (
        <Swipeable
          ref={(ref) => (rowRef = ref)}
          friction={1.5}
          leftThreshold={ACTION_WIDTH * 0.5}
          overshootLeft={false}
          overshootFriction={1}
          renderLeftActions={(progress) => <LeftAction progress={progress} />}
          onSwipeableWillOpen={() => {
            if (openRowRef.current && openRowRef.current !== rowRef) {
              openRowRef.current.close();
            }
            openRowRef.current = rowRef;
            setReplyingTo(item);
            setTimeout(() => rowRef?.close(), 300);
          }}
          onSwipeableClose={() => {
            if (openRowRef.current === rowRef) openRowRef.current = null;
          }}
          containerStyle={styles.swipeableContainer}
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
    [myId, colors, handleLongPress]
  );

  // Mark as read
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
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={() => nav.goBack()}>
            <Icon name="arrow-back" size={30} color={colors.primary} />
          </TouchableOpacity>
          <CustomAvatar name={friendName || "Unknown"} size={40} />
          <View style={styles.headerTextContainer}>
            <Text style={[styles.friendName, { color: colors.text }]}>
              {friendName || t("chat.friend")}
            </Text>
            <Text style={[styles.roomInfo, { color: colors.text, opacity: 0.6 }]}>
              Room: {roomId ? roomId.substring(0, 8) + "..." : t("chat.loading")}
            </Text>
          </View>
        </View>

        {/* Content */}
        {error && messages.length === 0 ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={async () => {
                setError(null);
                setIsInitialFetch(true);
                try {
                  const chatRoomId = await getOrCreateChatRoom(myId!, friendId);
                  setRoomId(chatRoomId);
                  await saveRoomIdToCache(chatRoomId);
                  await loadCachedMessages(chatRoomId);
                  setIsInitialFetch(false);
                } catch (err: any) {
                  setError(err.message || "Failed to reconnect. Please try again.");
                  setIsInitialFetch(false);
                }
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              ref={flatListRef}
              data={getMessagesWithSeparators(messages)}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
              contentContainerStyle={styles.messageListContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              ListFooterComponent={
                isInitialFetch && messages.length === 0 ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.text }]}>
                      {t("chat.loadingMessages")}
                    </Text>
                  </View>
                ) : null
              }
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
            />

            {/* Reply bar */}
            {replyingTo && (
              <ReplyMessageBar
                replyMessage={{
                  id: replyingTo.id!,
                  text: replyingTo.text,
                  senderId: replyingTo.senderId,
                  senderName: replyingTo.senderId === myId ? myName : friendName || "Friend",
                }}
                onCancel={() => setReplyingTo(null)}
                currentUserId={myId}
              />
            )}

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
              <ScrollView
                horizontal
                style={styles.mediaPreviewContainer}
                showsHorizontalScrollIndicator={false}
              >
                {selectedFiles.map((file, index) => (
                  <View key={index} style={styles.mediaPreviewItem}>
                    <Image
                      source={{ uri: file.uri }}
                      style={styles.mediaPreviewImage}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      style={styles.removeMediaButton}
                      onPress={() => {
                        setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
                      }}
                    >
                      <Icon name="close-circle" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            {/* Input row */}
            <View style={[styles.inputRow, { borderTopColor: colors.text + "22" }]}>
              <TouchableOpacity
                onPress={() => setVisible(true)}
                style={styles.attachButton}
              >
                <Icon name="add-circle-outline" size={30} color={colors.primary} />
              </TouchableOpacity>
              {isVoiceMode ? (
                <VoiceMessage
                  onSend={handleVoiceSend}
                  onCancel={() => setIsVoiceMode(false)}
                />
              ) : (
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                  value={text}
                  onChangeText={setText}
                  placeholder={t("chat.typeMessage")}
                  placeholderTextColor="#999"
                  multiline
                />
              )}
              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  { backgroundColor: (showSend || isVoiceMode) ? colors.primary : colors.text + "33" },
                ]}
                onPress={onSend}
                disabled={false}
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

        {/* Long press modal */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setReplyingTo(selectedMessage);
                  setModalVisible(false);
                }}
              >
                <Icon name="return-up-back" size={22} color={colors.primary} />
                <Text style={[styles.modalText, { color: colors.text }]}>Reply</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => selectedMessage && handleForward(selectedMessage)}
              >
                <Icon name="arrow-redo" size={22} color={colors.primary} />
                <Text style={[styles.modalText, { color: colors.text }]}>Forward</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => selectedMessage && handlePin(selectedMessage)}
              >
                <Icon name="pin" size={22} color={colors.primary} />
                <Text style={[styles.modalText, { color: colors.text }]}>Pin</Text>
              </TouchableOpacity>
              {selectedMessage?.media && selectedMessage.media.length > 0 && (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => selectedMessage && handleDownload(selectedMessage)}
                >
                  <Icon name="download" size={22} color={colors.primary} />
                  <Text style={[styles.modalText, { color: colors.text }]}>Download</Text>
                </TouchableOpacity>
              )}
              {selectedMessage?.senderId === myId && (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => selectedMessage && handleDelete(selectedMessage)}
                >
                  <Icon name="trash" size={22} color="red" />
                  <Text style={[styles.modalText, { color: "red" }]}>Delete</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.modalItem, styles.cancelItem]}
                onPress={() => setModalVisible(false)}
              >
                <Icon name="close" size={22} color={colors.text} />
                <Text style={[styles.modalText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Friend Selection Bottom Sheet for Forwarding */}
        <FriendSelectionBottomSheet
          visible={forwardBottomSheetVisible}
          onClose={() => {
            setForwardBottomSheetVisible(false);
            setMessageToForward(null);
          }}
          messageToForward={messageToForward}
          onForwardComplete={(selectedFriends) => {
            console.log('Message forwarded to:', selectedFriends);
            setForwardBottomSheetVisible(false);
            setMessageToForward(null);
          }}
        />
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
    borderBottomColor: "#ddd",
  },
  headerTextContainer: { marginLeft: 12, flex: 1 },
  friendName: { fontSize: 18, fontWeight: "700" },
  roomInfo: { fontSize: 12, marginTop: 2 },
  loadingContainer: { padding: 20, alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 14 },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  errorText: { fontSize: 16, textAlign: "center", marginBottom: 20 },
  retryButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryButtonText: { color: "#fff", fontWeight: "600" },
  messageListContent: { padding: 12, flexGrow: 1 },
  separatorContainer: { alignItems: "center", marginVertical: 10 },
  separatorText: { fontSize: 14, fontWeight: "600" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderTopWidth: 1,
    minHeight: 60,
  },
  input: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 8,
    maxHeight: 100,
  },
  sendBtn: { borderRadius: 12, padding: 10 },
  attachButton: { padding: 8 },
  leftAction: {
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginVertical: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  leftActionLabel: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
    marginTop: 4,
  },
  swipeableContainer: {
    marginVertical: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "80%",
    borderRadius: 12,
    padding: 20,
    maxHeight: "60%",
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  cancelItem: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
  modalText: { marginLeft: 10, fontSize: 16, fontWeight: "500" },
  mediaPreviewContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxHeight: 100,
  },
  mediaPreviewItem: {
    marginRight: 8,
    position: "relative",
  },
  mediaPreviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeMediaButton: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    padding: 2,
  },
});

export default ChatRoomContainer;