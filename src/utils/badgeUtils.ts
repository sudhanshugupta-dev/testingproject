import { Platform } from 'react-native';
import NotificationHelper from './NotificationHelper';

// Set the application badge count
export const setBadgeCount = (count: number) => {
  try {
    NotificationHelper.setBadgeCount(count);
  } catch (error) {
    console.error('Error setting badge count:', error);
  }
};

// Initialize the notification system
export const initializeBadgeSystem = async () => {
  try {
    // Configure the notification system
    NotificationHelper.configure();
    
    // Request permissions
    await NotificationHelper.requestPermissions();
  } catch (error) {
    console.error('Error initializing badge system:', error);
  }
};

// Calculate total unread count from chat list
export const calculateTotalUnreadCount = (chatList: any[]): number => {
  return chatList.reduce((total, chat) => {
    // Count unread messages for chats where the last message is not seen by current user
    if (chat.lastMessage && !chat.lastMessage.isSeen && chat.unseenCount > 0) {
      return total + chat.unseenCount;
    }
    return total;
  }, 0);
};

// Update app icon badge based on total unread count
export const updateAppIconBadge = (totalUnreadCount: number) => {
  try {
    setBadgeCount(totalUnreadCount);
    console.log(`App icon badge updated to: ${totalUnreadCount}`);
  } catch (error) {
    console.error('Error updating app icon badge:', error);
  }
};

// Format badge count for display (99+ for counts > 99)
export const formatBadgeCount = (count: number): string => {
  if (count <= 0) return '';
  if (count > 99) return '99+';
  return count.toString();
};

// Check if badge should be shown
export const shouldShowBadge = (count: number): boolean => {
  return count > 0;
};

export default {
  setBadgeCount,
  initializeBadgeSystem,
  calculateTotalUnreadCount,
  updateAppIconBadge,
  formatBadgeCount,
  shouldShowBadge,
};
