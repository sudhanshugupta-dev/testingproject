import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getChatList as apiGetChatList } from '../../services/firebase/chat';

type Chat = { 
  id: string; 
  name: string; 
  lastMessage?: string; 
  avatar?: string;
  unreadCount?: number;
  isRead?: boolean;
  timestamp?: string;
};

type ChatsState = { 
  list: Chat[]; 
  loading: boolean; 
  error?: string | null;
  unreadCount: number;
};

const initialState: ChatsState = { list: [], loading: false, error: null, unreadCount: 0 };

export const getChatList = createAsyncThunk('chats/getChatList', async (_, { rejectWithValue }) => {
  try {
    const data = await apiGetChatList();
    return data as Chat[];
  } catch (e: any) {
    return rejectWithValue(e?.message || 'Failed to fetch chats');
  }
});

const chatsSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.list = action.payload;
      state.unreadCount = action.payload.reduce((total, chat) => total + (chat.unreadCount || 0), 0);
    },
    markChatAsRead: (state, action: PayloadAction<string>) => {
      const chat = state.list.find(c => c.id === action.payload);
      if (chat) {
        state.unreadCount -= (chat.unreadCount || 0);
        chat.unreadCount = 0;
        chat.isRead = true;
      }
    },
    updateChatMessage: (state, action: PayloadAction<{chatId: string, message: string, isFromCurrentUser: boolean}>) => {
      const { chatId, message, isFromCurrentUser } = action.payload;
      const chat = state.list.find(c => c.id === chatId);
      if (chat) {
        chat.lastMessage = message;
        chat.timestamp = new Date().toISOString();
        if (!isFromCurrentUser) {
          chat.unreadCount = (chat.unreadCount || 0) + 1;
          chat.isRead = false;
          state.unreadCount += 1;
        }
      }
    },
    resetUnreadCount: (state) => {
      state.unreadCount = 0;
      state.list.forEach(chat => {
        chat.unreadCount = 0;
        chat.isRead = true;
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getChatList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getChatList.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
        state.unreadCount = action.payload.reduce((total, chat) => total + (chat.unreadCount || 0), 0);
      })
      .addCase(getChatList.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setChats, markChatAsRead, updateChatMessage, resetUnreadCount } = chatsSlice.actions;
export default chatsSlice.reducer;
