import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

type ChatItem = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  roomId: string;
  isGroup?: boolean;
  groupName?: string;
  participants?: string[];
  lastMessage: {
    text: string;
    timestamp: any;
    senderId: string;
    isSeen: boolean;
    messageType?: string;
    seenBy?: Record<string, boolean>;
  } | null;
  unseenCount: number;
};


// Generate consistent room ID for two users
export const generateRoomId = (userId1: string, userId2: string): string => {
  return [userId1, userId2].sort().join('_');
};

// Create or get a chat room
export const getOrCreateChatRoom = async (
  userId1: string,
  userId2: string,
): Promise<string> => {
  try {
  
    // Generate consistent room ID (sorted to ensure same room for both users)
    const roomId = generateRoomId(userId1, userId2);

    // Check if room already exists
    const roomRef = firestore().collection('rooms').doc(roomId);
    const roomDoc = await roomRef.get();
    
    if (roomDoc.exists()) {
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
    
    // Handle self-chat case
    if (userId1 === userId2) {
      // Create single chat entry for self-chat
      const selfChatRef = firestore().collection('chats').doc(`${userId1}_${roomId}`);
      batch.set(selfChatRef, {
        roomId,
        participants: [userId1],
        lastMessage: '',
        lastMessageAt: null,
        name: `${(user1Data as any)?.name || (user1Data as any)?.email || 'Unknown'} (You)`,
        avatar: (user1Data as any)?.avatar || null,
        unreadCount: 0,
        createdAt: firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    } else {
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
    }
    
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
  const isSelfChat = userId === friendId;

  // 1. Listen to friend profile (or self profile for self-chat)
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

          // 3. Count unseen messages - for self-chat, count messages where seenBy[userId] is false
          // Use seenBy flags to compute unseen messages for the current user
          const unseenQuery = firestore()
            .collection('rooms')
            .doc(roomId)
            .collection('messages')
            .where(`seenBy.${userId}`, '==', false);

          unseenQuery.onSnapshot(unseenSnap => {
            const unseenCount = unseenSnap?.size ?? 0;

            const chatItem: ChatItem = {
              id: friendDoc.id,
              name: isSelfChat 
                ? `${friendData.name || friendData.email || 'Unknown'} (You)` 
                : friendData.name || 'Unknown',
              email: friendData.email || 'No email',
              avatar: friendData.avatar || null,
              roomId,
              lastMessage: lastMsg
                ? {
                    text: lastMsg.text || '',
                    timestamp: lastMsg?.createdAt ? lastMsg.createdAt.toDate().getTime() : null,
                    senderId: lastMsg.senderId || null,
                    // Derive isSeen from seenBy map for the current user; fallback to message-level isSeen
                    isSeen: (lastMsg.seenBy && lastMsg.seenBy[userId] === true) || !!lastMsg.isSeen,
                    messageType: lastMsg.messageType || 'text',
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


// 🔹 Listen to full chat list (realtime, sorted) - includes individual and group chats
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

  // Listen to all chats where user is a participant (both individual and group)
  const unsubAllChats = firestore()
    .collection('chats')
    .where('participants', 'array-contains', userId)
    .onSnapshot(
      snapshot => {
        const chats: Record<string, ChatItem> = {};
        
        snapshot.docs.forEach(doc => {
          const chatData = doc.data();
          const roomId = chatData.roomId;
          
          // Listen to the room for real-time updates
          const unsubRoom = firestore()
            .collection('rooms')
            .doc(roomId)
            .onSnapshot(roomDoc => {
              if (!roomDoc.exists()) return;
              
              const roomData = roomDoc.data();
              
              // Get last message
              const lastMsgUnsub = firestore()
                .collection('rooms')
                .doc(roomId)
                .collection('messages')
                .orderBy('createdAt', 'desc')
                .limit(1)
                .onSnapshot(lastMsgSnap => {
                  const lastMsg = lastMsgSnap.docs[0]?.data();

                  // Count unseen messages for current user
                  const unseenQuery = firestore()
                    .collection('rooms')
                    .doc(roomId)
                    .collection('messages')
                    .where(`seenBy.${userId}`, '==', false);

                  unseenQuery.onSnapshot(unseenSnap => {
                    const unseenCount = unseenSnap?.size ?? 0;

                    let chatItem: ChatItem;
                    
                    if (roomData?.isGroup) {
                      // Group chat
                      chatItem = {
                        id: roomId,
                        name: roomData.groupName || 'Group',
                        email: `${roomData.participants?.length || 0} members`,
                        avatar: null,
                        roomId,
                        isGroup: true,
                        groupName: roomData.groupName,
                        participants: roomData.participants || [],
                        lastMessage: lastMsg
                          ? {
                              text: lastMsg.text || '',
                              timestamp: lastMsg?.createdAt ? lastMsg.createdAt.toDate().getTime() : null,
                              senderId: lastMsg.senderId || null,
                              isSeen: (lastMsg.seenBy && lastMsg.seenBy[userId] === true) || !!lastMsg.isSeen,
                              messageType: lastMsg.messageType || 'text',
                              seenBy: lastMsg.seenBy,
                            }
                          : null,
                        unseenCount,
                      };
                    } else {
                      // Individual chat - find the other participant
                      const otherParticipantId = roomData?.participants?.find((id: string) => id !== userId);
                      if (!otherParticipantId) return;
                      
                      // Get other participant's details
                      firestore()
                        .collection('users')
                        .doc(otherParticipantId)
                        .get()
                        .then(userDoc => {
                          const userData = userDoc.data();
                          const isSelfChat = userId === otherParticipantId;
                          
                          chatItem = {
                            id: otherParticipantId,
                            name: isSelfChat 
                              ? `${userData?.name || userData?.email || 'Unknown'} (You)` 
                              : userData?.name || 'Unknown',
                            email: userData?.email || 'No email',
                            avatar: userData?.avatar || null,
                            roomId,
                            isGroup: false,
                            lastMessage: lastMsg
                              ? {
                                  text: lastMsg.text || '',
                                  timestamp: lastMsg?.createdAt ? lastMsg.createdAt.toDate().getTime() : null,
                                  senderId: lastMsg.senderId || null,
                                  isSeen: (lastMsg.seenBy && lastMsg.seenBy[userId] === true) || !!lastMsg.isSeen,
                                  messageType: lastMsg.messageType || 'text',
                                  seenBy: lastMsg.seenBy,
                                }
                              : null,
                            unseenCount,
                          };
                          
                          chats[roomId] = chatItem;
                          
                          // Sort and emit updated list
                          const sorted = Object.values(chats).sort((a, b) => {
                            const getTimestamp = (chat: ChatItem) => {
                              if (!chat.lastMessage?.timestamp) return 0;
                              const timestamp = chat.lastMessage.timestamp;
                              if (timestamp && typeof timestamp.toMillis === 'function') {
                                return timestamp.toMillis();
                              }
                              if (typeof timestamp === 'number') {
                                return timestamp;
                              }
                              if (timestamp instanceof Date) {
                                return timestamp.getTime();
                              }
                              if (typeof timestamp === 'string') {
                                return new Date(timestamp).getTime();
                              }
                              return 0;
                            };
                            
                            const t1 = getTimestamp(a);
                            const t2 = getTimestamp(b);
                            
                            return t2 - t1; // Most recent first
                          });

                          onData(sorted);
                        });
                      return;
                    }
                    
                    chats[roomId] = chatItem;
                    
                    // Sort and emit updated list
                    const sorted = Object.values(chats).sort((a, b) => {
                      const getTimestamp = (chat: ChatItem) => {
                        if (!chat.lastMessage?.timestamp) return 0;
                        const timestamp = chat.lastMessage.timestamp;
                        if (timestamp && typeof timestamp.toMillis === 'function') {
                          return timestamp.toMillis();
                        }
                        if (typeof timestamp === 'number') {
                          return timestamp;
                        }
                        if (timestamp instanceof Date) {
                          return timestamp.getTime();
                        }
                        if (typeof timestamp === 'string') {
                          return new Date(timestamp).getTime();
                        }
                        return 0;
                      };
                      
                      const t1 = getTimestamp(a);
                      const t2 = getTimestamp(b);
                      
                      return t2 - t1; // Most recent first
                    });

                    onData(sorted);
                  });
                });
            });
          
          unsubscribes.push(unsubRoom);
        });
      },
      error => {
        console.error('Error listening to chat list:', error);
        if (onError) onError(error);
      }
    );

  unsubscribes.push(unsubAllChats);

  return () => {
    try {
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
  messageType?: 'text' | 'image' | 'video' | 'voice' | 'mixed' | 'gif' | 'sticker' | 'audio' | 'file';
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
    receiverId?: string | null;
    messageType?: string;
    media?: { uri: string; type: string }[];
    isGroup?: boolean;
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

    console.log("Sending message to room:", roomId, JSON.stringify(message, null, 2), ":sf", userId);

    const roomRef = firestore().collection("rooms").doc(roomId);
    const messageRef = roomRef.collection("messages").doc();
    const serverTimestamp = firestore.FieldValue.serverTimestamp();
    const receiverId = message.receiverId;

    // ✅ Use messageType from Container or determine from media
    let messageType: 'text' | 'image' | 'video' | 'voice' | 'mixed' | 'gif' | 'sticker' | 'audio' | 'file' = message.messageType as any || "text";
    
    // Only auto-detect if no messageType provided (backward compatibility)
    if (!message.messageType && message.media && message.media.length > 0) {
      const hasImages = message.media.some(m => m.type.startsWith("image"));
      const hasVideos = message.media.some(m => m.type.startsWith("video"));
      const hasGifs = message.media.some(m => m.type === "image/gif");

      if (hasGifs) messageType = "gif";
      else if (hasImages && hasVideos) messageType = "mixed";
      else if (hasVideos) messageType = "video";
      else if (hasImages) messageType = "image";
    }
    

    // ✅ Pick preview text for lastMessage
    let lastMessagePreview = message.text || "";
    if (!lastMessagePreview && messageType !== "text") {
      if (messageType === "gif") lastMessagePreview = "🎭 GIF";
      else if (messageType === "sticker") lastMessagePreview = "😊 Sticker";
      else if (messageType === "voice" || messageType === "audio") lastMessagePreview = "🎤 Voice";
      else if (messageType === "image") lastMessagePreview = "📷 Image";
      else if (messageType === "video") lastMessagePreview = "🎥 Video";
      else if (messageType === "mixed") lastMessagePreview = "📷🎥 Media";
      else lastMessagePreview = "📎 File";
    }

    // Get sender name for group messages
    let senderName = '';
    if (message.isGroup) {
      try {
        const senderProfile = await getUserProfile(userId);
        senderName = senderProfile?.displayName || senderProfile?.name || senderProfile?.email?.split('@')[0] || 'User';
      } catch (error) {
        console.log('Could not fetch sender profile for message:', userId);
        senderName = 'User';
      }
    }

    // Build seenBy object based on chat type
    let seenByObj: Record<string, boolean> = {};
    if (message.isGroup) {
      // For group chats, get all participants and set seenBy for each
      const roomDoc = await firestore().collection('rooms').doc(roomId).get();
      const roomData = roomDoc.data();
      const participants = roomData?.participants || [];
      
      participants.forEach((participantId: string) => {
        seenByObj[participantId] = participantId === userId; // Only sender has seen it initially
      });
    } else {
      // For 1-on-1 chats
      seenByObj = {
        [userId]: true, // sender auto sees own
        ...(receiverId && { [receiverId]: false }), // receiver starts unseen
      };
    }

    const messageData: Message = {
      id: messageRef.id,
      text: messageType === 'gif' ? '' : message.text, // Don't save text for GIF messages
      senderId: userId,
      ...(receiverId && { receiverId }), // Only include receiverId if it exists
      createdAt: serverTimestamp,
      messageType,
      status: "sent",
      isSeen: false,
      media: message.media || [],
      ...(message.isGroup && { senderName }), // Add sender name for group messages
      seenBy: seenByObj,
    };

    console.log("Final messageData being sent to Firebase:", JSON.stringify(messageData, null, 2));

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

    // For group chats, check if members are still active
    let activeMembers = null;
    if (message.isGroup) {
      const roomDoc = await firestore().collection("rooms").doc(roomId).get();
      if (roomDoc.exists()) {
        const roomData = roomDoc.data();
        activeMembers = roomData?.members || {};
      }
    }

    chatDocs.forEach((doc) => {
      const chatData = doc.data();
      const userId = doc.id.split('_')[0]; // Extract user ID from chat document ID
      
      // For group chats, only update if user is still an active member
      if (message.isGroup && activeMembers) {
        if (!activeMembers[userId] || !activeMembers[userId].isActive) {
          return; // Skip inactive members
        }
      }

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
      .orderBy('createdAt', 'desc') // Order by creation time descending (newest first)
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
              senderName: data.senderName || '', // Get sender name from stored data
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

    // reset unreadCount for the current user's chat doc for this room
    const chatsSnap = await firestore()
      .collection('chats')
      .where('roomId', '==', roomId)
      .get();

    chatsSnap.forEach(docSnap => {
      // chat doc id format: `${userId}_${roomId}`
      if (docSnap.id.startsWith(userId)) {
        batch.update(docSnap.ref, {
          unreadCount: 0,
        });
      }
    });

    await batch.commit();

    console.log(`✅ Marked ${snapshot.size} messages as read for user: ${userId}`);
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

// // Forward a message to multiple friends
// export const forwardMessage = async (
//   originalMessage: Message,
//   friendIds: string[],
//   currentUserId: string,
//   forwarded : boolean,
// ): Promise<void> => {
//   try {
//     const batch = firestore().batch();
//     const serverTimestamp = firestore.FieldValue.serverTimestamp();

//     console.log("original  message", currentUserId, forwarded)
//     for (const friendId of friendIds) {
//       // Get or create room for each friend
//       console.log("firendId", friendId)
//       const roomId = generateRoomId(currentUserId, friendId);
//       const roomRef = firestore().collection('rooms').doc(roomId);
//       const messageRef = roomRef.collection('messages').doc();

//       // Create forwarded message
//       const forwardedMessage: Message = {
//         text: originalMessage.text,
//         senderId: currentUserId,
//         receiverId: friendId,
//         createdAt: serverTimestamp,
//         messageType: originalMessage.messageType || 'text',
//         status: 'sent',
//         media: originalMessage.media || [],
//         isSeen: false,
//         seenBy: {
//           [currentUserId]: true,
//           [friendId]: false
//         },
//         forwardedFrom: {
//           messageId: originalMessage.id || '',
//           roomId: originalMessage.id?.split('_')[0] || '', // Extract original room from message context
//           originalSenderId: originalMessage.senderId,
//           forwardedAt: serverTimestamp
//         }
//       };

//       batch.set(messageRef, forwardedMessage);

//       console.log("forwoard messsafe", forwardedMessage)
//       // Update room's last message
//       const lastMessageText = originalMessage.text || 
//         (originalMessage.messageType === 'image' ? '📷 Forwarded Image' :
//          originalMessage.messageType === 'video' ? '🎥 Forwarded Video' : 
//          '📄 Forwarded Message');

//       batch.set(roomRef, {
//         participants: [currentUserId, friendId],
//         lastMessage: lastMessageText,
//         lastMessageAt: serverTimestamp,
//         createdAt: serverTimestamp
//       }, { merge: true });

//       // Update chats collection
//       const chatDocs = await firestore()
//         .collection('chats')
//         .where('roomId', '==', roomId)
//         .get();

//       chatDocs.forEach(doc => {
//         batch.update(doc.ref, {
//           lastMessage: lastMessageText,
//           lastMessageAt: serverTimestamp,
//           ...(doc.id.startsWith(currentUserId) ? {} : { 
//             unreadCount: firestore.FieldValue.increment(1) 
//           })
//         });
//       });
//     }

//     await batch.commit();
//     console.log('Message forwarded successfully to', friendIds.length, 'friends');
//   } catch (error: any) {
//     console.error('Error forwarding message:', error);
//     throw error;
//   }
// };


export const forwardMessage = async (
  originalMessage: Message,
  friendIds: string[],
  currentUserId: string,
  forwarded?: boolean // optional now
): Promise<void> => {
  if (!friendIds.length) return;

  try {
    const batch = firestore().batch();
    const serverTimestamp = firestore.FieldValue.serverTimestamp();

    for (const friendId of friendIds) {
      const roomId = generateRoomId(currentUserId, friendId);
      const roomRef = firestore().collection('rooms').doc(roomId);
      const messageRef = roomRef.collection('messages').doc();

      // Build forwarded message
      const forwardedMessage: Message = {
        text: originalMessage.text || '',
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
        // Only include forwardedFrom if forwarded flag is true
        ...(forwarded
          ? {
              forwardedFrom: {
                messageId: originalMessage.id || '',
                roomId: originalMessage.roomId || roomId,
                originalSenderId: originalMessage.senderId,
                forwardedAt: serverTimestamp
              }
            }
          : {})
      };

      batch.set(messageRef, forwardedMessage);

      // Determine last message text for room display
      const lastMessageText =
        originalMessage.text ||
        (originalMessage.messageType === 'image'
          ? '📷 Forwarded Image'
          : originalMessage.messageType === 'video'
          ? '🎥 Forwarded Video'
          : '📄 Forwarded Message');

      // Update room info
      batch.set(
        roomRef,
        {
          participants: [currentUserId, friendId],
          lastMessage: lastMessageText,
          lastMessageAt: serverTimestamp,
          createdAt: serverTimestamp
        },
        { merge: true }
      );

      // Update chats collection (increment unread count for friend)
      const chatDocs = await firestore()
        .collection('chats')
        .where('roomId', '==', roomId)
        .get();

      chatDocs.forEach((doc) => {
        batch.update(doc.ref, {
          lastMessage: lastMessageText,
          lastMessageAt: serverTimestamp,
          ...(doc.id.startsWith(currentUserId)
            ? {}
            : { unreadCount: firestore.FieldValue.increment(1) })
        });
      });
    }

    await batch.commit();
    console.log(
      `Message forwarded successfully to ${friendIds.length} friend(s)`
    );
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
        if (userDoc.exists()) {
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

// Generate group room ID from multiple user IDs
export const generateGroupRoomId = (userIds: string[]): string => {
  // Sort user IDs to ensure consistent room ID generation
  const sortedIds = [...userIds].sort();
  return `group_${sortedIds.join('_')}_${Date.now()}`;
};

// Create or get a group chat room
export const createGroupChatRoom = async (
  participantIds: string[],
  groupName: string = 'Group',
  creatorId: string
): Promise<string> => {
  try {
    if (participantIds.length < 2) {
      throw new Error('Group must have at least 2 participants');
    }

    // Generate unique group room ID
    const roomId = generateGroupRoomId(participantIds);
    console.log('Creating group chat room:', roomId);

    // Check if room already exists
    const roomRef = firestore().collection('rooms').doc(roomId);
    const roomDoc = await roomRef.get();
    
    if (roomDoc.exists()) {
      console.log('Group chat room already exists:', roomId);
      return roomId;
    }
    
    // Create new group room with member tracking
    const membersObject = participantIds.reduce((acc, userId) => {
      acc[userId] = {
        isActive: true,
        joinedAt: firestore.FieldValue.serverTimestamp(),
        role: userId === creatorId ? 'admin' : 'member'
      };
      return acc;
    }, {} as Record<string, any>);

    await roomRef.set({
      participants: participantIds,
      members: membersObject, // Track each member's status
      groupName,
      isGroup: true,
      createdAt: firestore.FieldValue.serverTimestamp(),
      lastMessage: '',
      lastMessageAt: null,
      createdBy: creatorId,
      admins: [creatorId], // Creator is admin by default
    });
    
    // Create chat entries for all participants
    await createGroupChatEntries(roomId, participantIds, groupName);
    
    console.log('New group chat room created successfully:', roomId);
    return roomId;
  } catch (error: any) {
    console.error('Error creating group chat room:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw new Error(
      `Failed to create group chat room: ${error.message} (Code: ${
        error.code || 'unknown'
      })`,
    );
  }
};

// Helper function to create chat entries for all group participants
const createGroupChatEntries = async (
  roomId: string,
  participantIds: string[],
  groupName: string
) => {
  try {
    const batch = firestore().batch();
    
    // Get all participant details
    const participantDocs = await Promise.all(
      participantIds.map((id: string) => firestore().collection('users').doc(id).get())
    );
    
    const participantData = participantDocs.map(doc => ({
      id: doc.id,
      data: doc.exists ? doc.data() : {}
    }));
    
    // Create chat entry for each participant
    participantIds.forEach(participantId => {
      const chatRef = firestore().collection('chats').doc(`${participantId}_${roomId}`);
      
      // Get other participants for group avatar/name display
      const otherParticipants = participantData.filter(p => p.id !== participantId);
      const displayName = groupName || `Group (${otherParticipants.length + 1})`;
      
      batch.set(chatRef, {
        roomId,
        participants: participantIds,
        isGroup: true,
        groupName: displayName,
        lastMessage: '',
        lastMessageAt: null,
        name: displayName,
        avatar: null, // Groups don't have avatars initially
        unreadCount: 0,
        createdAt: firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    });
    
    await batch.commit();
    console.log('Group chat entries created for room:', roomId);
  } catch (error) {
    console.error('Error creating group chat entries:', error);
    throw error;
  }
};

// Add members to existing group
export const addMembersToGroup = async (
  roomId: string,
  newMemberIds: string[],
  addedBy: string
): Promise<void> => {
  try {
    if (newMemberIds.length === 0) {
      throw new Error('No members to add');
    }

    const roomRef = firestore().collection('rooms').doc(roomId);
    const roomDoc = await roomRef.get();
    
    if (!roomDoc.exists()) {
      throw new Error('Group not found');
    }

    const roomData = roomDoc.data();
    if (!roomData?.isGroup) {
      throw new Error('This is not a group chat');
    }

    const currentParticipants = roomData.participants || [];
    const groupName = roomData.groupName || 'Group';
    const currentMembers = roomData.members || {};
    
    // Separate members into new and existing (inactive) members
    const newMembers: string[] = [];
    const reactivatingMembers: string[] = [];
    
    newMemberIds.forEach(memberId => {
      // Skip if already active in participants
      if (currentParticipants.includes(memberId)) {
        return;
      }
      
      // Check if member exists in members object
      if (currentMembers[memberId]) {
        // Member exists but is inactive, reactivate them
        reactivatingMembers.push(memberId);
      } else {
        // Completely new member
        newMembers.push(memberId);
      }
    });
    
    const allMembersToAdd = [...newMembers, ...reactivatingMembers];
    
    if (allMembersToAdd.length === 0) {
      console.log('All selected members are already active in the group');
      return;
    }

    const updatedParticipants = [...currentParticipants, ...allMembersToAdd];
    const updatedMembers = { ...currentMembers };
    
    // Handle new members
    newMembers.forEach(memberId => {
      updatedMembers[memberId] = {
        isActive: true,
        addedAt: firestore.FieldValue.serverTimestamp(),
        addedBy: addedBy
      };
    });
    
    // Handle reactivating existing members
    reactivatingMembers.forEach(memberId => {
      updatedMembers[memberId] = {
        ...updatedMembers[memberId],
        isActive: true,
        reactivatedAt: firestore.FieldValue.serverTimestamp(),
        reactivatedBy: addedBy
      };
    });
    
    // Update room with new participants and members
    await roomRef.update({
      participants: updatedParticipants,
      members: updatedMembers,
      lastMessage: `${allMembersToAdd.length} member(s) added to the group`,
      lastMessageAt: firestore.FieldValue.serverTimestamp(),
    });

    // Create chat entries for new members only (not reactivating members)
    if (newMembers.length > 0) {
      await createGroupChatEntries(roomId, newMembers, groupName);
    }
    
    // Update existing chat entries with new participant list
    const existingChatDocs = await firestore()
      .collection('chats')
      .where('roomId', '==', roomId)
      .get();

    const batch = firestore().batch();
    existingChatDocs.forEach(doc => {
      batch.update(doc.ref, {
        participants: updatedParticipants,
        lastMessage: `${allMembersToAdd.length} member(s) added to the group`,
        lastMessageAt: firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
    console.log(`Successfully added ${allMembersToAdd.length} members to group (${newMembers.length} new, ${reactivatingMembers.length} reactivated):`, roomId);
  } catch (error: any) {
    console.error('Error adding members to group:', error);
    throw error;
  }
};

// Get group details
export const getGroupDetails = async (roomId: string): Promise<any> => {
  try {
    const roomRef = firestore().collection('rooms').doc(roomId);
    const roomDoc = await roomRef.get();
    
    console.log('🔍 Getting group details for roomId:', roomId);
    
    if (!roomDoc.exists()) {
      console.error('❌ Room document does not exist:', roomId);
      throw new Error('Group not found');
    }

    const roomData = roomDoc.data();
    console.log('📄 Room data:', roomData);
    
    if (!roomData?.isGroup) {
      console.error('❌ Not a group chat:', roomData);
      throw new Error('This is not a group chat');
    }

    // Return the raw room data with participant IDs (not user objects)
    const result = {
      roomId,
      groupName: roomData.groupName || 'Group',
      participants: roomData.participants || [], // Keep as array of IDs
      admins: roomData.admins || [],
      members: roomData.members || {}, // Include members object
      createdBy: roomData.createdBy,
      createdAt: roomData.createdAt,
      isGroup: true
    };
    
    console.log('✅ Group details result:', result);
    return result;
  } catch (error: any) {
    console.error('❌ Error getting group details:', error);
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


// Add user back to group
export const addUserToGroup = async (
  roomId: string,
  userIdToAdd: string,
  adminId: string
): Promise<void> => {
  try {
    const roomRef = firestore().collection('rooms').doc(roomId);
    const roomDoc = await roomRef.get();
    
    if (!roomDoc.exists()) {
      throw new Error('Group not found');
    }
    
    const roomData = roomDoc.data();
    
    // Check if admin has permission
    if (!roomData?.admins?.includes(adminId)) {
      throw new Error('Only admins can add members');
    }
    
    // Add/reactivate member
    await roomRef.update({
      [`members.${userIdToAdd}`]: {
        isActive: true,
        joinedAt: firestore.FieldValue.serverTimestamp(),
        role: 'member',
        addedBy: adminId
      }
    });
    
    // Add to participants array if not already there
    if (!roomData.participants.includes(userIdToAdd)) {
      await roomRef.update({
        participants: firestore.FieldValue.arrayUnion(userIdToAdd)
      });
    }
    
    // Create/reactivate user's chat entry
    const userChatRef = firestore().collection('chats').doc(`${userIdToAdd}_${roomId}`);
    await userChatRef.set({
      roomId,
      participants: [...roomData.participants, userIdToAdd],
      isGroup: true,
      groupName: roomData.groupName,
      lastMessage: roomData.lastMessage || '',
      lastMessageAt: roomData.lastMessageAt,
      name: roomData.groupName,
      avatar: null,
      unreadCount: 0,
      isActive: true,
      createdAt: firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    
    console.log(`User ${userIdToAdd} added to group ${roomId}`);
  } catch (error: any) {
    console.error('Error adding user to group:', error);
    throw error;
  }
};

// Get active group members
export const getActiveGroupMembers = async (roomId: string): Promise<string[]> => {
  try {
    const roomDoc = await firestore().collection('rooms').doc(roomId).get();
    
    if (!roomDoc.exists()) {
      throw new Error('Group not found');
    }
    
    const roomData = roomDoc.data();
    const members = roomData?.members || {};
    
    // Return only active member IDs
    return Object.keys(members).filter(userId => members[userId].isActive);
  } catch (error: any) {
    console.error('Error getting active group members:', error);
    throw error;
  }
};

// Update group name
export const updateGroupName = async (roomId: string, newName: string) => {
  try {
    const roomRef = firestore().collection('rooms').doc(roomId);
    await roomRef.update({
      groupName: newName,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    // Update all chat entries for this group
    const chatsQuery = await firestore()
      .collection('chats')
      .where('roomId', '==', roomId)
      .get();

    const batch = firestore().batch();
    chatsQuery.docs.forEach(doc => {
      batch.update(doc.ref, {
        groupName: newName,
        name: newName,
      });
    });

    await batch.commit();
    console.log(`Group name updated to: ${newName}`);
  } catch (error: any) {
    console.error('Error updating group name:', error);
    throw error;
  }
};

// Remove user from group
export const removeUserFromGroup = async (roomId: string, userIdToRemove: string, adminId: string) => {
  try {
    console.log('🚫 Removing user from group:', { roomId, userIdToRemove, adminId });
    
    const roomRef = firestore().collection('rooms').doc(roomId);
    const roomDoc = await roomRef.get();
    
    if (!roomDoc.exists()) {
      throw new Error('Group not found');
    }
    
    const roomData = roomDoc.data();
    
    // Check if admin has permission
    if (!roomData?.admins?.includes(adminId)) {
      throw new Error('Only admins can remove members');
    }
    
    // Update member status to inactive and remove from participants
    await roomRef.update({
      [`members.${userIdToRemove}.isActive`]: false,
      [`members.${userIdToRemove}.removedAt`]: firestore.FieldValue.serverTimestamp(),
      [`members.${userIdToRemove}.removedBy`]: adminId,
      participants: firestore.FieldValue.arrayRemove(userIdToRemove),
    });

    // Mark user's chat entry as inactive
    const userChatRef = firestore().collection('chats').doc(`${userIdToRemove}_${roomId}`);
    await userChatRef.update({
      isActive: false,
      removedAt: firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ User removed from group successfully:', userIdToRemove);
  } catch (error: any) {
    console.error('❌ Error removing user from group:', error);
    throw error;
  }
};

// Leave group
export const leaveGroup = async (roomId: string, userId: string) => {
  try {
    console.log('🚪 User leaving group:', { roomId, userId });
    
    const roomRef = firestore().collection('rooms').doc(roomId);
    
    // Update member status to inactive and remove from participants
    await roomRef.update({
      [`members.${userId}.isActive`]: false,
      [`members.${userId}.leftAt`]: firestore.FieldValue.serverTimestamp(),
      participants: firestore.FieldValue.arrayRemove(userId),
    });

    // Mark user's chat entry as inactive
    const userChatRef = firestore().collection('chats').doc(`${userId}_${roomId}`);
    await userChatRef.update({
      isActive: false,
      leftAt: firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ User left group successfully:', userId);
  } catch (error: any) {
    console.error('❌ Error leaving group:', error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (userId: string) => {
  try {
    console.log('👤 Getting user profile for:', userId);
    const userDoc = await firestore().collection('users').doc(userId).get();
    
    if (!userDoc.exists()) {
      console.error('❌ User document does not exist:', userId);
      throw new Error('User not found');
    }
    
    const userData = userDoc.data();
    console.log('✅ User profile data:', userData);
    return userData;
  } catch (error: any) {
    console.error('❌ Error getting user profile for', userId, ':', error);
    throw error;
  }
};

