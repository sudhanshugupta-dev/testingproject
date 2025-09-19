// import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// import {  listenToChatList as apiGetChatList } from '../../services/firebase/chat';

// type Chat = { 
//   id: string; 
//   name: string; 
//   lastMessage?: string; 
//   avatar?: string;
//   unreadCount?: number;
//   isRead?: boolean;
//   timestamp?: string;
// };

// type ChatsState = { 
//   list: Chat[]; 
//   loading: boolean; 
//   error: string | null; // Changed to string | null
//   unreadCount: number;
// };

// const initialState: ChatsState = { list: [], loading: false, error: null, unreadCount: 0 };

// export const getChatList = createAsyncThunk('chats/getChatList', async (_, { rejectWithValue }) => {
//   try {
//     const data = await apiGetChatList();
//     return data as Chat[];
//   } catch (e: any) {
//     return rejectWithValue(e?.message || 'Failed to fetch chats');
//   }
// });

// const chatsSlice = createSlice({
//   name: 'chats',
//   initialState,
//   reducers: {
//     setChats: (state, action: PayloadAction<Chat[]>) => {
//       state.list = action.payload;
//       state.unreadCount = action.payload.reduce((total, chat) => total + (chat.unreadCount || 0), 0);
//     },
//     markChatAsRead: (state, action: PayloadAction<string>) => {
//       const chat = state.list.find(c => c.id === action.payload);
//       if (chat) {
//         state.unreadCount -= (chat.unreadCount || 0);
//         chat.unreadCount = 0;
//         chat.isRead = true;
//       }
//     },
//     updateChatMessage: (
//       state,
//       action: PayloadAction<{
//         chatId: string;
//         message: string;
//         isFromCurrentUser: boolean;
//         replyTo?: { text: string }; // Added replyTo for reply message context
//       }>,
//     ) => {
//       const { chatId, message, isFromCurrentUser, replyTo } = action.payload;
//       const chat = state.list.find(c => c.id === chatId);
//       if (chat) {
//         chat.lastMessage = replyTo ? `Replied to "${replyTo.text}": ${message}` : message;
//         chat.timestamp = new Date().toISOString();
//         if (!isFromCurrentUser) {
//           chat.unreadCount = (chat.unreadCount || 0) + 1;
//           chat.isRead = false;
//           state.unreadCount += 1;
//         }
//       }
//     },
//     resetUnreadCount: (state) => {
//       state.unreadCount = 0;
//       state.list.forEach(chat => {
//         chat.unreadCount = 0;
//         chat.isRead = true;
//       });
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(getChatList.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(getChatList.fulfilled, (state, action) => {
//         state.loading = false;
//         state.list = action.payload;
//         state.unreadCount = action.payload.reduce((total, chat) => total + (chat.unreadCount || 0), 0);
//       })
//       .addCase(getChatList.rejected, (state, action: any) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const { setChats, markChatAsRead, updateChatMessage, resetUnreadCount } = chatsSlice.actions;
// export default chatsSlice.reducer;




import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppDispatch } from '../store'; // adjust path if needed
import { listenToChatList } from '../../services/firebase/chat';
import { updateAppIconBadge, calculateTotalUnreadCount } from '../../utils/badgeUtils';

// ---- Types ----
export type Chat = {
  id: string;
  name: string;
  email?: string;
  avatar?: string | null;
  roomId: string;
  lastMessage?: {
    text: string;
    timestamp: any;
    senderId: string;
    isSeen: boolean;
  } | null;
  unseenCount: number;
};

type ChatsState = {
  list: Chat[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
};

const initialState: ChatsState = {
  list: [],
  loading: false,
  error: null,
  unreadCount: 0,
};

// ---- Slice ----
const chatsSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.list = action.payload;
      state.unreadCount = calculateTotalUnreadCount(action.payload);
      
      // Update app icon badge whenever chat list changes
      updateAppIconBadge(state.unreadCount);
    },
    markChatAsRead: (state, action: PayloadAction<string>) => {
      const chat = state.list.find(c => c.id === action.payload);
      if (chat) {
        state.unreadCount -= chat.unseenCount || 0;
        chat.unseenCount = 0;
        if (chat.lastMessage) chat.lastMessage.isSeen = true;
        
        // Update app icon badge after marking chat as read
        updateAppIconBadge(state.unreadCount);
      }
    },
    updateChatMessage: (
      state,
      action: PayloadAction<{
        chatId: string;
        message: string;
        isFromCurrentUser: boolean;
        replyTo?: { text: string };
      }>,
    ) => {
      const { chatId, message, isFromCurrentUser, replyTo } = action.payload;
      const chat = state.list.find(c => c.id === chatId);
      if (chat) {
        chat.lastMessage = {
          text: replyTo
            ? `Replied to "${replyTo.text}": ${message}`
            : message,
          timestamp: new Date(),
          senderId: isFromCurrentUser ? 'me' : chat.id,
          isSeen: isFromCurrentUser,
        };
        if (!isFromCurrentUser) {
          chat.unseenCount = (chat.unseenCount || 0) + 1;
          state.unreadCount += 1;
          
          // Update app icon badge when new message arrives
          updateAppIconBadge(state.unreadCount);
        }
      }
    },
    resetUnreadCount: state => {
      state.unreadCount = 0;
      state.list.forEach(chat => {
        chat.unseenCount = 0;
        if (chat.lastMessage) chat.lastMessage.isSeen = true;
      });
      
      // Update app icon badge after resetting all counts
      updateAppIconBadge(0);
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setChats,
  markChatAsRead,
  updateChatMessage,
  resetUnreadCount,
  setError,
  setLoading,
} = chatsSlice.actions;

export default chatsSlice.reducer;

// ---- Real-time Thunk ----
let unsubscribeChatList: (() => void) | null = null;

/**
 * Start listening to chat list in real-time
 */
export const startChatListListener = () => (dispatch: AppDispatch) => {
  dispatch(setLoading(true));
 
  try {
    unsubscribeChatList?.(); // clear previous listener
    unsubscribeChatList = listenToChatList(chatList => {
      dispatch(setChats(chatList));
      dispatch(setLoading(false));
    });
  } catch (err: any) {
    dispatch(setError(err.message || 'Failed to listen to chats'));
  }
};

/**
 * Stop listening to chat list
 */
export const stopChatListListener = () => () => {
  if (unsubscribeChatList) {
    unsubscribeChatList();
    unsubscribeChatList = null;
  }
};
