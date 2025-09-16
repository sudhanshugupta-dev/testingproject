import { useState, useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { initializeBadgeSystem, updateAppIconBadge } from '../utils/badgeUtils';

const useUnreadMessages = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const chatsState = useSelector((state: RootState) => state.chats);
  const prevUnreadCountRef = useRef(0);

  // Initialize badge system on mount
  useEffect(() => {
    const initBadgeSystem = async () => {
      try {
        await initializeBadgeSystem();
      } catch (error) {
        console.error('Failed to initialize badge system:', error);
      }
    };

    initBadgeSystem();
  }, []);

  // Update badge count when unread count changes
  useEffect(() => {
    if (!currentUser) return;

    const handleAppStateChange = (nextAppState: string) => {
      // Do not auto-clear badges on foreground; keep server-synced count
      // The badge count is managed by Redux store and Firebase listeners
    };

    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Listen to Redux state changes for unread count
    const currentUnreadCount = chatsState.unreadCount;
    setUnreadCount(currentUnreadCount);
    console.log("Currrent unread count", currentUnreadCount);

    // Only update badge if count has changed
    if (prevUnreadCountRef.current !== currentUnreadCount) {
      updateAppIconBadge(currentUnreadCount);
      prevUnreadCountRef.current = currentUnreadCount;
    }

    // Cleanup on unmount
    return () => {
      subscription.remove();
      // Do not clear badges here; server count remains source of truth
    };
  }, [currentUser, chatsState.unreadCount]);

  return { unreadCount };
};

export default useUnreadMessages;
