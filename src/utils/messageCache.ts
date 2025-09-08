import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message } from '../services/firebase/chat';

// Cache keys
const getCacheKey = (roomId: string) => `chat_messages_${roomId}`;
const getRoomCacheKey = (myId: string, friendId: string) => `chat_room_${myId}_${friendId}`;
const getTimestampCacheKey = (roomId: string) => `oldest_timestamp_${roomId}`;

// Cache settings
const CACHE_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const MAX_CACHED_MESSAGES = 200; // Maximum messages to keep in cache per room

interface CachedData {
  messages: Message[];
  timestamp: number;
  version: string; // For cache invalidation if needed
}

interface CacheMetadata {
  oldestTimestamp: number | null;
  hasMoreMessages: boolean;
  lastUpdated: number;
}

/**
 * Save messages to cache with metadata
 */
export const saveMessagesToCache = async (roomId: string, messages: Message[]): Promise<void> => {
  try {
    if (!roomId || !messages || messages.length === 0) return;

    // Limit messages to prevent cache from growing too large
    const messagesToCache = messages.slice(-MAX_CACHED_MESSAGES);
    
    const cachedData: CachedData = {
      messages: messagesToCache,
      timestamp: Date.now(),
      version: '1.0',
    };

    const metadata: CacheMetadata = {
      oldestTimestamp: messagesToCache.length > 0 ? 
        (messagesToCache[0].createdAt?.toString ? Number(messagesToCache[0].createdAt) : (messagesToCache[0].createdAt as number)) : 
        null,
      hasMoreMessages: messages.length >= MAX_CACHED_MESSAGES,
      lastUpdated: Date.now(),
    };

    await Promise.all([
      AsyncStorage.setItem(getCacheKey(roomId), JSON.stringify(cachedData)),
      AsyncStorage.setItem(getTimestampCacheKey(roomId), JSON.stringify(metadata)),
    ]);

    console.log('Messages cached successfully for room:', roomId, 'count:', messagesToCache.length);
  } catch (error) {
    console.error('Error saving messages to cache:', error);
    // Don't throw - caching failures shouldn't break the app
  }
};

/**
 * Load messages from cache
 */
export const loadMessagesFromCache = async (roomId: string): Promise<{
  messages: Message[];
  metadata: CacheMetadata | null;
} | null> => {
  try {
    if (!roomId) return null;

    const [cachedDataString, metadataString] = await Promise.all([
      AsyncStorage.getItem(getCacheKey(roomId)),
      AsyncStorage.getItem(getTimestampCacheKey(roomId)),
    ]);

    if (!cachedDataString) return null;

    const cachedData: CachedData = JSON.parse(cachedDataString);
    const metadata: CacheMetadata | null = metadataString ? JSON.parse(metadataString) : null;

    // Check if cache is expired
    const isExpired = Date.now() - cachedData.timestamp > CACHE_EXPIRY_TIME;
    if (isExpired) {
      console.log('Cache expired for room:', roomId);
      await clearRoomCache(roomId);
      return null;
    }

    console.log('Messages loaded from cache for room:', roomId, 'count:', cachedData.messages.length);
    
    return {
      messages: cachedData.messages,
      metadata,
    };
  } catch (error) {
    console.error('Error loading messages from cache:', error);
    // Clear corrupted cache
    await clearRoomCache(roomId);
    return null;
  }
};

/**
 * Save room ID to cache for faster access
 */
export const saveRoomIdToCache = async (myId: string, friendId: string, roomId: string): Promise<void> => {
  try {
    if (!myId || !friendId || !roomId) return;
    
    const cacheData = {
      roomId,
      timestamp: Date.now(),
    };

    await AsyncStorage.setItem(getRoomCacheKey(myId, friendId), JSON.stringify(cacheData));
    console.log('Room ID cached:', roomId);
  } catch (error) {
    console.error('Error saving room ID to cache:', error);
  }
};

/**
 * Load room ID from cache
 */
export const loadRoomIdFromCache = async (myId: string, friendId: string): Promise<string | null> => {
  try {
    if (!myId || !friendId) return null;

    const cachedDataString = await AsyncStorage.getItem(getRoomCacheKey(myId, friendId));
    if (!cachedDataString) return null;

    const cachedData = JSON.parse(cachedDataString);
    
    // Check if cache is expired (room IDs can be cached longer)
    const isExpired = Date.now() - cachedData.timestamp > CACHE_EXPIRY_TIME * 7; // 7 days
    if (isExpired) {
      await AsyncStorage.removeItem(getRoomCacheKey(myId, friendId));
      return null;
    }

    console.log('Room ID loaded from cache:', cachedData.roomId);
    return cachedData.roomId;
  } catch (error) {
    console.error('Error loading room ID from cache:', error);
    return null;
  }
};

/**
 * Clear cache for a specific room
 */
export const clearRoomCache = async (roomId: string): Promise<void> => {
  try {
    if (!roomId) return;

    await Promise.all([
      AsyncStorage.removeItem(getCacheKey(roomId)),
      AsyncStorage.removeItem(getTimestampCacheKey(roomId)),
    ]);

    console.log('Cache cleared for room:', roomId);
  } catch (error) {
    console.error('Error clearing room cache:', error);
  }
};

/**
 * Clear all message caches (useful for logout or cache reset)
 */
export const clearAllMessageCaches = async (): Promise<void> => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter(key => 
      key.startsWith('chat_messages_') || 
      key.startsWith('chat_room_') || 
      key.startsWith('oldest_timestamp_')
    );

    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
      console.log('All message caches cleared:', cacheKeys.length, 'items');
    }
  } catch (error) {
    console.error('Error clearing all message caches:', error);
  }
};

/**
 * Get cache statistics for debugging
 */
export const getCacheStats = async (): Promise<{
  totalCaches: number;
  roomCaches: number;
  messageCaches: number;
  timestampCaches: number;
}> => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const messageCaches = allKeys.filter(key => key.startsWith('chat_messages_'));
    const roomCaches = allKeys.filter(key => key.startsWith('chat_room_'));
    const timestampCaches = allKeys.filter(key => key.startsWith('oldest_timestamp_'));

    return {
      totalCaches: messageCaches.length + roomCaches.length + timestampCaches.length,
      roomCaches: roomCaches.length,
      messageCaches: messageCaches.length,
      timestampCaches: timestampCaches.length,
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return {
      totalCaches: 0,
      roomCaches: 0,
      messageCaches: 0,
      timestampCaches: 0,
    };
  }
};

/**
 * Validate and repair cache integrity
 */
export const validateAndRepairCache = async (roomId: string): Promise<boolean> => {
  try {
    const cached = await loadMessagesFromCache(roomId);
    if (!cached) return false;

    const { messages } = cached;
    
    // Check for basic data integrity
    const validMessages = messages.filter(msg => 
      msg.id && 
      msg.senderId && 
      msg.createdAt &&
      typeof msg.text === 'string'
    );

    // If we lost too many messages due to corruption, clear cache
    if (validMessages.length < messages.length * 0.8) {
      console.warn('Cache corruption detected for room:', roomId, 'clearing cache');
      await clearRoomCache(roomId);
      return false;
    }

    // If messages are not in proper order, re-save them
    const sortedMessages = [...validMessages].sort((a, b) => {
      const timeA = a.createdAt?.toString ? Number(a.createdAt) : (a.createdAt as number);
      const timeB = b.createdAt?.toString ? Number(b.createdAt) : (b.createdAt as number);
      return timeA - timeB;
    });

    const isOrderCorrect = JSON.stringify(sortedMessages.map(m => m.id)) === 
                          JSON.stringify(validMessages.map(m => m.id));

    if (!isOrderCorrect) {
      console.log('Repairing message order in cache for room:', roomId);
      await saveMessagesToCache(roomId, sortedMessages);
    }

    return true;
  } catch (error) {
    console.error('Error validating cache:', error);
    await clearRoomCache(roomId);
    return false;
  }
};
