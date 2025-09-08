import React, { useEffect, useState, useCallback, useRef, useMemo, memo } from "react";
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
import {
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
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
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
import { 
  loadInitialMessages,
  loadOlderMessages,
  startRoomMessageListener,
  stopRoomMessageListener,
  addOptimisticMessage,
  removeMessage,
  updateMessageId,
  clearRoomMessages,
} from "../../redux/slices/messagesSlice";
import {
  saveMessagesToCache,
  loadMessagesFromCache,
  saveRoomIdToCache,
  loadRoomIdFromCache,
  validateAndRepairCache,
} from "../../utils/messageCache";
import { formatDateSeparator, isSameDay } from "../../utils/timestampUtils";

const ACTION_WIDTH = 80;

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

const OptimizedChatRoomContainer = () => {
  const route = useRoute<any>();
  const { friendId, friendName } = route.params || {};
  const nav = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();

  const myId = useSelector((s: RootState) => s.auth.user?.uid);
  const myName = useSelector((s: RootState) => s.auth.user?.email || "Me");

  // Redux state
  const roomMessages = useSelector((state: RootState) => state.messages.messages);
  const roomLoading = useSelector((state: RootState) => state.messages.loading);
  const roomErrors = useSelector((state: RootState) => state.messages.error);
  const hasMoreMessages = useSelector((state: RootState) => state.messages.hasMoreMessages);
  const oldestTimestamps = useSelector((state: RootState) => state.messages.oldestTimestamp);

  // Local state
  const [roomId, setRoomId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
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
  const sendButtonScale = useRef(new Animated.Value(1)).current;
  const isScrolledToBottom = useRef(true);

  // Current room data
  const messages = roomId ? (roomMessages[roomId] || []) : [];
  const isLoading = roomId ? (roomLoading[roomId] || false) : false;
  const error = roomId ? (roomErrors[roomId] || null) : null;
  const hasMore = roomId ? (hasMoreMessages[roomId] !== false) : true;
  const oldestTimestamp = roomId ? (oldestTimestamps[roomId] || null) : null;

  // Group messages with date separators
  const getMessagesWithSeparators = useCallback((msgs: Message[]) => {
    const result: any[] = [];
    let lastDate: string | null = null;

    msgs.forEach((msg, index) => {
      const timestamp = msg.createdAt?.toString ? Number(msg.createdAt) : (msg.createdAt as number);
      const currentDate = formatDateSeparator(timestamp);
      
      // Add date separator if day changed
      if (currentDate !== lastDate && currentDate) {
        result.push({ 
          id: `separator-${timestamp}`, 
          type: "separator", 
          label: currentDate 
        });
        lastDate = currentDate;
      }
      
      result.push({ ...msg, type: "message" });
    });

    return result;
  }, []);

  const messagesWithSeparators = useMemo(() => 
    getMessagesWithSeparators(messages), 
    [messages, getMessagesWithSeparators]
  );

  // Initialize chat room
  useEffect(() => {
    if (!myId || !friendId) {
      Alert.alert("Error", "Invalid user or friend ID");
      return;
    }

    if (myId === friendId) {
      Alert.alert("Error", "Cannot chat with yourself");
      return;
    }

    const initializeChat = async () => {
      setIsInitializing(true);
      
      try {
        // Try to load cached room ID first
        const cachedRoomId = await loadRoomIdFromCache(myId, friendId);
        let chatRoomId = cachedRoomId;

        if (!cachedRoomId) {
          // Create or get room ID
          chatRoomId = await getOrCreateChatRoom(myId, friendId);
          await saveRoomIdToCache(myId, friendId, chatRoomId);
        }

        setRoomId(chatRoomId);

        // Try to load cached messages first for instant display
        const cachedData = await loadMessagesFromCache(chatRoomId);
        if (cachedData && cachedData.messages.length > 0) {
          // Validate cache integrity
          const isCacheValid = await validateAndRepairCache(chatRoomId);
          if (isCacheValid) {
            // Load cached messages into Redux
            dispatch({
              type: 'messages/setRoomMessages',
              payload: { roomId: chatRoomId, messages: cachedData.messages }
            });
            console.log('Loaded cached messages:', cachedData.messages.length);
            
            // Scroll to bottom after loading cache
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: false });
            }, 100);
          }
        }

        // Load initial messages from server
        await dispatch(loadInitialMessages({ roomId: chatRoomId, limit: 20 })).unwrap();

        // Start real-time listener
        dispatch(startRoomMessageListener(chatRoomId));

        // Cache the messages
        const currentMessages = roomMessages[chatRoomId] || [];
        if (currentMessages.length > 0) {
          await saveMessagesToCache(chatRoomId, currentMessages);
        }

      } catch (error: any) {
        console.error('Error initializing chat:', error);
        Alert.alert("Error", error.message || "Failed to initialize chat");
      } finally {
        setIsInitializing(false);
      }
    };

    initializeChat();

    // Cleanup on unmount
    return () => {
      if (roomId) {
        dispatch(stopRoomMessageListener(roomId));
      }
    };
  }, [myId, friendId, dispatch]);

  // Auto-scroll to bottom for new messages
  useEffect(() => {
    if (messages.length > 0 && roomId) {
      // Auto-scroll to bottom for new messages (only if user is already at bottom)
      if (isScrolledToBottom.current) {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
      
      // Cache messages periodically
      saveMessagesToCache(roomId, messages);
      
      // Mark messages as read
      markMessagesAsRead(roomId, myId!);
    }
  }, [messages.length, roomId, myId]);

  // Load older messages (pagination)
  const handleLoadMore = useCallback(async () => {
    if (!roomId || isLoading || !hasMore || !oldestTimestamp) {
      return;
    }

    try {
      await dispatch(loadOlderMessages({ 
        roomId, 
        beforeTimestamp: oldestTimestamp,
        limit: 20 
      })).unwrap();
    } catch (error) {
      console.error('Error loading more messages:', error);
    }
  }, [roomId, isLoading, hasMore, oldestTimestamp, dispatch]);

  // Handle voice message send
  const handleVoiceSend = useCallback(async (uri: string) => {
    if (!roomId || !myId) {
      Alert.alert("Error", "Chat room not ready or user not authenticated.");
      setIsVoiceMode(false);
      return;
    }

    try {
      const fileName = uri.split('/').pop() || `voice_${Date.now()}.${Platform.OS === 'ios' ? 'm4a' : 'mp4'}`;
      const type = Platform.OS === 'ios' ? 'audio/x-m4a' : 'audio/mp4';
      const files = [{ uri, type, fileName }];
      
      console.log("Uploading voice message from path:", uri);
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
  }, [roomId, myId, friendId, replyingTo, myName, friendName]);

  // Send text/media message
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

    const tempMessageId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempMessageId,
      text: text.trim(),
      senderId: myId,
      receiverId: friendId,
      createdAt: Date.now(),
      isSeen: false,
      seenBy: {},
      media: selectedFiles.map((file) => ({ uri: file.uri, type: file.type })),
      replyTo: replyingTo ? {
        messageId: replyingTo.id || "",
        text: replyingTo.text,
        senderId: replyingTo.senderId,
        senderName: replyingTo.senderId === myId ? myName : friendName || "Friend",
      } : undefined,
    };

    // Add optimistic message
    dispatch(addOptimisticMessage({ roomId, message: optimisticMessage }));

    try {
      let uploadedUrls: string[] = [];
      if (selectedFiles.length > 0) {
        Alert.alert("Uploading...", "Please wait while your files are uploaded.");
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
        await sendMessage(roomId, payload);
      }

      // The real message will be received via the real-time listener
      // Remove the optimistic message as it will be replaced
      dispatch(removeMessage({ roomId, messageId: tempMessageId }));

    } catch (err: any) {
      // Remove optimistic message on failure
      dispatch(removeMessage({ roomId, messageId: tempMessageId }));
      Alert.alert("Error", `Failed to send message: ${err.message}`);
    } finally {
      setText("");
      setSelectedFiles([]);
      setReplyingTo(null);
    }
  }, [roomId, myId, friendId, text, selectedFiles, replyingTo, myName, friendName, isVoiceMode, dispatch]);

  // Handle message actions
  const handleLongPress = useCallback((msg: Message) => {
    setSelectedMessage(msg);
    setModalVisible(true);
  }, []);

  const handleForward = useCallback((message: Message) => {
    setMessageToForward(message);
    setModalVisible(false);
    setForwardBottomSheetVisible(true);
  }, []);

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

  const handleDownload = useCallback(async (message: Message) => {
    if (!message.media || message.media.length === 0) {
      Alert.alert('Error', 'No media to download');
      return;
    }

    setModalVisible(false);

    try {
      const mediaItem = message.media[0];
      
      Alert.alert('Downloading...', 'Please wait while we download your file');
      
      const result = await downloadService.downloadFile(
        mediaItem.uri,
        undefined,
        mediaItem.type
      );

      if (result.success && result.filePath) {
        const fileName = result.filePath.split('/').pop() || 'file';
        const folderPath = Platform.OS === 'android' ? 'Downloads' : 'Documents';
        
        Alert.alert(
          'Download Complete ✅',
          `File saved successfully!\n\nFile: ${fileName}\nLocation: ${folderPath} folder\n\nFull path: ${result.filePath}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Download Failed ❌', result.error || 'Unknown error occurred');
      }
    } catch (error: any) {
      console.error('Download error:', error);
      Alert.alert('Download Failed ❌', error.message || 'Unknown error occurred');
    }
  }, []);

  // Scroll tracking
  const onScrollToIndexFailed = useCallback(() => {
    // Handle scroll to index failure gracefully
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 100);
  }, []);

  const onScroll = useCallback((event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isAtBottom = contentOffset.y >= (contentSize.height - layoutMeasurement.height - 50);
    isScrolledToBottom.current = isAtBottom;
  }, []);

  // Render message with swipe actions
  const renderMessage = useCallback(({ item }: { item: any }) => {
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
        ref={(ref) => { rowRef = ref; }}
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
  }, [myId, colors, handleLongPress]);

  // Send button animation
  const showSend = text.trim().length > 0 || selectedFiles.length > 0;

  useEffect(() => {
    Animated.spring(sendButtonScale, {
      toValue: showSend || isVoiceMode ? 1.1 : 1,
      useNativeDriver: true,
    }).start();
  }, [showSend, isVoiceMode, sendButtonScale]);

  if (isInitializing) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          {t("chat.initializing", "Initializing chat...")}
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 20}
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
              {messages.length > 0 ? `${messages.length} messages` : t("chat.loading")}
            </Text>
          </View>
        </View>

        {/* Content */}
        {error && messages.length === 0 ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                if (roomId) {
                  dispatch(loadInitialMessages({ roomId, limit: 20 }));
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
              data={messagesWithSeparators}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
              inverted
              onScroll={onScroll}
              onScrollToIndexFailed={onScrollToIndexFailed}
              contentContainerStyle={styles.messageListContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={20}
              maxToRenderPerBatch={10}
              windowSize={21}
              onRefresh={handleLoadMore}
              refreshing={isLoading}
              ListHeaderComponent={
                hasMore && messages.length > 0 ? (
                  <View style={styles.loadMoreContainer}>
                    <Text style={[styles.loadMoreText, { color: colors.text + "80" }]}>
                      {t("chat.pullToLoadMore", "Pull to load more messages")}
                    </Text>
                  </View>
                ) : messages.length > 0 ? (
                  <View style={styles.loadMoreContainer}>
                    <Text style={[styles.loadMoreText, { color: colors.text + "60" }]}>
                      {t("chat.noMoreMessages", "No more messages")}
                    </Text>
                  </View>
                ) : null
              }
              ListFooterComponent={
                isInitializing ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.text }]}>
                      {t("chat.loadingMessages", "Loading messages...")}
                    </Text>
                  </View>
                ) : null
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
                {selectedFiles.slice(0, 5).map((file, index) => (
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
                {selectedFiles.length > 5 && (
                  <View style={styles.mediaPreviewItem}>
                    <Text style={[styles.moreFilesText, { color: colors.text }]}>
                      +{selectedFiles.length - 5} more
                    </Text>
                  </View>
                )}
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
                  {
                    backgroundColor: (showSend || isVoiceMode) ? colors.primary : colors.text + "33",
                    transform: [{ scale: sendButtonScale }],
                  },
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
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTextContainer: { marginLeft: 12, flex: 1 },
  friendName: { fontSize: 18, fontWeight: "700" },
  roomInfo: { fontSize: 12, marginTop: 2 },
  loadingContainer: { 
    padding: 20, 
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
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
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
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
  loadMoreContainer: {
    paddingVertical: 15,
    alignItems: "center",
  },
  loadMoreText: {
    fontSize: 12,
    fontStyle: "italic",
  },
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
  moreFilesText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 80,
  },
});

export default OptimizedChatRoomContainer;
