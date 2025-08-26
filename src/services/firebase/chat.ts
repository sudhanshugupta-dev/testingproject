import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export type ChatItem = {
  id: string;
  name: string;
  lastMessage?: string;
  avatar?: string;
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
    .collection('chats')
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

  // For user2
  const user2ChatRef = firestore()
    .collection('chats')
    .doc(`${userId2}_${roomId}`);
  const user2ChatDoc = await user2ChatRef.get();
  if (!user2ChatDoc.exists) {
    // Fetch user1 details for name and avatar
    const user1Doc = await firestore().collection('users').doc(userId1).get();
    const user1Data = user1Doc.data() || {};
    await user2ChatRef.set({
      roomId,
      participants: [userId1, userId2],
      lastMessage: '',
      lastMessageAt: null,
      name: (user1Data as any).name || 'Unknown',
      avatar: (user1Data as any).avatar || null,
    });
  }
};

export const getChatList = async () => {
  try {
    const userId = auth().currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    console.log('Fetching friends list for user:', userId);

    // Fetch the friends document for the current user
    const friendsDoc = await firestore()
      .collection('friends')
      .doc(userId)
      .get();

    const data = friendsDoc.exists ? friendsDoc.data() || {} : {};
    const friendIds = Array.isArray((data as any).friendIds)
      ? ((data as any).friendIds as string[])
      : Object.keys(data);

    // Fetch details for each friend
    const friendDetailsPromises = friendIds.map(async friendId => {
      const userDoc = await firestore().collection('users').doc(friendId).get();

      if (!userDoc.exists) {
        return null; // Handle case where user document doesn't exist
      }

      const userData = userDoc.data() as any;
      return {
        id: userDoc.id,
        name: userData.name || 'Unknown',
        email: userData.email || 'No email',
        avatar: userData.avatar || null,
        // Add other relevant fields as needed
      };
    });

    // Resolve all friend details promises and filter out null results
    const friendDetails = (await Promise.all(friendDetailsPromises)).filter(
      friend => friend !== null,
    );

    console.log('Friends list fetched:', friendDetails);
    return friendDetails;
  } catch (error: any) {
    console.error('Error fetching friends list:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw new Error(
      `Failed to fetch friends list: ${error.message} (Code: ${
        error.code || 'unknown'
      })`,
    );
  }
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
}

// Send a reply message to a chat room
export const sendReplyMessage = async (
  roomId: string,
  message: { 
    text: string; 
    senderId: string; 
    createdAt: number; 
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

    const roomRef = firestore().collection('rooms').doc(roomId);
    const messageRef = roomRef.collection('messages').doc();
    const serverTimestamp = firestore.FieldValue.serverTimestamp();

    const messageData: Message = {
      text: message.text,
      senderId: message.senderId,
      createdAt: serverTimestamp,
      messageType: 'text',
      status: 'sent',
      replyTo: message.replyTo
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
  message: { text: string; senderId: string; createdAt: number },
): Promise<void> => {
  try {
    const userId = auth().currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    if (message.senderId !== userId)
      throw new Error('Sender ID does not match authenticated user');

    console.log('Sending message to room:', roomId, message);

    const roomRef = firestore().collection('rooms').doc(roomId);
    const messageRef = roomRef.collection('messages').doc();
    const serverTimestamp = firestore.FieldValue.serverTimestamp();

    const messageData: Message = {
      text: message.text,
      senderId: message.senderId,
      createdAt: serverTimestamp,
      messageType: 'text',
      status: 'sent'
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
export const markMessagesAsRead = async (roomId: string, userId: string): Promise<void> => {
  try {
    const chatRef = firestore().collection('chats').doc(`${userId}_${roomId}`);
    await chatRef.update({
      unreadCount: 0,
      lastReadAt: firestore.FieldValue.serverTimestamp()
    });
    console.log('Messages marked as read for user:', userId, 'in room:', roomId);
  } catch (error: any) {
    console.error('Error marking messages as read:', error);
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






// import firestore from '@react-native-firebase/firestore';
// import auth from '@react-native-firebase/auth';
// import { setChats, setError } from '../../redux/slices/chatsSlice';

// export type ChatItem = {
//   id: string;
//   name: string;
//   lastMessage?: string;
//   avatar?: string;
// };

// // Generate a deterministic room ID for two users
// const generateRoomId = (userId1: string, userId2: string): string => {
//   return [userId1, userId2].sort().join('_');
// };

// // Create or get a chat room
// export const getOrCreateChatRoom = async (
//   userId1: string,
//   userId2: string,
// ): Promise<string> => {
//   try {
//     const roomsSnapshot = await firestore()
//       .collection('rooms')
//       .where('participants', 'array-contains', userId1)
//       .get();

//     for (const doc of roomsSnapshot.docs) {
//       const participants = doc.data().participants as string[];
//       if (
//         participants.length === 2 &&
//         participants.includes(userId1) &&
//         participants.includes(userId2)
//       ) {
//         console.log('Existing chat room found:', doc.id);
//         await ensureChatEntries(doc.id, userId1, userId2);
//         return doc.id;
//       }
//     }

//     const roomId = generateRoomId(userId1, userId2);
//     const roomRef = firestore().collection('rooms').doc(roomId);

//     await roomRef.set({
//       participants: [userId1, userId2],
//       createdAt: Date.now(),
//       lastMessage: '',
//       lastMessageAt: null,
//     });

//     await ensureChatEntries(roomId, userId1, userId2);

//     console.log('New chat room created:', roomId);
//     return roomId;
//   } catch (error: any) {
//     console.error('Error creating/fetching chat room:', {
//       message: error.message,
//       code: error.code,
//       stack: error.stack,
//     });
//     throw new Error(
//       `Failed to create/fetch chat room: ${error.message} (Code: ${
//         error.code || 'unknown'
//       })`,
//     );
//   }
// };

// // Helper function to ensure chat entries exist for both users
// const ensureChatEntries = async (
//   roomId: string,
//   userId1: string,
//   userId2: string,
// ) => {
//   const user1ChatRef = firestore()
//     .collection('chats')
//     .doc(`${userId1}_${roomId}`);
//   const user1ChatDoc = await user1ChatRef.get();
//   if (!user1ChatDoc.exists) {
//     const user2Doc = await firestore().collection('users').doc(userId2).get();
//     const user2Data = user2Doc.data() || {};
//     await user1ChatRef.set({
//       roomId,
//       participants: [userId1, userId2],
//       lastMessage: '',
//       lastMessageAt: null,
//       name: (user2Data as any).name || 'Unknown',
//       avatar: (user2Data as any).avatar || null,
//       unreadCount: 0,
//     });
//   }

//   const user2ChatRef = firestore()
//     .collection('chats')
//     .doc(`${userId2}_${roomId}`);
//   const user2ChatDoc = await user2ChatRef.get();
//   if (!user2ChatDoc.exists) {
//     const user1Doc = await firestore().collection('users').doc(userId1).get();
//     const user1Data = user1Doc.data() || {};
//     await user2ChatRef.set({
//       roomId,
//       participants: [userId1, userId2],
//       lastMessage: '',
//       lastMessageAt: null,
//       name: (user1Data as any).name || 'Unknown',
//       avatar: (user1Data as any).avatar || null,
//       unreadCount: 0,
//     });
//   }
// };

// // Get chat list with real-time updates and pagination
// export const getChatList = (dispatch: any, pageSize: number = 10) => {
//   try {
//     const userId = auth().currentUser?.uid;
//     if (!userId) throw new Error('User not authenticated');

//     console.log('Setting up chat list listener for user:', userId);

//     let lastDoc: any = null;

//     const fetchChats = async (startAfterDoc: any = null) => {
//       let q = firestore()
//         .collection('chats')
//         .where('participants', 'array-contains', userId)
//         .orderBy('lastMessageAt', 'desc')
//         .limit(pageSize);

//       if (startAfterDoc) {
//         q = q.startAfter(startAfterDoc);
//       }

//       const snapshot = await q.get();
//       const chats: ChatItem[] = [];
//       snapshot.forEach(doc => {
//         const chatData = doc.data();
//         const otherUserId = chatData.participants.find((id: string) => id !== userId);
//         chats.push({
//           id: chatData.roomId,
//           name: chatData.name || 'Unknown',
//           lastMessage: chatData.lastMessage || undefined,
//           avatar: chatData.avatar || undefined,
//           unreadCount: chatData.unreadCount || 0,
//           isRead: (chatData.unreadCount || 0) === 0,
//           timestamp: chatData.lastMessageAt?.toDate().toISOString() || undefined,
//         });
//       });

//       lastDoc = snapshot.docs[snapshot.docs.length - 1];
//       return chats;
//     };

//     // Initial fetch
//     fetchChats().then(chats => {
//       dispatch(setChats(chats));
//     }).catch(error => {
//       dispatch(setError(error.message));
//     });

//     // Real-time listener
//     const unsubscribe = firestore()
//       .collection('chats')
//       .where('participants', 'array-contains', userId)
//       .orderBy('lastMessageAt', 'desc')
//       .onSnapshot(
//         async snapshot => {
//           try {
//             const chats: ChatItem[] = [];
//             snapshot.forEach(doc => {
//               const chatData = doc.data();
//               const otherUserId = chatData.participants.find((id: string) => id !== userId);
//               chats.push({
//                 id: chatData.roomId,
//                 name: chatData.name || 'Unknown',
//                 lastMessage: chatData.lastMessage || undefined,
//                 avatar: chatData.avatar || undefined,
//                 unreadCount: chatData.unreadCount || 0,
//                 isRead: (chatData.unreadCount || 0) === 0,
//                 timestamp: chatData.lastMessageAt?.toDate().toISOString() || undefined,
//               });
//             });

//             console.log('Chat list updated:', chats);
//             dispatch(setChats(chats));
//           } catch (error: any) {
//             console.error('Error in chat list snapshot:', {
//               message: error.message,
//               code: error.code,
//               stack: error.stack,
//             });
//             dispatch(setError(error.message));
//           }
//         },
//         error => {
//           console.error('Snapshot error:', {
//             message: error.message,
//             code: error.code,
//             stack: error.stack,
//           });
//           dispatch(setError(error.message));
//         },
//       );

//     // Return function to fetch next page
//     return {
//       unsubscribe,
//       fetchNextPage: async () => {
//         if (!lastDoc) return [];
//         const nextChats = await fetchChats(lastDoc);
//         return nextChats;
//       },
//     };
//   } catch (error: any) {
//     console.error('Error setting up chat list listener:', {
//       message: error.message,
//       code: error.code,
//       stack: error.stack,
//     });
//     dispatch(setError(error.message));
//     throw error;
//   }
// };

// export interface Message {
//   id?: string;
//   text: string;
//   senderId: string;
//   createdAt: any;
//   messageType?: 'text' | 'image' | 'file';
//   status?: 'sending' | 'sent' | 'delivered' | 'read';
//   replyTo?: {
//     messageId: string;
//     text: string;
//     senderId: string;
//     senderName?: string;
//   };
// }

// // Send a reply message
// export const sendReplyMessage = async (
//   roomId: string,
//   message: {
//     text: string;
//     senderId: string;
//     createdAt: number;
//     replyTo: {
//       messageId: string;
//       text: string;
//       senderId: string;
//       senderName?: string;
//     };
//   },
// ): Promise<void> => {
//   try {
//     const userId = auth().currentUser?.uid;
//     if (!userId) throw new Error('User not authenticated');
//     if (message.senderId !== userId)
//       throw new Error('Sender ID does not match authenticated user');

//     console.log('Sending reply message to room:', roomId, message);

//     const roomRef = firestore().collection('rooms').doc(roomId);
//     const messageRef = roomRef.collection('messages').doc();
//     const serverTimestamp = firestore.FieldValue.serverTimestamp();

//     const messageData: Message = {
//       text: message.text,
//       senderId: message.senderId,
//       createdAt: serverTimestamp,
//       messageType: 'text',
//       status: 'sent',
//       replyTo: message.replyTo,
//     };

//     const batch = firestore().batch();

//     batch.set(messageRef, messageData);

//     batch.update(roomRef, {
//       lastMessage: message.replyTo
//         ? `Replied to "${message.replyTo.text}": ${message.text}`
//         : message.text,
//       lastMessageAt: serverTimestamp,
//     });

//     const chatDocs = await firestore()
//       .collection('chats')
//       .where('roomId', '==', roomId)
//       .get();

//     chatDocs.forEach(doc => {
//       batch.update(doc.ref, {
//         lastMessage: message.replyTo
//           ? `Replied to "${message.replyTo.text}": ${message.text}`
//           : message.text,
//         lastMessageAt: serverTimestamp,
//         ...(doc.id.startsWith(message.senderId) ? {} : { unreadCount: firestore.FieldValue.increment(1) }),
//       });
//     });

//     await batch.commit();
//     console.log('Reply message sent successfully');
//   } catch (error: any) {
//     console.error('Error sending reply message:', {
//       message: error.message,
//       code: error.code,
//       stack: error.stack,
//     });
//     throw new Error(
//       `Failed to send reply message: ${error.message} (Code: ${
//         error.code || 'unknown'
//       })`,
//     );
//   }
// };

// // Send a regular message
// export const sendMessage = async (
//   roomId: string,
//   message: { text: string; senderId: string; createdAt: number },
// ): Promise<void> => {
//   try {
//     const userId = auth().currentUser?.uid;
//     if (!userId) throw new Error('User not authenticated');
//     if (message.senderId !== userId)
//       throw new Error('Sender ID does not match authenticated user');

//     console.log('Sending message to room:', roomId, message);

//     const roomRef = firestore().collection('rooms').doc(roomId);
//     const messageRef = roomRef.collection('messages').doc();
//     const serverTimestamp = firestore.FieldValue.serverTimestamp();

//     const messageData: Message = {
//       text: message.text,
//       senderId: message.senderId,
//       createdAt: serverTimestamp,
//       messageType: 'text',
//       status: 'sent',
//     };

//     const batch = firestore().batch();

//     batch.set(messageRef, messageData);

//     batch.update(roomRef, {
//       lastMessage: message.text,
//       lastMessageAt: serverTimestamp,
//     });

//     const chatDocs = await firestore()
//       .collection('chats')
//       .where('roomId', '==', roomId)
//       .get();

//     chatDocs.forEach(doc => {
//       batch.update(doc.ref, {
//         lastMessage: message.text,
//         lastMessageAt: serverTimestamp,
//         ...(doc.id.startsWith(message.senderId) ? {} : { unreadCount: firestore.FieldValue.increment(1) }),
//       });
//     });

//     await batch.commit();
//     console.log('Message sent successfully');
//   } catch (error: any) {
//     console.error('Error sending message:', {
//       message: error.message,
//       code: error.code,
//       stack: error.stack,
//     });
//     throw new Error(
//       `Failed to send message: ${error.message} (Code: ${
//         error.code || 'unknown'
//       })`,
//     );
//   }
// };

// // Listen to messages with pagination
// export const listenToMessages = (
//   roomId: string,
//   callback: (messages: Message[], hasMore: boolean) => void,
//   pageSize: number = 20,
// ): { unsubscribe: () => void; fetchMore: () => Promise<void> } => {
//   try {
//     console.log('Setting up message listener for room:', roomId);

//     let lastDoc: any = null;
//     let hasMore = true;

//     const fetchMessages = async (startAfterDoc: any = null) => {
//       let q = firestore()
//         .collection('rooms')
//         .doc(roomId)
//         .collection('messages')
//         .orderBy('createdAt', 'desc')
//         .limit(pageSize);

//       if (startAfterDoc) {
//         q = q.startAfter(startAfterDoc);
//       }

//       const snapshot = await q.get();
//       const messages: Message[] = snapshot.docs.map(doc => ({
//         id: doc.id,
//         text: doc.data().text || '',
//         senderId: doc.data().senderId || '',
//         createdAt: doc.data().createdAt,
//         messageType: doc.data().messageType || 'text',
//         status: doc.data().status || 'sent',
//         replyTo: doc.data().replyTo || undefined,
//       }));

//       lastDoc = snapshot.docs[snapshot.docs.length - 1];
//       hasMore = snapshot.docs.length === pageSize;

//       return messages;
//     };

//     // Initial fetch
//     fetchMessages().then(messages => {
//       callback(messages.reverse(), hasMore); // Reverse to show oldest first
//     });

//     // Real-time listener
//     const unsubscribe = firestore()
//       .collection('rooms')
//       .doc(roomId)
//       .collection('messages')
//       .orderBy('createdAt', 'desc')
//       .limit(pageSize)
//       .onSnapshot(
//         snapshot => {
//           const messages: Message[] = snapshot.docs.map(doc => ({
//             id: doc.id,
//             text: doc.data().text || '',
//             senderId: doc.data().senderId || '',
//             createdAt: doc.data().createdAt,
//             messageType: doc.data().messageType || 'text',
//             status: doc.data().status || 'sent',
//             replyTo: doc.data().replyTo || undefined,
//           }));
//           console.log(`Messages updated for room ${roomId}:`, messages.length, 'messages');
//           callback(messages.reverse(), hasMore);
//         },
//         error => {
//           console.error('Error in message listener:', {
//             message: error.message,
//             code: error.code,
//             stack: error.stack,
//           });
//           callback([], false);
//         },
//       );

//     return {
//       unsubscribe,
//       fetchMore: async () => {
//         if (!lastDoc || !hasMore) return;
//         const moreMessages = await fetchMessages(lastDoc);
//         callback(moreMessages.reverse(), hasMore);
//       },
//     };
//   } catch (error: any) {
//     console.error('Error setting up message listener:', {
//       message: error.message,
//       code: error.code,
//       stack: error.stack,
//     });
//     callback([], false);
//     throw error;
//   }
// };

// // Mark messages as read
// export const markMessagesAsRead = async (roomId: string, userId: string): Promise<void> => {
//   try {
//     const chatRef = firestore().collection('chats').doc(`${userId}_${roomId}`);
//     await chatRef.update({
//       unreadCount: 0,
//       lastReadAt: firestore.FieldValue.serverTimestamp(),
//     });
//     console.log('Messages marked as read for user:', userId, 'in room:', roomId);
//   } catch (error: any) {
//     console.error('Error marking messages as read:', {
//       message: error.message,
//       code: error.code,
//       stack: error.stack,
//     });
//     throw error;
//   }
// };

// // Create mock messages for testing
// export const createMockMessages = async (
//   roomId: string,
//   userId1: string,
//   userId2: string,
// ): Promise<void> => {
//   try {
//     const roomRef = firestore().collection('rooms').doc(roomId);
//     const messagesRef = roomRef.collection('messages');
//     const serverTimestamp = firestore.FieldValue.serverTimestamp();

//     const mockMessages: Omit<Message, 'id'>[] = [
//       {
//         text: "Hey there! How are you doing?",
//         senderId: userId1,
//         createdAt: serverTimestamp,
//         messageType: 'text',
//         status: 'sent',
//       },
//       {
//         text: "I'm doing great! Thanks for asking. How about you?",
//         senderId: userId2,
//         createdAt: serverTimestamp,
//         messageType: 'text',
//         status: 'sent',
//       },
//       {
//         text: "I'm good too! Just working on some React Native stuff.",
//         senderId: userId1,
//         createdAt: serverTimestamp,
//         messageType: 'text',
//         status: 'sent',
//       },
//       {
//         text: "That sounds interesting! What kind of app are you building?",
//         senderId: userId2,
//         createdAt: serverTimestamp,
//         messageType: 'text',
//         status: 'sent',
//       },
//       {
//         text: "It's a chat application with Firebase backend. Pretty cool so far!",
//         senderId: userId1,
//         createdAt: serverTimestamp,
//         messageType: 'text',
//         status: 'sent',
//       },
//     ];

//     const batch = firestore().batch();

//     mockMessages.forEach((msg, index) => {
//       const messageRef = messagesRef.doc();
//       batch.set(messageRef, {
//         ...msg,
//         createdAt: firestore.Timestamp.fromMillis(Date.now() + index * 1000),
//       });
//     });

//     batch.update(roomRef, {
//       lastMessage: mockMessages[mockMessages.length - 1].text,
//       lastMessageAt: serverTimestamp,
//     });

//     const chatDocs = await firestore()
//       .collection('chats')
//       .where('roomId', '==', roomId)
//       .get();

//     chatDocs.forEach(doc => {
//       batch.update(doc.ref, {
//         lastMessage: mockMessages[mockMessages.length - 1].text,
//         lastMessageAt: serverTimestamp,
//         ...(doc.id.startsWith(userId2) ? { unreadCount: firestore.FieldValue.increment(mockMessages.length) } : {}),
//       });
//     });

//     await batch.commit();
//     console.log('Mock messages created successfully for room:', roomId);
//   } catch (error: any) {
//     console.error('Error creating mock messages:', {
//       message: error.message,
//       code: error.code,
//       stack: error.stack,
//     });
//     throw error;
//   }
// };

// // Set up user presence
// export const setupUserPresence = async (userId: string) => {
//   if (!userId) return;

//   const userStatusRef = firestore().collection('status').doc(userId);

//   try {
//     await userStatusRef.set(
//       {
//         state: 'online',
//         last_changed: firestore.FieldValue.serverTimestamp(),
//       },
//       { merge: true },
//     );
//     console.log('User presence set to online:', userId);
//   } catch (error: any) {
//     console.error('Error setting up user presence:', {
//       message: error.message,
//       code: error.code,
//       stack: error.stack,
//     });
//     throw error;
//   }
// };

// // Listen to user presence
// export const listenToUserPresence = (userId: string, callback: (isOnline: boolean) => void) => {
//   if (!userId) return () => {};

//   const userStatusRef = firestore().collection('status').doc(userId);

//   const unsubscribe = userStatusRef.onSnapshot(
//     snapshot => {
//       const data = snapshot.data();
//       const isOnline = data && data.state === 'online';
//       console.log(`User ${userId} presence updated: ${isOnline ? 'online' : 'offline'}`);
//       callback(isOnline);
//     },
//     error => {
//       console.error('Error listening to user presence:', {
//         message: error.message,
//         code: error.code,
//         stack: error.stack,
//       });
//       callback(false);
//     },
//   );

//   return unsubscribe;
// };

// // Set user offline
// export const setUserOffline = async (userId: string) => {
//   if (!userId) return;

//   const userStatusRef = firestore().collection('status').doc(userId);

//   try {
//     await userStatusRef.update({
//       state: 'offline',
//       last_changed: firestore.FieldValue.serverTimestamp(),
//     });
//     console.log('User presence set to offline:', userId);
//   } catch (error: any) {
//     console.error('Error setting user offline:', {
//       message: error.message,
//       code: error.code,
//       stack: error.stack,
//     });
//     throw error;
//   }
// };
// ```