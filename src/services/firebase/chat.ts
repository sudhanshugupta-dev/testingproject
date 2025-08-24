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

    const batch = firestore().batch();

    // Add message to messages subcollection
    batch.set(messageRef, {
      ...message,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });

    // Update lastMessage in room and chats
    batch.update(roomRef, {
      lastMessage: message.text,
      lastMessageAt: firestore.FieldValue.serverTimestamp(),
    });

    // Update chats collection for all participants
    const chatDocs = await firestore()
      .collection('chats')
      .where('roomId', '==', roomId)
      .get();

    chatDocs.forEach(doc => {
      batch.update(doc.ref, {
        lastMessage: message.text,
        lastMessageAt: firestore.FieldValue.serverTimestamp(),
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

// Listen to messages in a chat room
export const listenToMessages = (
  roomId: string,
  callback: (messages: any[]) => void,
): (() => void) => {
  try {
    console.log('Setting up message listener for room:', roomId);
    const unsubscribe = firestore()
      .collection('rooms')
      .doc(roomId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .onSnapshot(
        snapshot => {
          const msgs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          console.log('Messages updated:', msgs);
          callback(msgs as any[]);
        },
        error => {
          console.error('Error in message listener:', {
            message: error.message,
            code: error.code,
            stack: error.stack,
          });
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