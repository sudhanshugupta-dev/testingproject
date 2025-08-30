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
    // Query for existing rooms where the current user is a participant
    const roomsSnapshot = await firestore()
      .collection('rooms')
      .where('participants', 'array-contains', userId1)
      .get();

    // Check if any room has exactly the two participants
    for (const doc of roomsSnapshot.docs) {
      const participants = doc.data().participants as string[];
      if (
        participants.length === 2 &&
        participants.includes(userId1) &&
        participants.includes(userId2)
      ) {
        console.log('Existing chat room found:', doc.id);
        // Ensure chats collection has entries for both users
        const roomId = doc.id;
        await ensureChatEntries(roomId, userId1, userId2);
        return roomId;
      }
    }

    // No existing room found, create a new one
    const roomId = generateRoomId(userId1, userId2);
    const roomRef = firestore().collection('rooms').doc(roomId);

    await roomRef.set({
      participants: [userId1, userId2],
      createdAt: Date.now(),
      lastMessage: '',
      lastMessageAt: null,
    });

    // Create or update chats collection for both users
    await ensureChatEntries(roomId, userId1, userId2);

    console.log('New chat room created:', roomId);
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
  // For user1
  const user1ChatRef = firestore()
    .collection('rooms')
    .doc(`${userId1}_${roomId}`);
  const user1ChatDoc = await user1ChatRef.get();
  if (!user1ChatDoc.exists) {
    // Fetch user2 details for name and avatar
    const user2Doc = await firestore().collection('users').doc(userId2).get();
    const user2Data = user2Doc.data() || {};
    await user1ChatRef.set({
      roomId,
      participants: [userId1, userId2],
      lastMessage: '',
      lastMessageAt: null,
      name: (user2Data as any).name || 'Unknown',
      avatar: (user2Data as any).avatar || null,
    });
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

  // 1. Listen to my friends
  const unsubFriends = listenToFriends(friendIds => {
    // Clear old listeners
    unsubscribes.forEach(unsub => unsub());
    unsubscribes = [];

    const chats: Record<string, ChatItem> = {};

    friendIds.forEach(friendId => {
      const unsubChat = listenToChatForFriend(friendId, chatItem => {
        console.log("Chat Item kya hai", chatItem)
        if (chatItem) {
          chats[friendId] = chatItem;
          // Sort by lastMessage timestamp
          const sorted = Object.values(chats).sort((a, b) => {
            const t1 = a.lastMessage?.timestamp?.toMillis?.() || 0;
            const t2 = b.lastMessage?.timestamp?.toMillis?.() || 0;
            return t2 - t1;
          });
          onData(sorted);
        }
      });

      unsubscribes.push(unsubChat as any);
    });
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


// Message interface for better typing
export interface Message {
  id?: string;
  text: string;
  senderId: string;
  createdAt: any;
  messageType?: 'text' | 'image' | 'file';
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  replyTo?: {
    messageId: string;
    text: string;
    senderId: string;
    senderName?: string;
  };
  isSeen : boolean;
  seenBy : {
     
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
  message: { text: string; senderId: string; createdAt: number, receiverId: string},
): Promise<void> => {
  try {
    const userId = auth().currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    if (message.senderId !== userId)
      throw new Error('Sender ID does not match authenticated user');
    const friendId = message.senderId;
    console.log('Sending message to room:', roomId, message, ":sf", userId);
    console.log(userId, "user", "friend", message.receiverId)


    const roomRef = firestore().collection('rooms').doc(roomId);
    const messageRef = roomRef.collection('messages').doc();
    const serverTimestamp = firestore.FieldValue.serverTimestamp();
    const receiverId = message.receiverId

   
    const messageData: Message = {
      text: message.text,
      senderId: message.senderId,
      createdAt: serverTimestamp,
      messageType: 'text',
      status: 'sent',
      isSeen: 'false',
      seenBy: {
        [userId]: true,   // sender automatically sees their own
        [receiverId]: false // receiver starts unseen
  }
    };

    const batch = firestore().batch();

    // Add message to messages subcollection
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
    console.log('Message sent successfully');
  } catch (error: any) {
    console.error('Error sending message:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw new Error(
      `Failed to send message: ${error.message} (Code: ${
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
              createdAt: data.createdAt,
              messageType: data.messageType || 'text',
              status: data.status || 'sent',
              replyTo: data.replyTo || undefined
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
        status: 'sent'
      },
      {
        text: "I'm doing great! Thanks for asking. How about you?",
        senderId: userId2,
        createdAt: serverTimestamp,
        messageType: 'text',
        status: 'sent'
      },
      {
        text: "I'm good too! Just working on some React Native stuff.",
        senderId: userId1,
        createdAt: serverTimestamp,
        messageType: 'text',
        status: 'sent'
      },
      {
        text: "That sounds interesting! What kind of app are you building?",
        senderId: userId2,
        createdAt: serverTimestamp,
        messageType: 'text',
        status: 'sent'
      },
      {
        text: "It's a chat application with Firebase backend. Pretty cool so far!",
        senderId: userId1,
        createdAt: serverTimestamp,
        messageType: 'text',
        status: 'sent'
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
