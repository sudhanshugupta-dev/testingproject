# Badge System API Documentation

## Overview

The badge system provides comprehensive unread message tracking for the chat application. It manages both app icon badges and individual chat unread counts, ensuring users always see the correct number of unread messages.

## Key Features

1. **App Icon Badge**: Always displays total unread message count
2. **Individual Chat Badges**: Shows unread count for each person in chat list
3. **Real-time Updates**: Badge counts update automatically when messages arrive
4. **Read Status Management**: Messages are marked as read when entering chat rooms
5. **Persistent Counts**: Badge counts persist even when app is closed and reopened

## API Structure

### 1. Redux Store Management (`src/redux/slices/chatsSlice.ts`)

The Redux store manages the global unread message state:

```typescript
type ChatsState = {
  list: Chat[];
  loading: boolean;
  error: string | null;
  unreadCount: number; // Total unread count across all chats
};

type Chat = {
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
    messageType?: string;
    seenBy?: Record<string, boolean>;
  } | null;
  unseenCount: number; // Individual chat unread count
};
```

#### Redux Actions

- `setChats(chatList)`: Updates chat list and calculates total unread count
- `markChatAsRead(chatId)`: Marks specific chat as read and updates badge
- `updateChatMessage(messageData)`: Updates chat with new message and increments unread count
- `resetUnreadCount()`: Resets all unread counts to zero

### 2. Badge Utilities (`src/utils/badgeUtils.ts`)

Core utility functions for badge management:

```typescript
// Calculate total unread count from chat list
calculateTotalUnreadCount(chatList: Chat[]): number

// Update app icon badge
updateAppIconBadge(totalUnreadCount: number): void

// Format badge count for display (99+ for counts > 99)
formatBadgeCount(count: number): string

// Check if badge should be shown
shouldShowBadge(count: number): boolean

// Initialize badge system
initializeBadgeSystem(): Promise<void>
```

### 3. Firebase Integration (`src/services/firebase/chat.ts`)

Firebase handles the backend unread message tracking:

#### Key Functions

- `listenToChatList()`: Real-time listener for chat list updates
- `markMessagesAsRead(roomId, userId)`: Marks messages as read in Firebase
- `sendMessage()`: Sends message and updates unread counts
- `sendReplyMessage()`: Sends reply and updates unread counts

#### Database Structure

```
rooms/{roomId}/
  ├── participants: [userId1, userId2]
  ├── lastMessage: string
  ├── lastMessageAt: timestamp
  └── messages/{messageId}/
      ├── text: string
      ├── senderId: string
      ├── receiverId: string
      ├── createdAt: timestamp
      ├── isSeen: boolean
      └── seenBy: { [userId]: boolean }

chats/{userId}_{roomId}/
  ├── roomId: string
  ├── name: string
  ├── avatar: string
  ├── lastMessage: object
  ├── unseenCount: number
  └── createdAt: timestamp
```

### 4. Hook Integration (`src/hooks/useUnreadMessages.ts`)

Custom hook for managing unread messages:

```typescript
const useUnreadMessages = () => {
  // Returns current unread count
  return { unreadCount };
};
```

## Usage Examples

### 1. Initializing Badge System

```typescript
import { initializeBadgeSystem } from '../utils/badgeUtils';

// Initialize in App.tsx or main component
useEffect(() => {
  initializeBadgeSystem();
}, []);
```

### 2. Updating Badge Count

```typescript
import { updateAppIconBadge } from '../utils/badgeUtils';

// Update badge when unread count changes
useEffect(() => {
  updateAppIconBadge(totalUnreadCount);
}, [totalUnreadCount]);
```

### 3. Marking Messages as Read

```typescript
import { markChatAsRead } from '../redux/slices/chatsSlice';
import { markMessagesAsRead } from '../services/firebase/chat';

// When entering chat room
const handleEnterChatRoom = async (roomId, userId, friendId) => {
  // Mark in Firebase
  await markMessagesAsRead(roomId, userId);
  
  // Mark in Redux store
  dispatch(markChatAsRead(friendId));
};
```

### 4. Displaying Individual Chat Badges

```typescript
// In chat list component
{chat.unseenCount > 0 && (
  <View style={styles.unreadBadge}>
    <Text style={styles.unreadText}>
      {chat.unseenCount > 99 ? '99+' : chat.unseenCount}
    </Text>
  </View>
)}
```

## Data Flow

1. **Message Received**: Firebase listener detects new message
2. **Redux Update**: Chat list updated with new message and incremented unread count
3. **Badge Update**: App icon badge updated automatically via Redux action
4. **UI Update**: Chat list shows individual unread counts
5. **Read Action**: User enters chat room, messages marked as read
6. **Count Decrease**: Badge count decreases automatically

## Configuration

### Notification System

The notification system is currently **disabled** (commented out) as requested. Only badge functionality is active:

```typescript
// In NotificationHelper.ts
configure() {
  // NOTIFICATION FEATURE DISABLED - Only badge functionality enabled
  console.log('Notification system disabled - badge functionality only');
}
```

### Badge Display Format

- Counts 1-99: Display exact number
- Counts > 99: Display "99+"
- Count 0: No badge shown

## Error Handling

All badge operations include comprehensive error handling:

```typescript
try {
  updateAppIconBadge(count);
} catch (error) {
  console.error('Error updating badge:', error);
}
```

## Performance Considerations

1. **Real-time Updates**: Uses Firebase listeners for efficient real-time updates
2. **Redux State**: Centralized state management prevents unnecessary re-renders
3. **Badge Caching**: Badge counts persist across app sessions
4. **Optimistic Updates**: UI updates immediately, syncs with server in background

## Testing

The badge system can be tested by:

1. Sending messages between users
2. Verifying badge counts update in real-time
3. Checking that entering chat rooms marks messages as read
4. Confirming badge counts persist after app restart

## Future Enhancements

1. **Push Notifications**: Re-enable notification system when needed
2. **Badge Customization**: Allow users to customize badge appearance
3. **Notification Settings**: Per-chat notification preferences
4. **Badge Analytics**: Track badge interaction patterns

