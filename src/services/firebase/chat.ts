import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export type ChatItem = { id: string; name: string; lastMessage?: string; avatar?: string };

// Fetch the list of chats for the current user
export const getChatList = async (): Promise<ChatItem[]> => {
  try {
    const userId = auth().currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    console.log('Fetching chat list for user:', userId);
    const snapshot = await firestore()
      .collection('chats')
      .where('participants', 'array-contains', userId)
      .get();
    const chatList = snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name || 'User',
      lastMessage: doc.data().lastMessage,
      avatar: doc.data().avatar,
    }));
    console.log('Chat list fetched:', chatList);
    return chatList;
  } catch (error: any) {
    console.error('Error fetching chat list:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw new Error(`Failed to fetch chat list: ${error.message} (Code: ${error.code})`);
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
    if (message.senderId !== userId) throw new Error('Sender ID does not match authenticated user');

    console.log('Sending message to room:', roomId, message);
    await firestore()
      .collection('rooms')
      .doc(roomId)
      .collection('messages')
      .add(message);
    // Update lastMessage in chats collection
    await firestore().collection('chats').doc(roomId).update({
      lastMessage: message.text,
    });
    console.log('Message sent successfully');
  } catch (error: any) {
    console.error('Error sending message:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw new Error(`Failed to send message: ${error.message} (Code: ${error.code})`);
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
      .onSnapshot((snapshot) => {
        const msgs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log('Messages updated:', msgs);
        callback(msgs);
      }, (error) => {
        console.error('Error in message listener:', {
          message: error.message,
          code: error.code,
          stack: error.stack,
        });
      });
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
    throw new Error(`Failed to listen to messages: ${error.message} (Code: ${error.code})`);
  }
};