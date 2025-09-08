import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

type ChatItem = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  roomId: string;
  lastMessage: {
    text: string;
    timestamp: any;
    senderId: string;
    isSeen: boolean;
  } | null;
  unseenCount: number;
};


// Assuming generateRoomId is defined elsewhere or inline
const generateRoomId = (userId1: string, userId2: string): string => {
  return [userId1, userId2].sort().join('_');
};

// Create or get a chat room
export const getOrCreateChatRoom = async (
  userId1: string,
  userId2: string,
): Promise<string> => {
  try {
    // Prevent self-chat
    if (userId1 === userId2) {
      throw new Error("Cannot create chat room with yourself");
    }

    console.log("Creating/getting chat room for users:", userId1, userId2);
    
    // Generate consistent room ID (sorted to ensure same room for both users)
    const roomId = generateRoomId(userId1, userId2);
    console.log("Generated room ID:", roomId);
    
    // Check if room already exists
    const roomRef = firestore().collection('rooms').doc(roomId);
    const roomDoc = await roomRef.get();
    
    if (roomDoc.exists) {
      console.log('Existing chat room found:', roomId);
      // Ensure chat entries exist
      await ensureChatEntries(roomId, userId1, userId2);
      return roomId;
    }
    
    // Create new room
    console.log('Creating new chat room:', roomId);
    await roomRef.set({
      participants: [userId1, userId2],
      createdAt: firestore.FieldValue.serverTimestamp(),
      lastMessage: '',
      lastMessageAt: null,
      createdBy: userId1,
    });
    
    // Create chat entries for both users
    await ensureChatEntries(roomId, userId1, userId2);
    
    console.log('New chat room created successfully:', roomId);
    return roomId;
  } catch (error: any) {
    console.error('Error creating/fetching chat room:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw new Error(
      `Failed to create/fetch chat room: ${error.message} (Code: ${
        error.code || 'unknown'
      })`,
    );
  }
};

// Helper function to ensure chat entries exist for both users
const ensureChatEntries = async (
  roomId: string,
  userId1: string,
  userId2: string,
) => {
  try {
    // Create entries in chats collection for both users
    const batch = firestore().batch();
    
    // Get user details
    const user1Doc = await firestore().collection('users').doc(userId1).get();
    const user2Doc = await firestore().collection('users').doc(userId2).get();
    
    const user1Data = user1Doc.exists ? user1Doc.data() : {};
    const user2Data = user2Doc.exists ? user2Doc.data() : {};
    
    // Create chat entry for user1
    const user1ChatRef = firestore().collection('chats').doc(`${userId1}_${roomId}`);
    batch.set(user1ChatRef, {
      roomId,
      participants: [userId1, userId2],
      lastMessage: '',
      lastMessageAt: null,
      name: (user2Data as any)?.name || (user2Data as any)?.email || 'Unknown',
      avatar: (user2Data as any)?.avatar || null,
      unreadCount: 0,
      createdAt: firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    
    // Create chat entry for user2
    const user2ChatRef = firestore().collection('chats').doc(`${userId2}_${roomId}`);
    batch.set(user2ChatRef, {
      roomId,
      participants: [userId1, userId2],
      lastMessage: '',
      lastMessageAt: null,
      name: (user1Data as any)?.name || (user1Data as any)?.email || 'Unknown',
      avatar: (user1Data as any)?.avatar || null,
      unreadCount: 0,
      createdAt: firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    
    await batch.commit();
    console.log('Chat entries created for room:', roomId);
  } catch (error) {
    console.error('Error creating chat entries:', error);
  }
};


const getCurrentUserId = () => auth().currentUser?.uid;

// 🔹 Listen to friend list (realtime)
const listenToFriends = (
  callback: (friends: string[]) => void,
) => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  return firestore()
    .collection('users')
    .doc(userId)
    .collection('friends')
    .onSnapshot(snapshot => {
      const friends = snapshot.docs.map(doc => doc.id);
      callback(friends);
    });
};

// 🔹 Get or create roomId between two users (deterministic)
const getRoomId = (uid1: string, uid2: string) => {
  return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
};

const listenToChatForFriend = (
  friendId: string,
  callback: (chatItem: ChatItem | null) => void,
) => {
  const userId = getCurrentUserId();
  if (!userId) return;

  const roomId = getRoomId(userId, friendId);

  // 1. Listen to friend profile
  const userUnsub = firestore()
    .collection('users')
    .doc(friendId)
    .onSnapshot(friendDoc => {
      if (!friendDoc.exists) {
        callback(null);
        return;
      }

      const friendData = friendDoc.data() as any;

      const lastMsgUnsub = firestore()
        .collection('rooms')
        .doc(roomId)
        .collection('messages')
        .orderBy('createdAt', 'desc')
        .limit(1)
        .onSnapshot(lastMsgSnap => {
          const lastMsg = lastMsgSnap.docs[0]?.data();

          // 3. Count unseen messages
          firestore()
            .collection('rooms')
            .doc(roomId)
            .collection('messages')
            .where('receiverId', '==', userId)   // ⚠️ do you store receiverId in message doc? (not in screenshot)
            .where('status', '!=', 'seen')       // adjust according to your status field
            .onSnapshot(unseenSnap => {
              const unseenCount = unseenSnap?.size ?? 0; // safe access

              const chatItem: ChatItem = {
                id: friendDoc.id,
                name: friendData.name || 'Unknown',
                email: friendData.email || 'No email',
                avatar: friendData.avatar || null,
                roomId,
                lastMessage: lastMsg
                  ? {
                      text: lastMsg.text || '',
                    timestamp: lastMsg?.createdAt ? lastMsg.createdAt.toDate().getTime() : null,
                      senderId: lastMsg.senderId || null,
                      isSeen: lastMsg.status === 'true',
                      seenBy: lastMsg.seenBy,
                    }
                  : null,
                unseenCount,
              };
              console.log("final answer", chatItem)
              callback(chatItem);
            });
        });
    });

  return () => {
    userUnsub();
    // you might also keep references to lastMsgUnsub/unseenUnsub and call them here
  };
};


// 🔹 Listen to full chat list (realtime, sorted)
export const listenToChatList = (
  onData: (chatList: ChatItem[]) => void,
  onError?: (error: Error) => void,
) => {
  const userId = getCurrentUserId();
  console.log('do you have userid', userId);
  if (!userId) {
    const err = new Error('User not authenticated');
    if (onError) onError(err);
    throw err;
  }

  let unsubscribes: (() => void)[] = [];




const unsubFriends = listenToFriends(friendIds => {
  // Clear old listeners
  unsubscribes.forEach(unsub => unsub());
  unsubscribes = [];

  const chats: Record<string, ChatItem> = {};

  // 👇 Add myself into the list along with friends
  const allIds = [...friendIds, userId]; // currentUserId = your uid

  allIds.forEach(friendId => {
    // Pre-fill placeholder
    chats[friendId] = {
      friendId,
      lastMessage: null, // Empty chat until real data comes
    } as unknown as ChatItem;

    const unsubChat = listenToChatForFriend(friendId, chatItem => {
      console.log("Chat Item kya hai", chatItem);

      if (chatItem) {
        chats[friendId] = chatItem;
      }

      // Always sort (self will also be included)
      const sorted = Object.values(chats).sort((a, b) => {
        const t1 = a.lastMessage?.timestamp?.toMillis?.() || 0;
        const t2 = b.lastMessage?.timestamp?.toMillis?.() || 0;
        return t2 - t1;
      });

      onData(sorted);
    });

    unsubscribes.push(unsubChat as any);
  });

  // Trigger at least once so UI shows empty list with self + friends
  if (allIds.length > 0) {
    const sorted = Object.values(chats);
    onData(sorted);
  }
});

return () => {
  try {
    unsubFriends();
    unsubscribes.forEach(unsub => unsub());
  } catch (err: any) {
    if (onError) onError(err);
  }
};
};



// Media item interface
export interface MediaItem {
  uri: string;
  type: string;
}

// Message interface for better typing
export interface Message {
  id?: string;
  text: string;
  senderId: string;
  receiverId?: string;
  createdAt: any;
  messageType?: 'text' | 'image' | 'video' | 'voice' | 'mixed';
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  media?: MediaItem[];
  voiceUri?: string;
  voiceDuration?: number;
  replyTo?: {
    messageId: string;
    text: string;
    senderId: string;
    senderName?: string;
  };
  isSeen: boolean;
  seenBy: Record<string, boolean>;
  deleted?: boolean;
  deletedAt?: any;
  deletedBy?: string;
  forwardedFrom?: {
    messageId: string;
    roomId: string;
    originalSenderId: string;
    forwardedAt: any;
  };
}

// Send a reply message to a chat room
export const sendReplyMessage = async (
  roomId: string,
  message: { 
    text: string; 
    senderId: string; 
    createdAt: number; 
    receiverId : string;
    replyTo: {
      messageId: string;
      text: string;
      senderId: string;
      senderName?: string;
    }
  },
): Promise<void> => {
  try {
    const userId = auth().currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    if (message.senderId !== userId)
      throw new Error('Sender ID does not match authenticated user');

    console.log('Sending reply message to room:', roomId, message);
    console.log(userId, "user",  message.receiverId , "friend")

    const roomRef = firestore().collection('rooms').doc(roomId);
    const messageRef = roomRef.collection('messages').doc();
    const serverTimestamp = firestore.FieldValue.serverTimestamp();
    const receiverId = message.receiverId;


    const messageData: Message = {
      text: message.text,
      senderId: message.senderId,
      createdAt: serverTimestamp,
      messageType: 'text',
      status: 'sent',
      replyTo: message.replyTo,
      isSeen : false,
      seenBy: {
        [userId]: true,   // sender automatically sees their own
        [receiverId]: false // receiver starts unseen
  }
    };
     

    const batch = firestore().batch();

    // Add reply message to messages subcollection
    batch.set(messageRef, messageData);

    // Update lastMessage in room
    batch.update(roomRef, {
      lastMessage: message.text,
      lastMessageAt: serverTimestamp,
    });

    // Update chats collection for all participants
    const chatDocs = await firestore()
      .collection('chats')
      .where('roomId', '==', roomId)
      .get();

    chatDocs.forEach(doc => {
      batch.update(doc.ref, {
        lastMessage: message.text,
        lastMessageAt: serverTimestamp,
        // Don't update unread count for sender
        ...(doc.id.startsWith(message.senderId) ? {} : { unreadCount: firestore.FieldValue.increment(1) })
      });
    });

    await batch.commit();
    console.log('Reply message sent successfully');
  } catch (error: any) {
    console.error('Error sending reply message:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw new Error(
      `Failed to send reply message: ${error.message} (Code: ${
        error.code || 'unknown'
      })`,
    );
  }
};

// Send a message to a chat room
export const sendMessage = async (
  roomId: string,
  message: {
    text: string;
    senderId: string;
    createdAt: number;
    receiverId: string;
    media?: { uri: string; type: string }[];
  },
): Promise<void> => {
  
  try {
   
    const userId = auth().currentUser?.uid;
    if (!userId) throw new Error("User not authenticated");
    // If senderId doesn't match logged-in user, fix it instead of failing hard
    if (message.senderId !== userId) {
      console.warn(
        "sendMessage: senderId does not match authenticated user. Overriding.",
        { provided: message.senderId, authed: userId }
      );
    }

    console.log("Sending message to room:", roomId, message, ":sf", userId);

    const roomRef = firestore().collection("rooms").doc(roomId);
    const messageRef = roomRef.collection("messages").doc();
    const serverTimestamp = firestore.FieldValue.serverTimestamp();
    const receiverId = message.receiverId;

    // ✅ Determine message type
    let messageType: "text" | "image" | "video" | "mixed" = "text";
    if (message.media && message.media.length > 0) {
      const hasImages = message.media.some(m => m.type.startsWith("image"));
      const hasVideos = message.media.some(m => m.type.startsWith("video"));

      if (hasImages && hasVideos) messageType = "mixed";
      else if (hasVideos) messageType = "video";
      else messageType = "image";
    }

    // ✅ Pick preview text for lastMessage
    let lastMessagePreview = message.text || "";
    if (!lastMessagePreview && messageType !== "text") {
      if (messageType === "image") lastMessagePreview = "📷 Image";
      else if (messageType === "video") lastMessagePreview = "🎥 Video";
      else if (messageType === "mixed") lastMessagePreview = "📷🎥 Media";
    }

    const messageData: Message = {
      text: message.text,
      senderId: userId,
      receiverId,
      createdAt: serverTimestamp,
      messageType,
      status: "sent",
      isSeen: false,
      media: message.media || [],
      seenBy: {
        [userId]: true, // sender auto sees own
        [receiverId]: false, // receiver starts unseen
      },
    };

    const batch = firestore().batch();

    // Add message to messages subcollection
    batch.set(messageRef, messageData);

    // Update lastMessage in room
    batch.set(
      roomRef,
      {
        lastMessage: lastMessagePreview,
        lastMessageAt: serverTimestamp,
      },
      { merge: true }
    );

    // Update chats collection for all participants
    const chatDocs = await firestore()
      .collection("chats")
      .where("roomId", "==", roomId)
      .get();

    chatDocs.forEach((doc) => {
      batch.update(doc.ref, {
        lastMessage: lastMessagePreview,
        lastMessageAt: serverTimestamp,
        // Don't increment unread count for sender
        ...(doc.id.startsWith(message.senderId)
          ? {}
          : { unreadCount: firestore.FieldValue.increment(1) }),
      });
    });

    await batch.commit();
    console.log("✅ Message sent successfully");
  } catch (error: any) {
    console.error("❌ Error sending message:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    console.log(roomId , "roomId");
    console.log("message", message)
    throw new Error(
      `Failed to send message: ${error.message} (Code: ${
        error.code || "unknown"
      })`
    );
  }
};


// Fetch a paginated list of messages from a chat room
export const fetchMessagesPage = async (
  roomId: string,
  limit: number = 20,
  beforeTimestamp?: number
): Promise<Message[]> => {
  try {
    console.log('Fetching messages page for room:', roomId, 'limit:', limit, 'beforeTimestamp:', beforeTimestamp);
    
    let query = firestore()
      .collection('rooms')
      .doc(roomId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .limit(limit);
    
    // If we have a beforeTimestamp, fetch messages before that timestamp
    if (beforeTimestamp) {
      query = query.where('createdAt', '<', firestore.Timestamp.fromMillis(beforeTimestamp));
    }
    
    const snapshot = await query.get();
    
    const messages: Message[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        text: data.text || '',
        senderId: data.senderId || '',
        receiverId: data.receiverId || '',
        createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : data.createdAt || Date.now(),
        media: data.media || [],
        messageType: data.messageType || 'text',
        status: data.status || 'sent',
        replyTo: data.replyTo || undefined,
        isSeen: data.isSeen || false,
        seenBy: data.seenBy || {},
        voiceUri: data.voiceUri,
        voiceDuration: data.voiceDuration,
        deleted: data.deleted || false,
        deletedAt: data.deletedAt,
        deletedBy: data.deletedBy,
        forwardedFrom: data.forwardedFrom,
      };
    });
    
    // Return in ascending order (oldest first) to match the expected UI order
    const sortedMessages = messages.reverse();
    
    console.log(`Fetched ${sortedMessages.length} messages for room ${roomId}`);
    return sortedMessages;
  } catch (error: any) {
    console.error('Error fetching messages page:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw new Error(
      `Failed to fetch messages: ${error.message} (Code: ${
        error.code || 'unknown'
      })`,
    );
  }
};

// Listen to messages in a chat room with real-time updates
export const listenToMessages = (
  roomId: string,
  callback: (messages: Message[]) => void,
): (() => void) => {
  try {
    console.log('Setting up message listener for room:', roomId);
    const unsubscribe = firestore()
      .collection('rooms')
      .doc(roomId)
      .collection('messages')
      .orderBy('createdAt', 'asc') // Order by creation time ascending
      .onSnapshot(
        snapshot => {
          const msgs: Message[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              text: data.text || '',
              senderId: data.senderId || '',
              receiverId: data.receiverId || '',
              createdAt: data.createdAt,
              media: data.media || [],
              messageType: data.messageType || 'text',
              status: data.status || 'sent',
              replyTo: data.replyTo || undefined,
              isSeen: data.isSeen || false,
              seenBy: data.seenBy || {},
              voiceUri: data.voiceUri,
              voiceDuration: data.voiceDuration,
              deleted: data.deleted || false,
              deletedAt: data.deletedAt,
              deletedBy: data.deletedBy,
              forwardedFrom: data.forwardedFrom,
            };
          });
          
          console.log(`Messages updated for room ${roomId}:`, msgs.length, 'messages');
          callback(msgs);
        },
        error => {
          console.error('Error in message listener:', {
            message: error.message,
            code: error.code,
            stack: error.stack,
          });
          // Call callback with empty array on error
          callback([]);
        },
      );
    return () => {
      console.log('Removing message listener for room:', roomId);
      unsubscribe();
    };
  } catch (error: any) {
    console.error('Error setting up message listener:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw new Error(
      `Failed to listen to messages: ${error.message} (Code: ${
        error.code || 'unknown'
      })`,
    );
  }
};


// Function to set up presence for the current user
export const setupUserPresence = async (userId) => {
  if (!userId) return;

  const userStatusRef = firestore().collection('status').doc(userId);

  try {
    // Set the user's status to online
    await userStatusRef.set(
      {
        state: 'online',
        last_changed: firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    console.log('User presence set to online:', userId);
  } catch (error) {
    console.error('Error setting up user presence:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
  }
};

// Function to listen to another user's presence
export const listenToUserPresence = (userId, callback) => {
  if (!userId) return () => {};

  const userStatusRef = firestore().collection('status').doc(userId);

  // Listen for changes in the user's status
  const unsubscribe = userStatusRef.onSnapshot(
    (snapshot) => {
      const data = snapshot.data();
      const isOnline = data && data.state === 'online';
      console.log(`User ${userId} presence updated: ${isOnline ? 'online' : 'offline'}`);
     // callback(isOnline);
      console.log("Check status person", isOnline)
    },
    (error) => {
      console.error('Error listening to user presence:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
      callback(false); // Fallback to offline if there's an error
    }
  );

  return unsubscribe; // Return unsubscribe function to clean up the listener
};

// Function to set user offline (call on logout or app unmount)
export const setUserOffline = async (userId) => {
  if (!userId) return;

  const userStatusRef = firestore().collection('status').doc(userId);

  try {
    await userStatusRef.update({
      state: 'offline',
      last_changed: firestore.FieldValue.serverTimestamp(),
    });
    console.log('User presence set to offline:', userId);
  } catch (error) {
    console.error('Error setting user offline:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (
  roomId: string,
  userId: string
): Promise<void> => {
  try {
    // reference to messages collection
    console.log("called  by user", userId)
    const messagesRef = firestore()
      .collection('rooms')
      .doc(roomId) // ⚠️ make sure you're using consistent roomId (not `${userId}_${roomId}`)
      .collection('messages');

    // query unseen messages
    const snapshot = await messagesRef
      .where(`seenBy.${userId}`, '==', false)
      .get();

    const batch = firestore().batch();

    snapshot.forEach(docSnap => {
      batch.update(docSnap.ref, {
        [`seenBy.${userId}`]: true,
        isSeen: true, // optional: if you want a global flag
      });
    });

    // also update the room-level metadata
    const roomRef = firestore().collection('rooms').doc(roomId);
    batch.update(roomRef, {
      unreadCount: 0,
      lastReadAt: firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit();

    console.log(`✅ Marked ${snapshot.size} messages as unread for user: ${userId}`);
  } catch (error) {
    console.error('❌ Error marking messages as read:', error);
  }
};

// Delete a message
export const deleteMessage = async (
  roomId: string,
  messageId: string,
  userId: string
): Promise<void> => {
  try {
    const messageRef = firestore()
      .collection('rooms')
      .doc(roomId)
      .collection('messages')
      .doc(messageId);

    const messageDoc = await messageRef.get();
    if (!messageDoc.exists) {
      throw new Error('Message not found');
    }

    const messageData = messageDoc.data() as Message;
    
    // Check if user is the sender
    if (messageData.senderId !== userId) {
      throw new Error('You can only delete your own messages');
    }

    // Update message as deleted
    await messageRef.update({
      deleted: true,
      deletedAt: firestore.FieldValue.serverTimestamp(),
      deletedBy: userId,
      text: 'This message was deleted'
    });

    console.log('Message deleted successfully:', messageId);
  } catch (error: any) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

// Pin a message
export const pinMessage = async (
  roomId: string,
  messageId: string,
  userId: string
): Promise<void> => {
  try {
    const roomRef = firestore().collection('rooms').doc(roomId);
    const messageRef = roomRef.collection('messages').doc(messageId);

    const messageDoc = await messageRef.get();
    if (!messageDoc.exists) {
      throw new Error('Message not found');
    }

    // Add to pinned messages in room
    await roomRef.update({
      pinnedMessages: firestore.FieldValue.arrayUnion({
        messageId,
        pinnedBy: userId,
        pinnedAt: firestore.FieldValue.serverTimestamp(),
        text: messageDoc.data()?.text || '',
        senderId: messageDoc.data()?.senderId || ''
      })
    });

    console.log('Message pinned successfully:', messageId);
  } catch (error: any) {
    console.error('Error pinning message:', error);
    throw error;
  }
};

// Forward a message to multiple friends
export const forwardMessage = async (
  originalMessage: Message,
  friendIds: string[],
  currentUserId: string
): Promise<void> => {
  try {
    const batch = firestore().batch();
    const serverTimestamp = firestore.FieldValue.serverTimestamp();

    for (const friendId of friendIds) {
      // Get or create room for each friend
      const roomId = generateRoomId(currentUserId, friendId);
      const roomRef = firestore().collection('rooms').doc(roomId);
      const messageRef = roomRef.collection('messages').doc();

      // Create forwarded message
      const forwardedMessage: Message = {
        text: originalMessage.text,
        senderId: currentUserId,
        receiverId: friendId,
        createdAt: serverTimestamp,
        messageType: originalMessage.messageType || 'text',
        status: 'sent',
        media: originalMessage.media || [],
        isSeen: false,
        seenBy: {
          [currentUserId]: true,
          [friendId]: false
        },
        forwardedFrom: {
          messageId: originalMessage.id || '',
          roomId: originalMessage.id?.split('_')[0] || '', // Extract original room from message context
          originalSenderId: originalMessage.senderId,
          forwardedAt: serverTimestamp
        }
      };

      batch.set(messageRef, forwardedMessage);

      // Update room's last message
      const lastMessageText = originalMessage.text || 
        (originalMessage.messageType === 'image' ? '📷 Forwarded Image' :
         originalMessage.messageType === 'video' ? '🎥 Forwarded Video' : 
         '📄 Forwarded Message');

      batch.set(roomRef, {
        participants: [currentUserId, friendId],
        lastMessage: lastMessageText,
        lastMessageAt: serverTimestamp,
        createdAt: serverTimestamp
      }, { merge: true });

      // Update chats collection
      const chatDocs = await firestore()
        .collection('chats')
        .where('roomId', '==', roomId)
        .get();

      chatDocs.forEach(doc => {
        batch.update(doc.ref, {
          lastMessage: lastMessageText,
          lastMessageAt: serverTimestamp,
          ...(doc.id.startsWith(currentUserId) ? {} : { 
            unreadCount: firestore.FieldValue.increment(1) 
          })
        });
      });
    }

    await batch.commit();
    console.log('Message forwarded successfully to', friendIds.length, 'friends');
  } catch (error: any) {
    console.error('Error forwarding message:', error);
    throw error;
  }
};

// Get friends list for forwarding
export const getFriendsList = async (userId: string): Promise<any[]> => {
  try {
    const friendsSnapshot = await firestore()
      .collection('users')
      .doc(userId)
      .collection('friends')
      .get();

    const friendIds = friendsSnapshot.docs.map(doc => doc.id);
    
    if (friendIds.length === 0) {
      return [];
    }

    // Get friend details
    const friendsDetails = await Promise.all(
      friendIds.map(async (friendId) => {
        const userDoc = await firestore().collection('users').doc(friendId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          return {
            id: friendId,
            name: userData?.name || userData?.email || 'Unknown',
            email: userData?.email || '',
            avatar: userData?.avatar || null
          };
        }
        return null;
      })
    );

    return friendsDetails.filter(friend => friend !== null);
  } catch (error: any) {
    console.error('Error getting friends list:', error);
    throw error;
  }
};

// Function to create mock messages for testing bidirectional chat
export const createMockMessages = async (roomId: string, userId1: string, userId2: string): Promise<void> => {
  try {
    const roomRef = firestore().collection('rooms').doc(roomId);
    const messagesRef = roomRef.collection('messages');
    const serverTimestamp = firestore.FieldValue.serverTimestamp();
    
    const mockMessages: Omit<Message, 'id'>[] = [
      {
        text: "Hey there! How are you doing?",
        senderId: userId1,
        createdAt: serverTimestamp,
        messageType: 'text',
        status: 'sent',
        isSeen: false,
        seenBy: {}
      },
      {
        text: "I'm doing great! Thanks for asking. How about you?",
        senderId: userId2,
        createdAt: serverTimestamp,
        messageType: 'text',
        status: 'sent',
        isSeen: false,
        seenBy: {}
      },
      {
        text: "I'm good too! Just working on some React Native stuff.",
        senderId: userId1,
        createdAt: serverTimestamp,
        messageType: 'text',
        status: 'sent',
        isSeen: false,
        seenBy: {}
      },
      {
        text: "That sounds interesting! What kind of app are you building?",
        senderId: userId2,
        createdAt: serverTimestamp,
        messageType: 'text',
        status: 'sent',
        isSeen: false,
        seenBy: {}
      },
      {
        text: "It's a chat application with Firebase backend. Pretty cool so far!",
        senderId: userId1,
        createdAt: serverTimestamp,
        messageType: 'text',
        status: 'sent',
        isSeen: false,
        seenBy: {}
      }
    ];

    // Add messages with slight delays to maintain order
    for (let i = 0; i < mockMessages.length; i++) {
      const messageRef = messagesRef.doc();
      await messageRef.set({
        ...mockMessages[i],
        createdAt: firestore.Timestamp.fromMillis(Date.now() + i * 1000) // Add 1 second between each
      });
    }

    // Update room with last message
    await roomRef.update({
      lastMessage: mockMessages[mockMessages.length - 1].text,
      lastMessageAt: serverTimestamp
    });

    console.log('Mock messages created successfully for room:', roomId);
  } catch (error: any) {
    console.error('Error creating mock messages:', error);
  }
};
