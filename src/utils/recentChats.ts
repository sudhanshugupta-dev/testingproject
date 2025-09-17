// import AsyncStorage from '@react-native-async-storage/async-storage';

// const RECENT_CHATS_KEY = '@recent_chats';
// const MAX_RECENT_CHATS = 2;

// export interface RecentChat {
//   userId: string;
//   name: string;
//   avatar?: string;
//   lastMessageTime: number;
// }

// export const addRecentChat = async (chat: Omit<RecentChat, 'lastMessageTime'>) => {
//   try {
//     const existingChats = await getRecentChats();
//     console.log("existingChats", existingChats);
//     // Remove if already exists
//     const updatedChats = existingChats.filter(c => c.userId !== chat.userId);
    
//     // Add new chat to the beginning
//     updatedChats.unshift({
//       ...chat,
//       lastMessageTime: Date.now()
//     });
    
//     // Keep only the most recent MAX_RECENT_CHATS
//     const recentChats = updatedChats.slice(0, MAX_RECENT_CHATS);
    
//     await AsyncStorage.setItem(RECENT_CHATS_KEY, JSON.stringify(recentChats));
//     return recentChats;
//   } catch (error) {
//     console.error('Error adding recent chat:', error);
//     return [];
//   }
// };

// export const getRecentChats = async (): Promise<RecentChat[]> => {
//   try {
//     const chats = await AsyncStorage.getItem(RECENT_CHATS_KEY);
//     return chats ? JSON.parse(chats) : [];
//   } catch (error) {
//     console.error('Error getting recent chats:', error);
//     return [];
//   }
// };

// export const clearRecentChats = async () => {
//   try {
//     await AsyncStorage.removeItem(RECENT_CHATS_KEY);
//   } catch (error) {
//     console.error('Error clearing recent chats:', error);
//   }
// };
