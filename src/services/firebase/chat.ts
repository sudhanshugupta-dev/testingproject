import database from '@react-native-firebase/database';
import { getFirebaseApp } from './index';
getFirebaseApp();

export type ChatItem = { id: string; name: string; lastMessage?: string; avatar?: string };

export const getChatList = async (): Promise<ChatItem[]> => {
  const snapshot = await database().ref('/chats').once('value');
  const val = snapshot.val() || {};
  return Object.keys(val).map((id) => ({ id, name: val[id]?.name || 'User', lastMessage: val[id]?.lastMessage }));
};

export const sendMessage = async (roomId: string, message: { text: string; senderId: string; createdAt: number }) => {
  const ref = database().ref(`/rooms/${roomId}/messages`).push();
  await ref.set(message);
};

export const listenToMessages = (roomId: string, callback: (messages: any[]) => void) => {
  const ref = database().ref(`/rooms/${roomId}/messages`);
  const handler = ref.on('value', (snap) => {
    const val = snap.val() || {};
    const msgs = Object.keys(val)
      .map((id) => ({ id, ...val[id] }))
      .sort((a, b) => a.createdAt - b.createdAt);
    callback(msgs);
  });
  return () => ref.off('value', handler);
};
