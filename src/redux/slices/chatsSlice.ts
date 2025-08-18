import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getChatList as apiGetChatList } from '../../services/firebase/chat';

type Chat = { id: string; name: string; lastMessage?: string; avatar?: string };

type ChatsState = { list: Chat[]; loading: boolean; error?: string | null };

const initialState: ChatsState = { list: [], loading: false, error: null };

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
      })
      .addCase(getChatList.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setChats } = chatsSlice.actions;
export default chatsSlice.reducer;
